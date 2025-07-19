// Browser-compatible SHA-256 hashing using Web Crypto API
export async function hashConsent(consentData: Record<string, any>): Promise<string> {
  const str = JSON.stringify(consentData, Object.keys(consentData).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}