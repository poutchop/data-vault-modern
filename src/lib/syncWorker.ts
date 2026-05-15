import { database } from './localDatabase';
import { SyncQueue } from './localDatabase';
import { supabase } from '../lib/supabase'; // assuming you have a supabase client

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type: mime});
}

/**
 * Listen for network changes and process pending sync queue items.
 */
export function startSyncWorker() {
  if (typeof window === 'undefined') return; // no browser

  const processQueue = async () => {
    // Determine network capabilities (Priority 2 Media requires 4g/wifi)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isFastNetwork = connection ? (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') : true;

    const syncQueueCollection = database.get<SyncQueue>('sync_queue');
    const pending = await syncQueueCollection.query().fetch();
    
    // Process Priority 1 (Metadata) first, then Priority 2 (Media)
    const sortedPending = pending.sort((a, b) => a.priority - b.priority);

    for (const item of sortedPending) {
      if (item.status !== 'PENDING') continue;

      // Defer Priority 2 media uploads if network is weak (GPRS/EDGE)
      if (item.priority === 2 && !isFastNetwork) {
        console.log(`Deferring media upload ${item.idempotencyKey} due to slow network.`);
        continue; 
      }

      try {
        const payload = item.decryptedPayload;
        if (!payload) throw new Error("AES Decryption failed or payload is invalid");

        if (payload.type === 'metadata') {
          // Priority 1: Textual Metadata routing
          const { error: metaError } = await supabase
            .from('scans')
            .upsert([payload.data], { onConflict: 'id' });
            
          if (metaError) throw metaError;

        } else if (payload.type === 'media') {
          // Priority 2: Deferred Media Processing
          const blob = dataURLtoBlob(payload.file);
          const form = new FormData();
          form.append('photo', blob, payload.filename);
          form.append('metadata', JSON.stringify(payload.metadata));

          const { error: photoError } = await supabase.storage
            .from('photos')
            .upload(`sync/${item.idempotencyKey}/${payload.filename}`, form, { upsert: true });
            
          if (photoError) throw photoError;
        }
        
        await database.write(async () => {
          await item.update((record) => {
            record.status = 'COMPLETED';
          });
        });
      } catch (e) {
        console.error('Sync worker error for item', item.id, e);
        await database.write(async () => {
          await item.update((record) => {
            record.retryCount = record.retryCount + 1;
            if (record.retryCount >= 5) {
              record.status = 'FAILED';
            }
          });
        });
      }
    }
  };

  // Listen for online events
  window.addEventListener('online', processQueue);
  
  // Optional: Listen for network connection type changes (e.g., edge -> 4g)
  const connection = (navigator as any).connection;
  if (connection && connection.addEventListener) {
    connection.addEventListener('change', processQueue);
  }

  // Also run immediately in case we are already online
  if (navigator.onLine) processQueue();
}
