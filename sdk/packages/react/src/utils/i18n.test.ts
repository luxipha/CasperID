import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n', () => {
  it('returns English string for EN', () => {
    expect(t('welcome_back', 'EN')).toBe('Welcome back');
  });

  it('returns Spanish string for ES', () => {
    expect(t('welcome_back', 'ES')).toBe('Bienvenido de nuevo');
  });

  it('returns French string for FR', () => {
    expect(t('welcome_back', 'FR')).toBe('Bon retour');
  });

  it('returns German string for DE', () => {
    expect(t('welcome_back', 'DE')).toBe('Willkommen zurück');
  });

  it('falls back to English for unsupported language', () => {
    expect(t('welcome_back', 'IT')).toBe('Welcome back');
  });

  it('returns the key itself for unknown keys', () => {
    expect(t('nonexistent_key', 'EN')).toBe('nonexistent_key');
  });

  it('returns login translations', () => {
    expect(t('sign_in_with_extension', 'EN')).toBe('Sign in with Extension');
    expect(t('sign_in_with_otp', 'EN')).toBe('Sign in with OTP');
  });

  it('returns security translations', () => {
    expect(t('fully_audited', 'EN')).toBe('FULLY AUDITED');
    expect(t('non_custodial', 'EN')).toBe('NON-CUSTODIAL');
  });

  it('returns error translations', () => {
    const errorRequired = t('error_email_required', 'EN');
    expect(errorRequired).toBeTruthy();
    expect(typeof errorRequired).toBe('string');
  });
});
