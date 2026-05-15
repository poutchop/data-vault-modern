import CryptoJS from 'crypto-js';

export interface VerifiableCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: any;
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

/**
 * Generates a W3C Verifiable Credential binding the farmer's identity to the verified land assets.
 * In production, this uses a robust Ed25519 keypair. Here we mock the signature using CryptoJS HMAC.
 */
export async function issueFarmerCredential(
  coopLeaderDid: string,
  farmerDid: string,
  payload: any
): Promise<VerifiableCredential> {
  const issuanceDate = new Date().toISOString();
  
  const vcPayload = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: `urn:uuid:${payload.id || crypto.randomUUID()}`,
    type: ["VerifiableCredential", "CarbonFarmingCredential"],
    issuer: coopLeaderDid,
    issuanceDate,
    credentialSubject: {
      id: farmerDid,
      farmAssets: payload
    }
  };

  // Mock Edge Cryptographic Signing
  // In production, use @digitalbazaar/ed25519-signature-2020
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(vcPayload));
  const signature = CryptoJS.HmacSHA256(`${header}.${body}`, 'ephemeral_edge_secret').toString(CryptoJS.enc.Base64url);

  return {
    ...vcPayload,
    proof: {
      type: "Ed25519Signature2020",
      created: issuanceDate,
      proofPurpose: "assertionMethod",
      verificationMethod: `${coopLeaderDid}#keys-1`,
      jws: `${header}.${body}.${signature}`
    }
  };
}
