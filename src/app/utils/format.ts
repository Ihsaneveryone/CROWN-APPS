/**
 * Format number with thousand separator
 * Example: 1000 -> 1,000 | 1000000 -> 1,000,000
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Parse formatted number string back to number
 * Example: "1,000" -> 1000 | "1,000,000" -> 1000000
 */
export function parseFormattedNumber(str: string): number {
  if (!str) return 0;
  // Remove all commas
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number input as user types
 * Automatically adds thousand separators
 */
export function formatNumberInput(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');

  // Split by decimal point
  const parts = cleaned.split('.');

  // Format integer part with thousand separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Join back with decimal point if exists
  return parts.join('.');
}
