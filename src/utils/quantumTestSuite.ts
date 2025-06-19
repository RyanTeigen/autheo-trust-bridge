
/**
 * Comprehensive test suite for post-quantum cryptographic implementations
 */

import { kyberKeyGen, kyberEncrypt, kyberDecrypt, benchmarkKyberOperations } from './pq-kyber';
import { encryptRecord, decryptRecord } from './encryption';
import { QuantumSafeMedicalRecordsService } from '@/services/QuantumSafeMedicalRecordsService';

export interface TestCase {
  name: string;
  description: string;
  testFunction: () => Promise<TestResult>;
}

export interface TestResult {
  success: boolean;
  duration: number;
  details?: any;
  error?: string;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * Basic Kyber functionality tests
 */
export const basicKyberTests: TestSuite = {
  name: 'Basic Kyber Operations',
  tests: [
    {
      name: 'Key Generation',
      description: 'Test Kyber keypair generation',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const keypair = await kyberKeyGen();
          const duration = performance.now() - startTime;
          
          return {
            success: keypair.publicKey.startsWith('kyber_pk_') && keypair.privateKey.startsWith('kyber_sk_'),
            duration,
            details: {
              publicKeyLength: keypair.publicKey.length,
              privateKeyLength: keypair.privateKey.length
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Basic Encryption/Decryption',
      description: 'Test basic Kyber encryption and decryption',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const testData = "Hello, quantum world!";
          const keypair = await kyberKeyGen();
          
          const encrypted = await kyberEncrypt(testData, keypair.publicKey);
          const decrypted = await kyberDecrypt(encrypted, keypair.privateKey);
          const duration = performance.now() - startTime;
          
          return {
            success: decrypted === testData,
            duration,
            details: {
              originalLength: testData.length,
              encryptedLength: encrypted.length,
              dataIntegrity: decrypted === testData
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ]
};

/**
 * Hybrid encryption tests
 */
export const hybridEncryptionTests: TestSuite = {
  name: 'Hybrid Encryption',
  tests: [
    {
      name: 'Medical Record Encryption',
      description: 'Test hybrid encryption with medical record data',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const medicalData = {
            patientId: "12345",
            diagnosis: "Hypertension",
            medications: ["Lisinopril", "Amlodipine"],
            vitalSigns: { bloodPressure: "140/90", heartRate: 72 }
          };
          
          const keypair = await kyberKeyGen();
          const encrypted = await encryptRecord(JSON.stringify(medicalData), keypair.publicKey);
          const decrypted = await decryptRecord(encrypted, keypair.privateKey);
          const duration = performance.now() - startTime;
          
          const parsedData = JSON.parse(decrypted.data);
          const dataMatches = JSON.stringify(parsedData) === JSON.stringify(medicalData);
          
          return {
            success: dataMatches && decrypted.metadata.quantumSafe,
            duration,
            details: {
              algorithm: encrypted.algorithm,
              quantumSafe: decrypted.metadata.quantumSafe,
              dataIntegrity: dataMatches,
              encryptedSize: encrypted.encryptedData.length
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Large Data Encryption',
      description: 'Test encryption with large datasets',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const largeData = "A".repeat(100000); // 100KB of data
          const keypair = await kyberKeyGen();
          
          const encrypted = await encryptRecord(largeData, keypair.publicKey);
          const decrypted = await decryptRecord(encrypted, keypair.privateKey);
          const duration = performance.now() - startTime;
          
          return {
            success: decrypted.data === largeData,
            duration,
            details: {
              originalSize: largeData.length,
              encryptedSize: encrypted.encryptedData.length,
              compressionRatio: encrypted.encryptedData.length / largeData.length
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ]
};

/**
 * Error handling and edge case tests
 */
export const errorHandlingTests: TestSuite = {
  name: 'Error Handling',
  tests: [
    {
      name: 'Invalid Public Key',
      description: 'Test error handling with invalid public key',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          await kyberEncrypt("test data", "invalid_public_key");
          return {
            success: false,
            duration: performance.now() - startTime,
            error: 'Expected error but encryption succeeded'
          };
        } catch (error) {
          return {
            success: true,
            duration: performance.now() - startTime,
            details: { errorCaught: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      }
    },
    {
      name: 'Invalid Private Key',
      description: 'Test error handling with invalid private key',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const keypair = await kyberKeyGen();
          const encrypted = await kyberEncrypt("test data", keypair.publicKey);
          await kyberDecrypt(encrypted, "invalid_private_key");
          
          return {
            success: false,
            duration: performance.now() - startTime,
            error: 'Expected error but decryption succeeded'
          };
        } catch (error) {
          return {
            success: true,
            duration: performance.now() - startTime,
            details: { errorCaught: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      }
    },
    {
      name: 'Key Mismatch',
      description: 'Test error handling with mismatched keys',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const keypair1 = await kyberKeyGen();
          const keypair2 = await kyberKeyGen();
          
          const encrypted = await kyberEncrypt("test data", keypair1.publicKey);
          await kyberDecrypt(encrypted, keypair2.privateKey);
          
          return {
            success: false,
            duration: performance.now() - startTime,
            error: 'Expected error but decryption with wrong key succeeded'
          };
        } catch (error) {
          return {
            success: true,
            duration: performance.now() - startTime,
            details: { errorCaught: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      }
    }
  ]
};

/**
 * Performance benchmarking tests
 */
export const performanceTests: TestSuite = {
  name: 'Performance Benchmarks',
  tests: [
    {
      name: 'Kyber Operations Benchmark',
      description: 'Benchmark Kyber key generation, encryption, and decryption',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const benchmark = await benchmarkKyberOperations();
          const duration = performance.now() - startTime;
          
          // Performance thresholds (in milliseconds)
          const acceptable = benchmark.keyGenTime < 100 && 
                           benchmark.encryptTime < 50 && 
                           benchmark.decryptTime < 50;
          
          return {
            success: acceptable,
            duration,
            details: {
              keyGenTime: benchmark.keyGenTime,
              encryptTime: benchmark.encryptTime,
              decryptTime: benchmark.decryptTime,
              withinThresholds: acceptable
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Throughput Test',
      description: 'Test encryption throughput with multiple operations',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const keypair = await kyberKeyGen();
          const operations = 10;
          const testData = "Performance test data";
          
          const promises = [];
          for (let i = 0; i < operations; i++) {
            promises.push(kyberEncrypt(testData, keypair.publicKey));
          }
          
          await Promise.all(promises);
          const duration = performance.now() - startTime;
          const throughput = operations / (duration / 1000); // operations per second
          
          return {
            success: throughput > 5, // At least 5 operations per second
            duration,
            details: {
              operations,
              throughput: throughput.toFixed(2),
              averagePerOperation: duration / operations
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ]
};

/**
 * Data integrity tests
 */
export const dataIntegrityTests: TestSuite = {
  name: 'Data Integrity',
  tests: [
    {
      name: 'Unicode Support',
      description: 'Test encryption/decryption with Unicode characters',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const unicodeData = "Hello 世界 🌍 Здравствуй мир";
          const keypair = await kyberKeyGen();
          
          const encrypted = await encryptRecord(unicodeData, keypair.publicKey);
          const decrypted = await decryptRecord(encrypted, keypair.privateKey);
          const duration = performance.now() - startTime;
          
          return {
            success: decrypted.data === unicodeData,
            duration,
            details: {
              originalData: unicodeData,
              dataIntegrity: decrypted.data === unicodeData,
              encoding: 'UTF-8'
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Binary Data',
      description: 'Test encryption/decryption with binary data',
      testFunction: async (): Promise<TestResult> => {
        const startTime = performance.now();
        try {
          const binaryData = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 256))
            .map(x => String.fromCharCode(x))
            .join('');
          
          const keypair = await kyberKeyGen();
          const encrypted = await encryptRecord(binaryData, keypair.publicKey);
          const decrypted = await decryptRecord(encrypted, keypair.privateKey);
          const duration = performance.now() - startTime;
          
          return {
            success: decrypted.data === binaryData,
            duration,
            details: {
              dataSize: binaryData.length,
              dataIntegrity: decrypted.data === binaryData,
              type: 'binary'
            }
          };
        } catch (error) {
          return {
            success: false,
            duration: performance.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ]
};

/**
 * Run a complete test suite
 */
export async function runTestSuite(testSuite: TestSuite): Promise<{
  suiteName: string;
  results: Array<{ testName: string; result: TestResult }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    totalDuration: number;
  };
}> {
  const results: Array<{ testName: string; result: TestResult }> = [];
  let totalDuration = 0;
  
  for (const test of testSuite.tests) {
    const result = await test.testFunction();
    results.push({ testName: test.name, result });
    totalDuration += result.duration;
  }
  
  const passed = results.filter(r => r.result.success).length;
  const failed = results.length - passed;
  
  return {
    suiteName: testSuite.name,
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      totalDuration
    }
  };
}

/**
 * Run all test suites
 */
export async function runAllTests(): Promise<Array<{
  suiteName: string;
  results: Array<{ testName: string; result: TestResult }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    totalDuration: number;
  };
}>> {
  const testSuites = [
    basicKyberTests,
    hybridEncryptionTests,
    errorHandlingTests,
    performanceTests,
    dataIntegrityTests
  ];
  
  const allResults = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    allResults.push(result);
  }
  
  return allResults;
}
