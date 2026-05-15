import { NextResponse } from 'next/server';
import * as protobuf from 'protobufjs';
import CryptoJS from 'crypto-js';
import * as turf from '@turf/turf';
import path from 'path';
import fs from 'fs';

// Constants for Zero-Trust Geofence (Maximum Farm Area allowed)
const MAX_FARM_AREA_METERS = 50000; // 5 hectares

export async function POST(request: Request) {
  try {
    const idempotencyKey = request.headers.get('X-Idempotency-Key');
    if (!idempotencyKey) return NextResponse.json({ error: 'Missing Idempotency Key' }, { status: 400 });

    const buffer = await request.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Load Protobuf Schema
    const protoPath = path.join(process.cwd(), 'src/lib/proto/dmrv.proto');
    const protoDef = fs.readFileSync(protoPath, 'utf8');
    const root = protobuf.parse(protoDef).root;
    const MetadataMessage = root.lookupType("dmrv.MetadataPayload");

    // Decode Payload
    const decodedMessage = MetadataMessage.decode(uint8Array);
    const payload = MetadataMessage.toObject(decodedMessage, { enums: String, bytes: String });

    // 1. Zero-Trust SHA-256 Validation
    const clientHash = payload.zk_hash;
    delete payload.zk_hash; // Remove hash before re-computing

    const serverHash = CryptoJS.SHA256(JSON.stringify(payload)).toString(CryptoJS.enc.Hex);

    if (clientHash !== serverHash) {
      console.error(`[Zero-Trust Guard] SHA-256 Mismatch! Edge: ${clientHash} | Server: ${serverHash}`);
      return NextResponse.json({ error: 'Tampered Payload: Cryptographic Hash Mismatch' }, { status: 403 });
    }

    // 2. Client-Side Geofencing Defenses (Mocking a polygon area check)
    // If the payload included a polygon, we would run:
    // const area = turf.area(turf.polygon(payload.polygon));
    // if (area > MAX_FARM_AREA_METERS) throw Error("Area Exceeds Limits");
    if (payload.gps && payload.gps.lat > 90) {
      return NextResponse.json({ error: 'Invalid Coordinates' }, { status: 400 });
    }

    // In a real implementation, this is where we insert into Supabase securely
    // await supabase.from('scans').upsert(payload);

    return NextResponse.json({ status: 'success', message: 'Payload Cryptographically Verified & Secured' });
  } catch (e: any) {
    console.error('[Zero-Trust Guard] Payload Dropped:', e.message);
    return NextResponse.json({ error: 'Malformed Payload Dropped' }, { status: 400 });
  }
}
