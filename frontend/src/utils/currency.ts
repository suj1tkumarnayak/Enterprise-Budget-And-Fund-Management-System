/**
 * Currency formatting utilities.
 *
 * All monetary display in EBFMS goes through these helpers to ensure
 * consistent locale-aware formatting across the entire UI.
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

/**
 * Format a numeric or string monetary value for display.
 * e.g. 1234567.89 → "$1,234,567.89"
 */
export function formatCurrency(
  value: number | string,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Format a value as a compact currency string for dashboard tiles.
 * e.g. 1234567.89 → "$1.23M"
 */
export function formatCurrencyCompact(
  value: number | string,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Parse a currency string back to a plain number for form submission.
 * Strips currency symbols and thousand separators.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}
