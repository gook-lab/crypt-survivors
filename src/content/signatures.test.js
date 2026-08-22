import { describe, it, expect } from 'vitest';
import { SIGNATURES, signatureFor } from './signatures.js';

describe('signatures data', () => {
  it('every signature has the required runtime fields', () => {
    const required = ['id', 'char', 'name', 'cooldown', 'count', 'telegraphTime', 'radius', 'damage'];
    for (const [key, sig] of Object.entries(SIGNATURES)) {
      // id matches its map key — one source of truth, no drift
      expect(sig.id).toBe(key);
      for (const field of required) {
        expect(sig[field], `${key}.${field}`).toBeDefined();
      }
      // numeric sanity
      expect(sig.cooldown).toBeGreaterThan(0);
      expect(sig.count).toBeGreaterThanOrEqual(1);
      expect(sig.telegraphTime).toBeGreaterThan(0);
      expect(sig.radius).toBeGreaterThan(0);
      expect(sig.damage).toBeGreaterThan(0);
    }
  });

  it('all 7 active heroes have a signature (mage/knight/warrior/huntress + porta/gennaro/pasqualina)', () => {
    expect(signatureFor('mage')?.id).toBe('meteor_storm');
    expect(signatureFor('knight')?.id).toBe('holy_beam');
    expect(signatureFor('warrior')?.id).toBe('earth_crack');
    expect(signatureFor('huntress')?.id).toBe('arrow_rain');
    expect(signatureFor('porta')?.id).toBe('tesla_field');
    expect(signatureFor('gennaro')?.id).toBe('blade_volley');
    expect(signatureFor('pasqualina')?.id).toBe('rune_barrage');
  });

  it('unknown heroes have no signature', () => {
    expect(signatureFor('unknown_hero')).toBeNull();
    expect(signatureFor('necromancer')).toBeNull();
  });

  it('signatureFor(null/undefined) is safe', () => {
    expect(signatureFor(null)).toBeNull();
    expect(signatureFor(undefined)).toBeNull();
    expect(signatureFor('')).toBeNull();
  });
});
