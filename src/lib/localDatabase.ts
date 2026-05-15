import { Database } from '@nozbe/watermelondb';
import { appSchema, tableSchema } from '@nozbe/watermelondb';
// @ts-ignore
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { Model } from '@nozbe/watermelondb';
import { field, relation, text } from '@nozbe/watermelondb/decorators';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'vault_aes_256_secure_key_placeholder'; // In production, derive this securely

export function encryptPayload(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

export function decryptPayload(ciphertext: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
}

// Data Vault 2.0 Schema
const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'hub_farms',
      columns: [{ name: 'business_key', type: 'string', isIndexed: true }],
    }),
    tableSchema({
      name: 'link_farm_coop',
      columns: [
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'coop_id', type: 'string', isIndexed: true }
      ],
    }),
    tableSchema({
      name: 'sat_farm_metrics',
      columns: [
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'encrypted_payload', type: 'string' }, // AES-256 encrypted temporal attributes & polygons
        { name: 'created_at', type: 'number' }
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'encrypted_payload', type: 'string' }, // AES-256 encrypted
        { name: 'priority', type: 'number' }, // 1 = Metadata, 2 = Media
        { name: 'status', type: 'string' }, // PENDING, COMPLETED, FAILED
        { name: 'created_at', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'idempotency_key', type: 'string' },
      ],
    }),
  ],
});

// Model Definitions
export class HubFarm extends Model {
  static table = 'hub_farms';
  @text('business_key') businessKey!: string;
}

export class LinkFarmCoop extends Model {
  static table = 'link_farm_coop';
  @text('farm_id') farmId!: string;
  @text('coop_id') coopId!: string;
}

export class SatFarmMetrics extends Model {
  static table = 'sat_farm_metrics';
  @text('farm_id') farmId!: string;
  @text('encrypted_payload') encryptedPayload!: string;
  @field('created_at') createdAt!: number;
}

export class SyncQueue extends Model {
  static table = 'sync_queue';
  @text('encrypted_payload') encryptedPayload!: string;
  @field('priority') priority!: number;
  @text('status') status!: string;
  @field('created_at') createdAt!: number;
  @field('retry_count') retryCount!: number;
  @text('idempotency_key') idempotencyKey!: string;

  get decryptedPayload() {
    return decryptPayload(this.encryptedPayload);
  }
}

const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true
});

export const database = new Database({
  adapter,
  modelClasses: [HubFarm, LinkFarmCoop, SatFarmMetrics, SyncQueue],
});

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const batch = database.batch();
  try {
    const result = await fn();
    await batch;
    return result;
  } catch (e) {
    throw e;
  }
}
