import { ZeroTrustSyncGuard } from '../../src/core/network/ZeroTrustSyncGuard';
import * as protobuf from 'protobufjs';

describe('ZeroTrustSyncGuard - Binary Compression & Tamper Tests', () => {
  let root: protobuf.Root;
  let DmrvPayloadMessage: protobuf.Type;

  beforeAll(async () => {
    // Load schema identically to the app for accurate testing
    root = await protobuf.load('src/lib/proto/dmrv.proto');
    DmrvPayloadMessage = root.lookupType('dmrv.v1.DmrvPayload');
  });

  const generateMockPayload = (pointCount: number = 10) => {
    const boundaryPoints = Array.from({ length: pointCount }).map((_, i) => ({
      latitude: 5.7456 + (i * 0.0001),
      longitude: -0.3214 + (i * 0.0001),
      altitude: 100,
      timestamp: Date.now()
    }));

    return {
      payloadId: 'test-payload-123',
      verifierDid: 'did:key:z6MkhaXgBZDvotDkL5257faiztiuC2ZXPu27k6Z2W8P5d',
      farmData: {
        polygonUuid: 'poly-456',
        cooperativeId: 'coop-gh-east',
        boundaryPoints
      },
      imageSha256Hash: Buffer.from('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'hex'),
      localCommitTimestamp: Date.now()
    };
  };

  it('Binary Compression Test: Serializes 10 GPS coordinates into < 1 KB payload', () => {
    const rawPayload = generateMockPayload(10);
    const jsonString = JSON.stringify(rawPayload);
    
    // Verify JSON size for baseline context (usually ~1.5 KB)
    const jsonSize = Buffer.byteLength(jsonString, 'utf8');

    // Serialize using Protobuf
    const errMsg = DmrvPayloadMessage.verify(rawPayload);
    if (errMsg) throw Error(errMsg);
    
    const message = DmrvPayloadMessage.create(rawPayload);
    const binaryBuffer = DmrvPayloadMessage.encode(message).finish();
    const binarySize = binaryBuffer.length;

    console.log(`JSON Size: ${jsonSize} bytes | Protobuf Size: ${binarySize} bytes`);

    // Assert binary footprint is strictly under 1 KB (1024 bytes)
    expect(binarySize).toBeLessThan(1024);
    
    // Assert we achieved significant compression vs JSON
    expect(binarySize).toBeLessThan(jsonSize);
  });

  it('Tamper Attack Simulation: Flags missing verifier signature', async () => {
    const rawPayload = generateMockPayload(10);
    // Tamper: Remove the DID signature required for verification
    rawPayload.verifierDid = '';

    const message = DmrvPayloadMessage.create(rawPayload);
    const binaryBuffer = DmrvPayloadMessage.encode(message).finish();

    const isValid = await ZeroTrustSyncGuard.validateIncomingPayload(binaryBuffer, 'idem-123');
    expect(isValid).toBe(false);
  });

  it('Tamper Attack Simulation: Flags corrupt cryptographic image token', async () => {
    const rawPayload = generateMockPayload(10);
    // Tamper: Provide an invalid hash length (e.g., truncated to 10 bytes instead of 32)
    rawPayload.imageSha256Hash = Buffer.from('a1b2c3d4e5', 'hex');

    const message = DmrvPayloadMessage.create(rawPayload);
    const binaryBuffer = DmrvPayloadMessage.encode(message).finish();

    const isValid = await ZeroTrustSyncGuard.validateIncomingPayload(binaryBuffer, 'idem-123');
    expect(isValid).toBe(false);
  });

  it('Operational Guard: Rejects polygon with less than 3 points (impossible geometry)', async () => {
    const rawPayload = generateMockPayload(2); // Only 2 points

    const message = DmrvPayloadMessage.create(rawPayload);
    const binaryBuffer = DmrvPayloadMessage.encode(message).finish();

    const isValid = await ZeroTrustSyncGuard.validateIncomingPayload(binaryBuffer, 'idem-123');
    expect(isValid).toBe(false);
  });
});
