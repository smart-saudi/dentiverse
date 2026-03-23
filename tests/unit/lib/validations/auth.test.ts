import { describe, it, expect } from 'vitest';

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    const validData = {
      email: 'dentist@example.com',
      password: 'SecureP@ss1',
      full_name: 'Dr. Sarah Chen',
      role: 'DENTIST' as const,
    };

    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid roles: DENTIST, LAB, DESIGNER', () => {
      for (const role of ['DENTIST', 'LAB', 'DESIGNER'] as const) {
        const result = registerSchema.safeParse({ ...validData, role });
        expect(result.success).toBe(true);
      }
    });

    it('should reject ADMIN role on registration', () => {
      const result = registerSchema.safeParse({
        ...validData,
        role: 'ADMIN',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Short1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'alllowercase1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'ALLUPPERCASE1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without a number', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'NoNumbers!!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty full_name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        full_name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject full_name longer than 255 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        full_name: 'A'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from email', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: '  dentist@example.com  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('dentist@example.com');
      }
    });

    it('should lowercase email', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: 'Dentist@Example.COM',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('dentist@example.com');
      }
    });

    it('should trim whitespace from full_name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        full_name: '  Dr. Sarah Chen  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.full_name).toBe('Dr. Sarah Chen');
      }
    });

    it('should reject missing required fields', () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    const validData = {
      email: 'dentist@example.com',
      password: 'SecureP@ss1',
    };

    it('should accept valid login data', () => {
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        ...validData,
        email: 'bad-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        ...validData,
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('should lowercase and trim email', () => {
      const result = loginSchema.safeParse({
        email: '  User@Example.COM  ',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'not-valid',
      });
      expect(result.success).toBe(false);
    });

    it('should lowercase and trim email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: '  User@Example.COM  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid token and password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'some-reset-token-123',
        password: 'NewSecure1!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = resetPasswordSchema.safeParse({
        token: '',
        password: 'NewSecure1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'valid-token',
        password: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('should enforce same password rules as registration', () => {
      // No uppercase
      expect(
        resetPasswordSchema.safeParse({
          token: 'valid-token',
          password: 'nouppercase1!',
        }).success,
      ).toBe(false);

      // No lowercase
      expect(
        resetPasswordSchema.safeParse({
          token: 'valid-token',
          password: 'NOLOWERCASE1!',
        }).success,
      ).toBe(false);

      // No number
      expect(
        resetPasswordSchema.safeParse({
          token: 'valid-token',
          password: 'NoNumberHere!',
        }).success,
      ).toBe(false);
    });
  });
});
