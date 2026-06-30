/**
 * Currency formatting utilities.
 *
 * All monetary display in EBFMS goes through these helpers to ensure
 * consistent locale-aware formatting across the entire UI.
 *
 * NOTE: Values received from the API are strings (Prisma Decimal serialises to
 * string). Never parse them to `number` for display math — pass directly to
 * formatMoney() or formatCurrency().
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

/**
 * Primary formatter used by all feature components.
 * Alias of formatCurrency with defaults applied.
 * e.g. "1234567.89" → "$1,234,567.89"
 *
 * This is the canonical formatter referenced in the Frontend Engineer role doc.
 * Always use formatMoney() in feature components; use formatCurrency() only
 * when you need explicit locale/currency control.
 */
export function formatMoney(value: number | string): string {
  return formatCurrency(value, DEFAULT_CURRENCY, DEFAULT_LOCALE);
}

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
