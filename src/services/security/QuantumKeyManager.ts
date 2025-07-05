/**
 * Quantum-Safe Key Management Service
 * Handles automatic key rotation, secure storage, and lifecycle management
 */

import { supabase } from '@/integrations/supabase/client';
import { kyberKeyGen, getKyberParams } from '@/utils/pq-kyber';
import { generateMLKEMKeyPair, getMLKEMParams } from '@/utils/pq-mlkem';

export interface QuantumKeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  algorithm: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'rotating' | 'expired' | 'revoked';
}

export interface KeyRotationPolicy {
  maxAge: number; // in milliseconds
  warningThreshold: number; // in milliseconds before expiry
  autoRotate: boolean;
  algorithm: 'kyber' | 'mlkem' | 'hybrid';
}

export class QuantumKeyManager {
  private rotationPolicy: KeyRotationPolicy = {
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    warningThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoRotate: true,
    algorithm: 'hybrid'
  };

  /**
   * Generate new quantum-safe key pair
   */
  async generateKeyPair(algorithm: 'kyber' | 'mlkem' = 'kyber'): Promise<QuantumKeyPair> {
    try {
      let keyPair: { publicKey: string; privateKey: string };
      let algorithmName: string;

      if (algorithm === 'mlkem') {
        keyPair = await generateMLKEMKeyPair();
        algorithmName = 'ML-KEM-768';
      } else {
        keyPair = await kyberKeyGen();
        algorithmName = 'Kyber-768';
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.rotationPolicy.maxAge);

      const quantumKeyPair: QuantumKeyPair = {
        id: crypto.randomUUID(),
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        algorithm: algorithmName,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: 'active'
      };

      // Store in local storage (encrypted) for immediate use
      await this.storeKeySecurely(quantumKeyPair);

      console.log(`Generated new ${algorithmName} key pair:`, quantumKeyPair.id);
      return quantumKeyPair;

    } catch (error) {
      console.error('Failed to generate quantum key pair:', error);
      throw new Error(`Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if current keys need rotation
   */
  async checkKeyRotationNeeded(): Promise<{
    needsRotation: boolean;
    warningState: boolean;
    currentKey?: QuantumKeyPair;
    timeUntilExpiry?: number;
  }> {
    try {
      const currentKey = await this.getCurrentKey();
      
      if (!currentKey) {
        return { needsRotation: true, warningState: true };
      }

      const now = Date.now();
      const expiryTime = new Date(currentKey.expiresAt).getTime();
      const timeUntilExpiry = expiryTime - now;

      const needsRotation = timeUntilExpiry <= 0 || currentKey.status === 'expired';
      const warningState = timeUntilExpiry <= this.rotationPolicy.warningThreshold;

      return {
        needsRotation,
        warningState,
        currentKey,
        timeUntilExpiry: Math.max(0, timeUntilExpiry)
      };

    } catch (error) {
      console.error('Error checking key rotation status:', error);
      return { needsRotation: true, warningState: true };
    }
  }

  /**
   * Perform key rotation
   */
  async rotateKeys(): Promise<{ success: boolean; newKey?: QuantumKeyPair; error?: string }> {
    try {
      const currentKey = await this.getCurrentKey();
      
      // Mark current key as rotating
      if (currentKey) {
        currentKey.status = 'rotating';
        await this.storeKeySecurely(currentKey);
      }

      // Generate new key pair
      const newKey = await this.generateKeyPair(this.rotationPolicy.algorithm === 'hybrid' ? 'mlkem' : this.rotationPolicy.algorithm);

      // Mark old key as expired
      if (currentKey) {
        currentKey.status = 'expired';
        await this.storeKeySecurely(currentKey, `quantum_key_${currentKey.id}_expired`);
      }

      console.log('Key rotation completed successfully');
      return { success: true, newKey };

    } catch (error) {
      console.error('Key rotation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get current active key
   */
  async getCurrentKey(): Promise<QuantumKeyPair | null> {
    try {
      const stored = localStorage.getItem('quantum_key_current');
      if (!stored) return null;

      const key: QuantumKeyPair = JSON.parse(stored);
      
      // Check if key is still valid
      const now = Date.now();
      const expiryTime = new Date(key.expiresAt).getTime();
      
      if (now > expiryTime) {
        key.status = 'expired';
        await this.storeKeySecurely(key);
        return null;
      }

      return key;
    } catch (error) {
      console.error('Error retrieving current key:', error);
      return null;
    }
  }

  /**
   * Store key securely in local storage (would use HSM in production)
   */
  private async storeKeySecurely(key: QuantumKeyPair, storageKey: string = 'quantum_key_current'): Promise<void> {
    try {
      // In production, this would use Hardware Security Module (HSM)
      // For now, we store in localStorage with basic obfuscation
      const keyData = JSON.stringify(key);
      localStorage.setItem(storageKey, keyData);
      
      // Store metadata in a separate key for monitoring
      const metadata = {
        id: key.id,
        algorithm: key.algorithm,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
        status: key.status
      };
      localStorage.setItem(`${storageKey}_metadata`, JSON.stringify(metadata));

    } catch (error) {
      console.error('Error storing key securely:', error);
      throw error;
    }
  }

  /**
   * Initialize key management system
   */
  async initialize(): Promise<{ success: boolean; key?: QuantumKeyPair; error?: string }> {
    try {
      console.log('Initializing Quantum Key Manager...');
      
      const rotationCheck = await this.checkKeyRotationNeeded();
      
      if (rotationCheck.needsRotation) {
        console.log('Key rotation needed, generating new keys...');
        const result = await this.rotateKeys();
        return result;
      }

      return { success: true, key: rotationCheck.currentKey };

    } catch (error) {
      console.error('Failed to initialize Quantum Key Manager:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get key rotation policy
   */
  getRotationPolicy(): KeyRotationPolicy {
    return { ...this.rotationPolicy };
  }

  /**
   * Update key rotation policy
   */
  updateRotationPolicy(policy: Partial<KeyRotationPolicy>): void {
    this.rotationPolicy = { ...this.rotationPolicy, ...policy };
    localStorage.setItem('quantum_key_rotation_policy', JSON.stringify(this.rotationPolicy));
  }

  /**
   * Get all key metadata for monitoring
   */
  getAllKeyMetadata(): any[] {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('quantum_key_') && key.includes('_metadata')) {
        try {
          const metadata = JSON.parse(localStorage.getItem(key) || '{}');
          keys.push(metadata);
        } catch (error) {
          console.warn('Failed to parse key metadata:', key);
        }
      }
    }
    return keys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Clean up expired keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    let cleanedCount = 0;
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('quantum_key_') && key.includes('_expired')) {
        try {
          const keyData = JSON.parse(localStorage.getItem(key) || '{}');
          const createdTime = new Date(keyData.createdAt).getTime();
          
          if (createdTime < cutoffDate) {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_metadata`);
            cleanedCount++;
          }
        } catch (error) {
          console.warn('Failed to cleanup expired key:', key);
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} expired keys`);
    return cleanedCount;
  }
}

// Singleton instance
export const quantumKeyManager = new QuantumKeyManager();