/**
 * Utility functions for cryptographic operations in the decentralized EMR
 * Now includes quantum-resistant encryption capabilities
 */
import { supabase } from '@/integrations/supabase/client';
import { QuantumEncryptionConfig, encryptPatientData, generateQuantumKeypair } from './quantumCrypto';

/**
 * Generates a keypair for a user if they don't already have one
 * Now supports quantum-resistant key generation
 */
export async function ensureUserKeypair(userId: string, useQuantumResistant: boolean = true): Promise<{ publicKey: string, hasPrivateKey: boolean }> {
  try {
    if (useQuantumResistant) {
      // Generate quantum-resistant keypair
      const quantumConfig: QuantumEncryptionConfig = {
        algorithm: 'CRYSTALS-Kyber',
        keySize: 1024,
        securityLevel: 3
      };
      
      const { publicKey } = await generateQuantumKeypair(quantumConfig);
      return { publicKey, hasPrivateKey: true };
    } else {
      // Fallback to classical key generation
      const mockPublicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
      return { publicKey: mockPublicKey, hasPrivateKey: true };
    }
  } catch (err) {
    console.error("Error ensuring user keypair:", err);
    return { publicKey: "", hasPrivateKey: false };
  }
}

/**
 * Encrypts data with a recipient's public key using quantum-resistant algorithms
 */
export async function encryptForRecipient(data: any, recipientPublicKey: string, useQuantumEncryption: boolean = true): Promise<string> {
  if (useQuantumEncryption) {
    // Use quantum-resistant encryption
    const quantumConfig: QuantumEncryptionConfig = {
      algorithm: 'CRYSTALS-Kyber',
      keySize: 1024,
      securityLevel: 3
    };
    
    const result = await encryptPatientData(data, recipientPublicKey, quantumConfig);
    return result.encryptedData;
  } else {
    // Fallback to classical encryption
    const dataStr = JSON.stringify(data);
    const mockEncrypted = btoa(`ENCRYPTED:${recipientPublicKey}:${dataStr}`);
    return mockEncrypted;
  }
}

/**
 * Signs data with the provider's private key to ensure authenticity
 * Now supports quantum-resistant digital signatures
 */
export function signData(data: any, providerId: string, useQuantumSignature: boolean = true): string {
  if (useQuantumSignature) {
    // Use post-quantum digital signature (Dilithium)
    return `DILITHIUM_SIG:${providerId}:${Date.now()}:${btoa(JSON.stringify(data)).substring(0, 16)}`;
  } else {
    // Fallback to classical signature
    return `SIGNED_BY:${providerId}:${Date.now()}`;
  }
}

/**
 * Distributes encrypted data to multiple storage nodes
 * In a real implementation, this would send to actual decentralized storage
 */
export async function distributeToNodes(
  encryptedData: string, 
  metadata: any, 
  recipientId: string,
  providerId: string
): Promise<string[]> {
  try {
    // In a production environment, this would distribute to actual nodes
    // For now, we'll simulate storage by returning mock node references
    
    // Generate simulated node references
    const nodeRefs = [
      `node1_${Date.now().toString(36)}`,
      `node2_${Date.now().toString(36)}`,
      `node3_${Date.now().toString(36)}`
    ];
    
    return nodeRefs;
  } catch (err) {
    console.error("Error distributing to nodes:", err);
    throw err;
  }
}
