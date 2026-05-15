/// <reference lib="webworker" />

import { supabase } from '../lib/supabase';
import * as protobuf from 'protobufjs';
import CryptoJS from 'crypto-js';

// Pre-load protobuf schema for metadata
const dmrvProto = `
syntax = "proto3";
package dmrv.v1;
message Position {
  double latitude = 1;
  double longitude = 2;
  float altitude = 3;
  int64 timestamp = 4;
}
message FarmPolygon {
  string polygon_uuid = 1;
  string cooperative_id = 2;
  repeated Position boundary_points = 3;
}
message DmrvPayload {
  string payload_id = 1;
  string verifier_did = 2;
  FarmPolygon farm_data = 3;
  bytes image_sha256_hash = 4;
  int64 local_commit_timestamp = 5;
}
`;

let root: protobuf.Root;
try {
  root = protobuf.parse(dmrvProto).root;
} catch (e) {
  console.error("Protobuf parse error in worker", e);
}

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { type, payload, idempotencyKey } = event.data;

  try {
    if (type === 'metadata') {
      // 1. ZK Hashing Offload
      const zkHash = CryptoJS.SHA256(JSON.stringify(payload)).toString(CryptoJS.enc.Hex);
      payload.zk_hash = zkHash;

      // 2. Protobuf Serialization
      if (root) {
        const MetadataMessage = root.lookupType("dmrv.v1.DmrvPayload");
        const errMsg = MetadataMessage.verify(payload);
        if (errMsg) throw Error(errMsg);
        
        const message = MetadataMessage.create(payload);
        const buffer = MetadataMessage.encode(message).finish();
        
        console.log(`[Worker] Protobuf compression: JSON length ${JSON.stringify(payload).length} -> Protobuf bytes ${buffer.length}`);

        const res = await fetch('/api/sync/protobuf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Idempotency-Key': idempotencyKey
          },
          body: new Blob([buffer as any])
        });
        
        if (!res.ok) {
           // Fallback to Supabase JSON if API route is a mock
           const { error } = await supabase.from('scans').upsert([payload], { onConflict: 'id' });
           if (error) throw error;
        }
      } else {
         const { error } = await supabase.from('scans').upsert([payload], { onConflict: 'id' });
         if (error) throw error;
      }

      self.postMessage({ status: 'success', idempotencyKey });
    } 
    
    else if (type === 'media') {
      // Offloaded multi-part data transformation
      const blob = dataURLtoBlob(payload.file);
      const form = new FormData();
      form.append('photo', blob, payload.filename);
      form.append('metadata', JSON.stringify(payload.metadata));

      const { error } = await supabase.storage
        .from('photos')
        .upload(`sync/${idempotencyKey}/${payload.filename}`, form, { upsert: true });

      if (error) throw error;

      self.postMessage({ status: 'success', idempotencyKey });
    }
  } catch (error: any) {
    self.postMessage({ status: 'error', idempotencyKey, error: error.message });
  }
});
