import { database } from './localDatabase';
import { SyncQueue } from './localDatabase';

let workerInstance: Worker | null = null;

export function startSyncWorker() {
  if (typeof window === 'undefined') return;

  if (!workerInstance) {
    workerInstance = new Worker(new URL('../workers/sync.worker.ts', import.meta.url), { type: 'module' });
    
    workerInstance.onmessage = async (event) => {
      const { status, idempotencyKey, error } = event.data;
      if (!idempotencyKey) return;

      const syncQueueCollection = database.get<SyncQueue>('sync_queue');
      const records = await syncQueueCollection.query().fetch();
      const item = records.find(r => r.idempotencyKey === idempotencyKey);

      if (item) {
        await database.write(async () => {
          if (status === 'success') {
            await item.update((record) => {
              record.status = 'COMPLETED';
            });
          } else {
            console.error('Worker failed for', idempotencyKey, error);
            await item.update((record) => {
              record.retryCount += 1;
              if (record.retryCount >= 5) {
                record.status = 'FAILED';
              }
            });
          }
        });
      }
    };
  }

  const processQueue = async () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isFastNetwork = connection ? (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') : true;

    const syncQueueCollection = database.get<SyncQueue>('sync_queue');
    const pending = await syncQueueCollection.query().fetch();
    const sortedPending = pending.sort((a, b) => a.priority - b.priority);

    for (const item of sortedPending) {
      if (item.status !== 'PENDING') continue;

      if (item.priority === 2 && !isFastNetwork) {
        console.log(`Deferring media upload ${item.idempotencyKey} due to slow network.`);
        continue; 
      }

      try {
        const payload = item.decryptedPayload;
        if (!payload) throw new Error("AES Decryption failed");

        // Dispatch offloaded task to Web Worker
        workerInstance?.postMessage({
          type: payload.type,
          payload: payload.type === 'metadata' ? payload.data : payload,
          idempotencyKey: item.idempotencyKey
        });

      } catch (e) {
        console.error('Sync error dispatching item', item.id, e);
      }
    }
  };

  window.addEventListener('online', processQueue);
  
  const connection = (navigator as any).connection;
  if (connection && connection.addEventListener) {
    connection.addEventListener('change', processQueue);
  }

  if (navigator.onLine) processQueue();
}
