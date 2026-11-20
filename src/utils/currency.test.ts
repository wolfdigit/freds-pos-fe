import { describe, expect, it } from 'vitest';
import { formatSignedCurrency } from './currency';

describe('formatSignedCurrency', () => {
  it('shows a price decrease with a minus sign and an increase with a plus sign', () => {
    expect(formatSignedCurrency(-70)).toBe('-NT$ 70');
    expect(formatSignedCurrency(50)).toBe('+NT$ 50');
    expect(formatSignedCurrency(-1200)).toBe('-NT$ 1,200');
  });

  it('adds no sign to zero', () => {
    expect(formatSignedCurrency(0)).toBe('NT$ 0');
    expect(formatSignedCurrency(-0.2)).toBe('NT$ 0');
  });
});
