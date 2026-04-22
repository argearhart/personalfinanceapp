import { format } from 'date-fns';

/**
 * Calendar day for sorting and statement logic. Plain `YYYY-MM-DD` is kept as-is
 * (matches date inputs and avoids UTC/local drift). Other strings use local wall date.
 */
export function toComparableYmd(dateStr: string): string {
  const t = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return t;
  }
  const parsed = new Date(t);
  if (Number.isNaN(parsed.getTime())) {
    return '1970-01-01';
  }
  return format(parsed, 'yyyy-MM-dd');
}

/** Compare two transaction date strings; suitable for sort when paired with a stable id tiebreak. */
export function compareYmdDateStrings(a: string, b: string): number {
  return toComparableYmd(a).localeCompare(toComparableYmd(b));
}

/**
 * YYYY-MM-dd from a date input value (always treated as a local calendar end-of-statement / as-of day).
 */
export function parseYmdToComparable(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) {
    return toComparableYmd(ymd);
  }
  return ymd.trim();
}

/** True if the transaction is on or before the statement (or as-of) calendar day. */
export function isYmdOnOrBefore(transactionDate: string, boundaryYmd: string): boolean {
  return toComparableYmd(transactionDate) <= parseYmdToComparable(boundaryYmd);
}
