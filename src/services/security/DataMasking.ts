
import { validateDataIntegrity } from '@/utils/validation';

export interface MaskingRule {
  field: string;
  maskType: 'partial' | 'full' | 'hash' | 'redact' | 'format';
  options?: {
    visibleChars?: number;
    maskChar?: string;
    preserveFormat?: boolean;
    customPattern?: string;
  };
}

export interface MaskingContext {
  userRole: string;
  accessLevel: 'none' | 'limited' | 'full';
  purpose: string;
  requesterPermissions: string[];
}

export class DataMasking {
  private static instance: DataMasking;

  public static getInstance(): DataMasking {
    if (!DataMasking.instance) {
      DataMasking.instance = new DataMasking();
    }
    return DataMasking.instance;
  }

  private constructor() {}

  public maskPersonalData(data: any, context: MaskingContext): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const rules = this.getMaskingRules(context);
    return this.applyMaskingRules(data, rules);
  }

  private getMaskingRules(context: MaskingContext): MaskingRule[] {
    const baseRules: MaskingRule[] = [];

    // Define masking rules based on user role and access level
    switch (context.userRole) {
      case 'patient':
        // Patients see their own data unmasked
        if (context.accessLevel === 'full') {
          return [];
        }
        break;

      case 'provider':
        // Providers have limited access to certain fields
        if (context.accessLevel === 'limited') {
          baseRules.push(
            { field: 'ssn', maskType: 'partial', options: { visibleChars: 4 } },
            { field: 'phone', maskType: 'partial', options: { visibleChars: 4 } },
            { field: 'address', maskType: 'partial', options: { visibleChars: 10 } }
          );
        }
        break;

      case 'compliance':
        // Compliance officers need access for auditing but some PII is masked
        baseRules.push(
          { field: 'ssn', maskType: 'hash' },
          { field: 'creditCard', maskType: 'full' }
        );
        break;

      case 'admin':
        // Admins have broader access but some sensitive fields are still masked
        baseRules.push(
          { field: 'password', maskType: 'full' },
          { field: 'securityAnswers', maskType: 'full' }
        );
        break;

      default:
        // Default: mask all sensitive fields
        baseRules.push(
          { field: 'ssn', maskType: 'full' },
          { field: 'phone', maskType: 'partial', options: { visibleChars: 3 } },
          { field: 'email', maskType: 'partial', options: { visibleChars: 2 } },
          { field: 'address', maskType: 'redact' },
          { field: 'dateOfBirth', maskType: 'format' },
          { field: 'medicalRecordNumber', maskType: 'hash' }
        );
    }

    return baseRules;
  }

  private applyMaskingRules(data: any, rules: MaskingRule[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.applyMaskingRules(item, rules));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const maskedData = { ...data };

    for (const rule of rules) {
      if (maskedData[rule.field] !== undefined) {
        maskedData[rule.field] = this.maskField(maskedData[rule.field], rule);
      }
    }

    // Recursively apply masking to nested objects
    for (const key in maskedData) {
      if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
        maskedData[key] = this.applyMaskingRules(maskedData[key], rules);
      }
    }

    return maskedData;
  }

  private maskField(value: any, rule: MaskingRule): any {
    if (!value || typeof value !== 'string') {
      return value;
    }

    const options = rule.options || {};
    const maskChar = options.maskChar || '*';

    switch (rule.maskType) {
      case 'partial':
        return this.partialMask(value, options.visibleChars || 4, maskChar);

      case 'full':
        return maskChar.repeat(8);

      case 'hash':
        return this.hashValue(value);

      case 'redact':
        return '[REDACTED]';

      case 'format':
        return this.formatMask(value, options);

      default:
        return value;
    }
  }

  private partialMask(value: string, visibleChars: number, maskChar: string): string {
    if (value.length <= visibleChars) {
      return maskChar.repeat(value.length);
    }

    const visiblePart = value.slice(-visibleChars);
    const maskedPart = maskChar.repeat(value.length - visibleChars);
    
    return maskedPart + visiblePart;
  }

  private hashValue(value: string): string {
    // Simple hash for demonstration - in production use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `#${Math.abs(hash).toString(36).toUpperCase().substring(0, 8)}`;
  }

  private formatMask(value: string, options: any): string {
    // Example: mask date of birth to show only year
    if (options.customPattern === 'year-only') {
      const date = new Date(value);
      return date.getFullYear().toString();
    }

    // Default format masking
    if (value.includes('@')) {
      // Email format
      const [local, domain] = value.split('@');
      const maskedLocal = local.substring(0, 2) + '***';
      return `${maskedLocal}@${domain}`;
    }

    return value.replace(/./g, '*');
  }

  public maskHealthRecord(record: any, userRole: string, accessLevel: string): any {
    const context: MaskingContext = {
      userRole,
      accessLevel: accessLevel as 'none' | 'limited' | 'full',
      purpose: 'health_record_access',
      requesterPermissions: []
    };

    // Health-specific masking rules
    const healthSpecificRules: MaskingRule[] = [];

    if (userRole !== 'patient' && userRole !== 'provider') {
      healthSpecificRules.push(
        { field: 'diagnosis', maskType: 'partial', options: { visibleChars: 10 } },
        { field: 'medications', maskType: 'partial', options: { visibleChars: 5 } },
        { field: 'allergies', maskType: 'redact' }
      );
    }

    return this.applyMaskingRules(record, healthSpecificRules);
  }

  public createAuditSafeData(data: any): any {
    // Create a version of data safe for audit logs
    const auditContext: MaskingContext = {
      userRole: 'audit',
      accessLevel: 'limited',
      purpose: 'audit_logging',
      requesterPermissions: []
    };

    const auditRules: MaskingRule[] = [
      { field: 'password', maskType: 'full' },
      { field: 'ssn', maskType: 'hash' },
      { field: 'phone', maskType: 'partial', options: { visibleChars: 4 } },
      { field: 'email', maskType: 'partial', options: { visibleChars: 3 } },
      { field: 'address', maskType: 'partial', options: { visibleChars: 10 } }
    ];

    return this.applyMaskingRules(data, auditRules);
  }
}

export default DataMasking;
