import dayjs from 'dayjs';

/**
 * Formats a given date string into the specified format using Day.js.
 */
export function formatDateTime({
  dateString,
  formatString = 'L',
  isTime,
}: {
  readonly dateString: string;
  readonly formatString?: string;
  readonly isTime?: boolean;
}): string {
  /**
   * Creates a Day.js date object from the provided date string.
   */
  const dateObj = dayjs(dateString);
  if (!dateObj.isValid()) {
    return dateString;
  }

  return dateObj.format(formatString + (isTime ? ' HH:mm:ss' : ''));
}
