/**
 * Hybrid Encryption Service
 * Combines classical AES encryption with quantum-safe Kyber/ML-KEM
 * Provides double-layer protection against both classical and quantum attacks
 */

import { kyberEncrypt, kyberDecrypt } from '@/utils/pq-kyber';
import { mlkemEncapsulate, mlkemDecapsulate } from '@/utils/pq-mlkem';
import { quantumKeyManager } from './QuantumKeyManager';

export interface HybridEncryptedData {
  algorithm: 'hybrid-aes-kyber' | 'hybrid-aes-mlkem';
  quantumCiphertext: string; // Quantum-encrypted AES key
  classicalCiphertext: string; // AES-encrypted data
  iv: string;
  timestamp: string;
  keyId: string;
}

export interface EncryptionMetrics {
  keyGenTime: number;
  quantumEncryptTime: number;
  classicalEncryptTime: number;
  totalTime: number;
  dataSize: number;
  encryptedSize: number;
}

export class HybridEncryptionService {
  /**
   * Encrypt data using hybrid classical + quantum-safe encryption
   */
  static async encryptHybrid(
    data: string | object,
    algorithm: 'kyber' | 'mlkem' = 'mlkem'
  ): Promise<{ encrypted: HybridEncryptedData; metrics: EncryptionMetrics }> {
    const startTime = performance.now();
    const metrics: Partial<EncryptionMetrics> = {};

    try {
      // 1. Generate AES key for classical encryption
      const keyGenStart = performance.now();
      const aesKey = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
      metrics.keyGenTime = performance.now() - keyGenStart;

      // 2. Classical encryption with AES-GCM
      const classicalStart = performance.now();
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const dataBytes = new TextEncoder().encode(dataString);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        aesKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBytes
      );

      const classicalCiphertext = Array.from(new Uint8Array(encryptedData))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      metrics.classicalEncryptTime = performance.now() - classicalStart;

      // 3. Get current quantum key
      const currentKey = await quantumKeyManager.getCurrentKey();
      if (!currentKey) {
        throw new Error('No quantum key available - initialize key manager first');
      }

      // 4. Quantum-safe encryption of AES key
      const quantumStart = performance.now();
      const aesKeyHex = Array.from(aesKey)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      let quantumCiphertext: string;
      let algorithmName: HybridEncryptedData['algorithm'];

      if (algorithm === 'mlkem') {
        // Use ML-KEM for quantum encryption
        const { ciphertext } = await mlkemEncapsulate(currentKey.publicKey);
        // In real implementation, we'd use the shared secret to encrypt the AES key
        // For now, we'll use the existing Kyber implementation
        quantumCiphertext = await kyberEncrypt(aesKeyHex, currentKey.publicKey);
        algorithmName = 'hybrid-aes-mlkem';
      } else {
        quantumCiphertext = await kyberEncrypt(aesKeyHex, currentKey.publicKey);
        algorithmName = 'hybrid-aes-kyber';
      }
      metrics.quantumEncryptTime = performance.now() - quantumStart;

      // 5. Create hybrid encrypted data structure
      const result: HybridEncryptedData = {
        algorithm: algorithmName,
        quantumCiphertext,
        classicalCiphertext,
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        timestamp: new Date().toISOString(),
        keyId: currentKey.id
      };

      const totalTime = performance.now() - startTime;
      const completeMetrics: EncryptionMetrics = {
        keyGenTime: metrics.keyGenTime || 0,
        quantumEncryptTime: metrics.quantumEncryptTime || 0,
        classicalEncryptTime: metrics.classicalEncryptTime || 0,
        totalTime,
        dataSize: dataBytes.length,
        encryptedSize: JSON.stringify(result).length
      };

      console.log('Hybrid encryption completed:', {
        algorithm: algorithmName,
        keyId: currentKey.id,
        metrics: completeMetrics
      });

      return { encrypted: result, metrics: completeMetrics };

    } catch (error) {
      console.error('Hybrid encryption failed:', error);
      throw new Error(`Hybrid encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using hybrid classical + quantum-safe decryption
   */
  static async decryptHybrid(
    encryptedData: HybridEncryptedData
  ): Promise<{ data: string; metrics: EncryptionMetrics }> {
    const startTime = performance.now();
    const metrics: Partial<EncryptionMetrics> = {};

    try {
      // 1. Get the key used for encryption
      const currentKey = await quantumKeyManager.getCurrentKey();
      if (!currentKey || currentKey.id !== encryptedData.keyId) {
        throw new Error('Quantum key not available or key ID mismatch');
      }

      // 2. Quantum-safe decryption of AES key
      const quantumStart = performance.now();
      const aesKeyHex = await kyberDecrypt(encryptedData.quantumCiphertext, currentKey.privateKey);
      const aesKey = new Uint8Array(
        aesKeyHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      metrics.quantumEncryptTime = performance.now() - quantumStart;

      // 3. Classical decryption with AES-GCM
      const classicalStart = performance.now();
      const iv = new Uint8Array(
        encryptedData.iv.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      
      const encryptedBytes = new Uint8Array(
        encryptedData.classicalCiphertext.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
      );

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        aesKey,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encryptedBytes
      );

      const dataString = new TextDecoder().decode(decryptedData);
      metrics.classicalEncryptTime = performance.now() - classicalStart;

      const totalTime = performance.now() - startTime;
      const completeMetrics: EncryptionMetrics = {
        keyGenTime: 0,
        quantumEncryptTime: metrics.quantumEncryptTime || 0,
        classicalEncryptTime: metrics.classicalEncryptTime || 0,
        totalTime,
        dataSize: dataString.length,
        encryptedSize: JSON.stringify(encryptedData).length
      };

      console.log('Hybrid decryption completed:', {
        algorithm: encryptedData.algorithm,
        keyId: encryptedData.keyId,
        metrics: completeMetrics
      });

      return { data: dataString, metrics: completeMetrics };

    } catch (error) {
      console.error('Hybrid decryption failed:', error);
      throw new Error(`Hybrid decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt medical record with hybrid encryption
   */
  static async encryptMedicalRecord(
    record: any,
    algorithm: 'kyber' | 'mlkem' = 'mlkem'
  ): Promise<{ encrypted_data: string; iv: string; metadata: any }> {
    try {
      const { encrypted, metrics } = await this.encryptHybrid(record, algorithm);
      
      return {
        encrypted_data: JSON.stringify(encrypted),
        iv: 'hybrid_encrypted',
        metadata: {
          algorithm: encrypted.algorithm,
          keyId: encrypted.keyId,
          timestamp: encrypted.timestamp,
          metrics,
          quantumSafe: true
        }
      };
    } catch (error) {
      console.error('Medical record hybrid encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt medical record with hybrid encryption
   */
  static async decryptMedicalRecord(
    encrypted_data: string,
    iv: string
  ): Promise<any> {
    try {
      if (iv !== 'hybrid_encrypted') {
        throw new Error('Not a hybrid encrypted record');
      }

      const encryptedData: HybridEncryptedData = JSON.parse(encrypted_data);
      const { data } = await this.decryptHybrid(encryptedData);
      
      try {
        return JSON.parse(data);
      } catch {
        return data; // Return as string if not JSON
      }
    } catch (error) {
      console.error('Medical record hybrid decryption failed:', error);
      throw error;
    }
  }

  /**
   * Benchmark hybrid encryption performance
   */
  static async benchmarkPerformance(
    testData: string = 'Test data for performance benchmarking',
    iterations: number = 10
  ): Promise<{
    averageEncryptTime: number;
    averageDecryptTime: number;
    averageKeyGenTime: number;
    averageQuantumTime: number;
    averageClassicalTime: number;
    compressionRatio: number;
  }> {
    const results = {
      encryptTimes: [] as number[],
      decryptTimes: [] as number[],
      keyGenTimes: [] as number[],
      quantumTimes: [] as number[],
      classicalTimes: [] as number[],
      originalSize: 0,
      encryptedSize: 0
    };

    for (let i = 0; i < iterations; i++) {
      try {
        // Encryption benchmark
        const { encrypted, metrics: encryptMetrics } = await this.encryptHybrid(testData);
        results.encryptTimes.push(encryptMetrics.totalTime);
        results.keyGenTimes.push(encryptMetrics.keyGenTime);
        results.quantumTimes.push(encryptMetrics.quantumEncryptTime);
        results.classicalTimes.push(encryptMetrics.classicalEncryptTime);
        results.originalSize = encryptMetrics.dataSize;
        results.encryptedSize = encryptMetrics.encryptedSize;

        // Decryption benchmark
        const decryptStart = performance.now();
        await this.decryptHybrid(encrypted);
        results.decryptTimes.push(performance.now() - decryptStart);

      } catch (error) {
        console.warn(`Benchmark iteration ${i} failed:`, error);
      }
    }

    const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      averageEncryptTime: average(results.encryptTimes),
      averageDecryptTime: average(results.decryptTimes),
      averageKeyGenTime: average(results.keyGenTimes),
      averageQuantumTime: average(results.quantumTimes),
      averageClassicalTime: average(results.classicalTimes),
      compressionRatio: results.encryptedSize / results.originalSize
    };
  }
}