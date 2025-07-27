import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { formSchema } from '@/components/auth/signup/schema';

describe('Validation Schemas', () => {
  describe('Signup Form Schema', () => {
    it('validates valid signup data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        roles: ['patient'],
      };

      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123',
        roles: ['patient'],
      };

      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('rejects weak password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'weak',
        roles: ['patient'],
      };

      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('8 characters')
        )).toBe(true);
      }
    });

    it('requires at least one role', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        roles: [],
      };

      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least one role');
      }
    });

    it('prevents selecting all three roles', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        roles: ['patient', 'provider', 'compliance'],
      };

      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('not all three');
      }
    });
  });
});