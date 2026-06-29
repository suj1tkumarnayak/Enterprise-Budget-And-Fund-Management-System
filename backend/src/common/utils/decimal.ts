import { Decimal } from 'decimal.js';

/**
 * Monetary arithmetic helpers.
 *
 * All financial calculations in EBFMS must go through these utilities —
 * never through native JS number arithmetic — to prevent floating-point
 * rounding errors in currency values (architecture doc Section 6.1).
 *
 * Prisma returns Decimal instances for NUMERIC columns; these helpers
 * accept both Decimal and string/number for convenience at boundaries.
 */

export type MonetaryInput = Decimal | string | number;

/** Convert any monetary input to a Decimal instance. */
export function toDecimal(value: MonetaryInput): Decimal {
  return new Decimal(value);
}

/** Add two monetary values. */
export function addMoney(a: MonetaryInput, b: MonetaryInput): Decimal {
  return new Decimal(a).plus(new Decimal(b));
}

/** Subtract b from a. */
export function subtractMoney(a: MonetaryInput, b: MonetaryInput): Decimal {
  return new Decimal(a).minus(new Decimal(b));
}

/** Multiply a monetary value by a scalar (e.g., for percentage calculations). */
export function multiplyMoney(amount: MonetaryInput, factor: MonetaryInput): Decimal {
  return new Decimal(amount).times(new Decimal(factor));
}

/** Check whether a monetary value is strictly greater than zero. */
export function isPositive(value: MonetaryInput): boolean {
  return new Decimal(value).greaterThan(0);
}

/** Check whether a monetary value is zero or positive (>= 0). */
export function isNonNegative(value: MonetaryInput): boolean {
  return new Decimal(value).greaterThanOrEqualTo(0);
}

/** Check whether a >= b. */
export function isGreaterThanOrEqual(a: MonetaryInput, b: MonetaryInput): boolean {
  return new Decimal(a).greaterThanOrEqualTo(new Decimal(b));
}

/** Check whether a > b. */
export function isGreaterThan(a: MonetaryInput, b: MonetaryInput): boolean {
  return new Decimal(a).greaterThan(new Decimal(b));
}

/**
 * Format a Decimal as a fixed 2-decimal-place string for API responses
 * and display. Never serialize a raw Decimal object to JSON.
 */
export function formatMoney(value: MonetaryInput): string {
  return new Decimal(value).toFixed(2);
}

/**
 * Assert that a monetary value does not exceed a ceiling.
 * Throws a descriptive error if the assertion fails.
 * Used in allocation and expense posting logic.
 */
export function assertDoesNotExceed(
  value: MonetaryInput,
  ceiling: MonetaryInput,
  label: string,
): void {
  if (new Decimal(value).greaterThan(new Decimal(ceiling))) {
    throw new Error(
      `${label}: value ${formatMoney(value)} exceeds ceiling ${formatMoney(ceiling)}`,
    );
  }
}
