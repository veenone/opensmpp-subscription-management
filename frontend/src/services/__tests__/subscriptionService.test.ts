import { describe, it, expect } from 'vitest';
import { subscriptionApi } from '../subscriptionService';

describe('SubscriptionService', () => {
  describe('validation methods', () => {
    it('validates MSISDN format correctly', () => {
      // Valid MSISDN
      expect(subscriptionApi.validateMsisdn('+1234567890')).toBe(true);
      expect(subscriptionApi.validateMsisdn('+123456789012345')).toBe(true);
      
      // Invalid MSISDN
      expect(subscriptionApi.validateMsisdn('1234567890')).toBe(false); // Missing +
      expect(subscriptionApi.validateMsisdn('+0123456789')).toBe(false); // Starts with 0
      expect(subscriptionApi.validateMsisdn('+12345678901234567')).toBe(false); // Too long
      expect(subscriptionApi.validateMsisdn('+12')).toBe(false); // Too short
      expect(subscriptionApi.validateMsisdn('')).toBe(false); // Empty
      expect(subscriptionApi.validateMsisdn('+123abc456')).toBe(false); // Contains letters
    });

    it('formats MSISDN to E.164', () => {
      expect(subscriptionApi.formatMsisdn('1234567890')).toBe('+1234567890');
      expect(subscriptionApi.formatMsisdn('+1234567890')).toBe('+1234567890');
      expect(subscriptionApi.formatMsisdn('(123) 456-7890')).toBe('+1234567890');
      expect(subscriptionApi.formatMsisdn('123-456-7890')).toBe('+1234567890');
      expect(subscriptionApi.formatMsisdn('123.456.7890')).toBe('+1234567890');
    });

    it('validates IMPI format correctly', () => {
      // Valid IMPI
      expect(subscriptionApi.validateImpi('user@example.com')).toBe(true);
      expect(subscriptionApi.validateImpi('test.user+tag@domain.org')).toBe(true);
      
      // Invalid IMPI
      expect(subscriptionApi.validateImpi('invalid-email')).toBe(false);
      expect(subscriptionApi.validateImpi('@example.com')).toBe(false);
      expect(subscriptionApi.validateImpi('user@')).toBe(false);
      expect(subscriptionApi.validateImpi('')).toBe(false);
    });

    it('validates IMPU format correctly', () => {
      // Valid IMPU
      expect(subscriptionApi.validateImpu('sip:user@example.com')).toBe(true);
      expect(subscriptionApi.validateImpu('sip:test.user+tag@domain.org')).toBe(true);
      
      // Invalid IMPU
      expect(subscriptionApi.validateImpu('user@example.com')).toBe(false); // Missing sip:
      expect(subscriptionApi.validateImpu('sip:invalid-format')).toBe(false);
      expect(subscriptionApi.validateImpu('sip:@example.com')).toBe(false);
      expect(subscriptionApi.validateImpu('')).toBe(false);
    });

    it('generates IMPI from MSISDN', () => {
      expect(subscriptionApi.generateImpi('+1234567890')).toBe('1234567890@example.com');
      expect(subscriptionApi.generateImpi('+1234567890', 'custom.com')).toBe('1234567890@custom.com');
    });

    it('generates IMPU from MSISDN', () => {
      expect(subscriptionApi.generateImpu('+1234567890')).toBe('sip:1234567890@example.com');
      expect(subscriptionApi.generateImpu('+1234567890', 'custom.com')).toBe('sip:1234567890@custom.com');
    });
  });
});