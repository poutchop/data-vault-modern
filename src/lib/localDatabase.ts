import { Database } from '@nozbe/watermelondb';
import { appSchema, tableSchema } from '@nozbe/watermelondb';
// @ts-ignore
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';

// Schemas
const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [{ name: 'name', type: 'string' }, { name: 'email', type: 'string' }],
    }),
    tableSchema({
      name: 'cooperatives',
      columns: [{ name: 'name', type: 'string' }],
    }),
    tableSchema({
      name: 'polygons',
      columns: [{ name: 'geojson', type: 'string' }, { name: 'cooperative_id', type: 'string', isIndexed: true }],
    }),
    tableSchema({
      name: 'asset_points',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'polygon_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'uri', type: 'string' },
        { name: 'asset_point_id', type: 'string', isIndexed: true },
        { name: 'metadata', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'payload', type: 'string' },
        { name: 'status', type: 'string' }, // PENDING, COMPLETED, FAILED
        { name: 'created_at', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'idempotency_key', type: 'string' },
      ],
    }),
  ],
});

// Model definitions (simplified)
export class User extends Model {
  static table = 'users';
  @field('name') name!: string;
  @field('email') email!: string;
}

export class Cooperative extends Model {
  static table = 'cooperatives';
  @field('name') name!: string;
}

export class Polygon extends Model {
  static table = 'polygons';
  @field('geojson') geojson!: string;
  @relation('cooperatives', 'cooperative_id') cooperative!: Cooperative;
}

export class AssetPoint extends Model {
  static table = 'asset_points';
  @field('type') type!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @relation('polygons', 'polygon_id') polygon!: Polygon;
}

export class Photo extends Model {
  static table = 'photos';
  @field('uri') uri!: string;
  @field('metadata') metadata!: string;
  @relation('asset_points', 'asset_point_id') assetPoint!: AssetPoint;
}

export class SyncQueue extends Model {
  static table = 'sync_queue';
  @field('payload') payload!: string; // JSON string of the entry
  @field('status') status!: string;
  @field('created_at') createdAt!: number;
  @field('retry_count') retryCount!: number;
  @field('idempotency_key') idempotencyKey!: string;
}

// Adapter & Database
const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true
});
export const database = new Database({
  adapter,
  modelClasses: [User, Cooperative, Polygon, AssetPoint, Photo, SyncQueue],
});

// Helper to run a transaction safely
export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const batch = database.batch();
  try {
    const result = await fn();
    await batch;
    return result;
  } catch (e) {
    // WatermelonDB automatically rolls back on error inside a transaction
    throw e;
  }
}
