
import { supabase } from '@/integrations/supabase/client';
import { generateMLKEMKeyPair, isValidMLKEMPublicKey, isValidMLKEMPrivateKey } from '@/utils/pq-mlkem';

export interface UserMLKEMKeys {
  publicKey: string;
  privateKey: string;
  keyId: string;
}

export class MLKEMKeyService {
  /**
   * Generate and store ML-KEM keys for a user
   */
  static async generateUserKeys(userId: string): Promise<UserMLKEMKeys> {
    try {
      const keyPair = await generateMLKEMKeyPair();
      
      // Store public key in the database
      const { data: keyRecord, error } = await supabase
        .from('user_keys')
        .insert({
          user_id: userId,
          public_key: keyPair.publicKey,
          key_type: 'mlkem-768',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // In production, the private key should be securely stored client-side
      // For development, we'll use localStorage (NOT SECURE - use secure enclave in production)
      localStorage.setItem(`mlkem_private_key_${userId}`, keyPair.privateKey);

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        keyId: keyRecord.id
      };
    } catch (error) {
      console.error('Error generating ML-KEM keys:', error);
      throw new Error(`Failed to generate ML-KEM keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's public key from database
   */
  static async getUserPublicKey(userId: string): Promise<string | null> {
    try {
      const { data: keyRecord, error } = await supabase
        .from('user_keys')
        .select('public_key')
        .eq('user_id', userId)
        .eq('key_type', 'mlkem-768')
        .eq('is_active', true)
        .single();

      if (error || !keyRecord) {
        return null;
      }

      return keyRecord.public_key;
    } catch (error) {
      console.error('Error fetching user public key:', error);
      return null;
    }
  }

  /**
   * Get user's private key from secure storage
   */
  static getUserPrivateKey(userId: string): string | null {
    try {
      // In production, this would come from secure enclave/keychain
      // For development, we use localStorage
      const privateKey = localStorage.getItem(`mlkem_private_key_${userId}`);
      
      if (privateKey && isValidMLKEMPrivateKey(privateKey)) {
        return privateKey;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user private key:', error);
      return null;
    }
  }

  /**
   * Ensure user has ML-KEM keys, generate if needed
   */
  static async ensureUserKeys(userId: string): Promise<{ publicKey: string; hasPrivateKey: boolean }> {
    try {
      // Check if user already has keys
      const existingPublicKey = await this.getUserPublicKey(userId);
      const existingPrivateKey = this.getUserPrivateKey(userId);

      if (existingPublicKey && existingPrivateKey) {
        return { publicKey: existingPublicKey, hasPrivateKey: true };
      }

      // Generate new keys if missing
      const keys = await this.generateUserKeys(userId);
      return { publicKey: keys.publicKey, hasPrivateKey: true };
    } catch (error) {
      console.error('Error ensuring user keys:', error);
      return { publicKey: '', hasPrivateKey: false };
    }
  }

  /**
   * Validate key pair integrity
   */
  static validateKeyPair(publicKey: string, privateKey: string): boolean {
    return isValidMLKEMPublicKey(publicKey) && isValidMLKEMPrivateKey(privateKey);
  }
}
