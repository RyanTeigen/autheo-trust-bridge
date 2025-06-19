
/**
 * Kyber Health Monitoring and Performance Utilities
 * Monitors the health and performance of post-quantum cryptographic operations
 */

import { kyberKeyGen, kyberEncrypt, kyberDecrypt, benchmarkKyberOperations, getKyberParams } from './pq-kyber';

export interface KyberHealthStatus {
  operational: boolean;
  lastCheck: string;
  keyGenWorking: boolean;
  encryptionWorking: boolean;
  decryptionWorking: boolean;
  averageKeyGenTime: number;
  averageEncryptTime: number;
  averageDecryptTime: number;
  errors: string[];
}

let healthStatus: KyberHealthStatus = {
  operational: false,
  lastCheck: '',
  keyGenWorking: false,
  encryptionWorking: false,
  decryptionWorking: false,
  averageKeyGenTime: 0,
  averageEncryptTime: 0,
  averageDecryptTime: 0,
  errors: []
};

/**
 * Perform comprehensive health check of Kyber operations
 */
export async function performKyberHealthCheck(): Promise<KyberHealthStatus> {
  const errors: string[] = [];
  let keyGenWorking = false;
  let encryptionWorking = false;
  let decryptionWorking = false;
  
  const testData = "Health check test data";

  try {
    // Test key generation
    console.log('Testing Kyber key generation...');
    const startKeyGen = performance.now();
    const keypair = await kyberKeyGen();
    const keyGenTime = performance.now() - startKeyGen;
    keyGenWorking = true;
    
    // Test encryption
    console.log('Testing Kyber encryption...');
    const startEncrypt = performance.now();
    const encrypted = await kyberEncrypt(testData, keypair.publicKey);
    const encryptTime = performance.now() - startEncrypt;
    encryptionWorking = true;
    
    // Test decryption
    console.log('Testing Kyber decryption...');
    const startDecrypt = performance.now();
    const decrypted = await kyberDecrypt(encrypted, keypair.privateKey);
    const decryptTime = performance.now() - startDecrypt;
    
    if (decrypted === testData) {
      decryptionWorking = true;
    } else {
      errors.push('Decryption returned incorrect data');
    }

    // Update health status
    healthStatus = {
      operational: keyGenWorking && encryptionWorking && decryptionWorking,
      lastCheck: new Date().toISOString(),
      keyGenWorking,
      encryptionWorking,
      decryptionWorking,
      averageKeyGenTime: keyGenTime,
      averageEncryptTime: encryptTime,
      averageDecryptTime: decryptTime,
      errors
    };

    console.log('Kyber health check completed:', healthStatus);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Health check failed: ${errorMessage}`);
    console.error('Kyber health check failed:', error);
    
    healthStatus = {
      operational: false,
      lastCheck: new Date().toISOString(),
      keyGenWorking,
      encryptionWorking,
      decryptionWorking,
      averageKeyGenTime: 0,
      averageEncryptTime: 0,
      averageDecryptTime: 0,
      errors
    };
  }

  return healthStatus;
}

/**
 * Get current Kyber health status
 */
export function getKyberHealthStatus(): KyberHealthStatus {
  return { ...healthStatus };
}

/**
 * Initialize Kyber subsystem and perform initial health check
 */
export async function initializeKyberSubsystem(): Promise<boolean> {
  console.log('Initializing Kyber post-quantum cryptography subsystem...');
  
  try {
    const params = getKyberParams();
    console.log('Kyber parameters:', params);
    
    const healthResult = await performKyberHealthCheck();
    
    if (healthResult.operational) {
      console.log('✅ Kyber subsystem initialized successfully');
      console.log(`Key generation: ${healthResult.averageKeyGenTime.toFixed(2)}ms`);
      console.log(`Encryption: ${healthResult.averageEncryptTime.toFixed(2)}ms`);
      console.log(`Decryption: ${healthResult.averageDecryptTime.toFixed(2)}ms`);
      return true;
    } else {
      console.error('❌ Kyber subsystem initialization failed:', healthResult.errors);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Kyber subsystem:', error);
    return false;
  }
}

/**
 * Monitor Kyber performance over time
 */
export async function monitorKyberPerformance(iterations: number = 10): Promise<{
  keyGenTimes: number[];
  encryptTimes: number[];
  decryptTimes: number[];
  averages: {
    keyGen: number;
    encrypt: number;
    decrypt: number;
  };
}> {
  const keyGenTimes: number[] = [];
  const encryptTimes: number[] = [];
  const decryptTimes: number[] = [];

  console.log(`Running Kyber performance monitoring (${iterations} iterations)...`);

  for (let i = 0; i < iterations; i++) {
    try {
      const benchmark = await benchmarkKyberOperations();
      keyGenTimes.push(benchmark.keyGenTime);
      encryptTimes.push(benchmark.encryptTime);
      decryptTimes.push(benchmark.decryptTime);
    } catch (error) {
      console.error(`Performance test iteration ${i + 1} failed:`, error);
    }
  }

  const averages = {
    keyGen: keyGenTimes.reduce((a, b) => a + b, 0) / keyGenTimes.length,
    encrypt: encryptTimes.reduce((a, b) => a + b, 0) / encryptTimes.length,
    decrypt: decryptTimes.reduce((a, b) => a + b, 0) / decryptTimes.length
  };

  console.log('Kyber performance results:', {
    averages,
    iterations: keyGenTimes.length
  });

  return {
    keyGenTimes,
    encryptTimes,
    decryptTimes,
    averages
  };
}
