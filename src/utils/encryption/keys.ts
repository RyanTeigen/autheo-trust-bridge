
// utils/encryption/keys.ts

import { supabase } from '@/integrations/supabase/client';

// -- Constants --
const LOCAL_PRIVATE_KEY = "user_private_key";
const PUBLIC_KEY_FIELD = "encryption_public_key"; // in Supabase profiles table

// -- Generate a new keypair (X25519) --
export async function generateX25519KeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "X25519",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// -- Export key to base64 string --
async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

// -- Import key from base64 string --
async function importPrivateKey(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "ECDH", namedCurve: "X25519" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// -- Import public key from base64 string --
async function importPublicKey(base64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "ECDH", namedCurve: "X25519" },
    false,
    []
  );
}

// -- Save private key to localStorage --
export async function savePrivateKeyToLocal(key: CryptoKey) {
  const exported = await exportKey(key);
  localStorage.setItem(LOCAL_PRIVATE_KEY, exported);
}

// -- Load private key from localStorage --
export async function loadPrivateKeyFromLocal(): Promise<CryptoKey | null> {
  const base64 = localStorage.getItem(LOCAL_PRIVATE_KEY);
  if (!base64) return null;
  return await importPrivateKey(base64);
}

// -- Setup user encryption keys --
export async function setupUserEncryptionKeys(userId: string) {
  const keypair = await generateX25519KeyPair();
  await savePrivateKeyToLocal(keypair.privateKey);

  const pubRaw = await crypto.subtle.exportKey("raw", keypair.publicKey);
  const pubBase64 = btoa(String.fromCharCode(...new Uint8Array(pubRaw)));

  await supabase.from("profiles").update({ 
    encryption_public_key: pubBase64 
  }).eq("id", userId);

  return keypair;
}

// -- Get user's public key from database --
export async function getUserPublicKey(userId: string): Promise<CryptoKey | null> {
  const { data } = await supabase
    .from("profiles")
    .select("encryption_public_key")
    .eq("id", userId)
    .single();

  if (!data?.encryption_public_key) return null;

  return await importPublicKey(data.encryption_public_key);
}

// -- Ensure user has encryption keys --
export async function ensureUserKeys(userId: string): Promise<{ privateKey: CryptoKey | null; publicKey: CryptoKey | null }> {
  let privateKey = await loadPrivateKeyFromLocal();
  let publicKey = await getUserPublicKey(userId);

  if (!privateKey || !publicKey) {
    const keypair = await setupUserEncryptionKeys(userId);
    privateKey = keypair.privateKey;
    publicKey = keypair.publicKey;
  }

  return { privateKey, publicKey };
}
