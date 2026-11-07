import { describe, expect, it } from 'vitest';
import { displayAccountName } from './displayName';

describe('displayAccountName', () => {
  it('uses the email when the display name is missing or whitespace', () => {
    expect(displayAccountName('', 'person@example.com')).toBe('person@example.com');
    expect(displayAccountName('   ', 'person@example.com')).toBe('person@example.com');
    expect(displayAccountName(null, 'person@example.com')).toBe('person@example.com');
    expect(displayAccountName('  櫃檯  ', 'person@example.com')).toBe('櫃檯');
  });
});
