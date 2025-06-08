
export class ChecksumGenerator {
  public static async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray)).substring(0, 16);
  }

  public static async verifyChecksum(data: string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}
