/**
 * Currency System — XAF Only
 *
 * All money values are stored and displayed in XAF (Central African CFA Franc).
 * No currency conversion, no multi-currency support.
 */

/**
 * Format money for display in XAF (FCFA)
 *
 * @param amountXaf - Amount in XAF (whole francs)
 * @param options - Intl.NumberFormat options
 * @returns Formatted string like "122 000 FCFA"
 */
export function formatMoney(
  amountXaf: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    ...options,
  }).format(amountXaf);
}

/**
 * Format money from minor units (×100) for display
 * Used for payroll_*, folio_entries.amount_minor
 *
 * @param amountMinorXaf - Amount in XAF minor units (×100)
 * @param options - Intl.NumberFormat options
 * @returns Formatted string like "122 000 FCFA"
 */
export function formatMoneyMinor(
  amountMinorXaf: number,
  options?: Intl.NumberFormatOptions,
): string {
  return formatMoney(amountMinorXaf / 100, options);
}
