import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Date formatting utilities.
 *
 * All date display in EBFMS goes through these helpers to ensure
 * consistent formatting and graceful handling of invalid/null values.
 */

const DISPLAY_FORMAT = 'MMM d, yyyy';
const DISPLAY_FORMAT_WITH_TIME = 'MMM d, yyyy h:mm a';
const INPUT_FORMAT = 'yyyy-MM-dd';

/**
 * Format an ISO date string or Date for display.
 * e.g. "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;

  if (!isValid(date)) {
    return '—';
  }

  return format(date, DISPLAY_FORMAT);
}

/**
 * Format an ISO date string with time component.
 * e.g. "2024-03-15T10:30:00Z" → "Mar 15, 2024 10:30 AM"
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;

  if (!isValid(date)) {
    return '—';
  }

  return format(date, DISPLAY_FORMAT_WITH_TIME);
}

/**
 * Format a date as a relative time string.
 * e.g. "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;

  if (!isValid(date)) {
    return '—';
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a Date for use in an HTML date input (value prop).
 * e.g. Date → "2024-03-15"
 */
export function formatDateInput(value: Date | null | undefined): string {
  if (value === null || value === undefined || !isValid(value)) {
    return '';
  }

  return format(value, INPUT_FORMAT);
}
