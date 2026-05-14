import { database } from './localDatabase';
import { SyncQueue } from './localDatabase';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase'; // assuming you have a supabase client

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
        // First send metadata (assuming supabase RPC or REST endpoint)
        const { error: metaError } = await supabase.from('dmrv_entries').insert(payload.metadata);
        if (metaError) throw metaError;
        // Then upload any attached photos (if any)
        if (payload.photos && payload.photos.length) {
          const form = new FormData();
          payload.photos.forEach((photo: any, idx: number) => {
            form.append(`photo_${idx}`, photo.file, photo.filename);
            form.append(`photo_${idx}_metadata`, JSON.stringify(photo.metadata));
          });
          const { error: photoError } = await supabase.storage
            .from('photos')
            .upload(`sync/${item.idempotencyKey}/bundle`, form);
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
