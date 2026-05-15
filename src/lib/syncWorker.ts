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
    const syncQueueCollection = database.get<SyncQueue>('sync_queue');
    const pending = await syncQueueCollection.query().fetch();
    for (const item of pending) {
      if (item.status !== 'PENDING') continue;
      try {
        const payload = JSON.parse(item.payload);
        
        // 1. Textual Metadata First (with Idempotency via UPSERT)
        const { error: metaError } = await supabase
          .from('scans')
          .upsert([{ ...payload.metadata, id: item.idempotencyKey }], { onConflict: 'id' });
          
        if (metaError) throw metaError;
        
        // 2. Binary Separation: Upload Images only after metadata success
        if (payload.photos && payload.photos.length) {
          const form = new FormData();
          payload.photos.forEach((photo: any, idx: number) => {
            const blob = dataURLtoBlob(photo.file);
            form.append(`photo_${idx}`, blob, photo.filename);
            form.append(`photo_${idx}_metadata`, JSON.stringify(photo.metadata));
          });
          
          const { error: photoError } = await supabase.storage
            .from('photos')
            .upload(`sync/${item.idempotencyKey}/bundle`, form, { upsert: true });
            
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
  // Also run immediately in case we are already online
  if (navigator.onLine) processQueue();
}
