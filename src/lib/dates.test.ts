import { describe, expect, it } from 'vitest';
import { compareYmdDateStrings, isYmdOnOrBefore, toComparableYmd } from './dates';

describe('toComparableYmd', () => {
  it('keeps YYYY-MM-DD as-is', () => {
    expect(toComparableYmd('2026-01-15')).toBe('2026-01-15');
  });
});

describe('isYmdOnOrBefore', () => {
  it('treats calendar days consistently with plain YMD strings', () => {
    expect(isYmdOnOrBefore('2026-03-15', '2026-03-31')).toBe(true);
    expect(isYmdOnOrBefore('2026-04-01', '2026-03-31')).toBe(false);
  });
});

describe('compareYmdDateStrings', () => {
  it('orders chronologically for plain dates', () => {
    expect(compareYmdDateStrings('2026-01-02', '2026-01-01')).toBeGreaterThan(0);
  });
});
