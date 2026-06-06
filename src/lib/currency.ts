/**
 * Currency System — XAF Only (Zero-Decimal Currency)
 *
 * All money values are stored and displayed in XAF (Central African CFA Franc).
 *
 * CRITICAL: XAF is a zero-decimal currency (no centimes/subunits).
 * - 1000 XAF = 1000 francs (NOT 10.00 francs)
 * - Store as integer whole francs, never divide by 100
 * - Stripe zero-decimal: amount: 1000 = 1000 XAF
 *
 * No currency conversion, no multi-currency support.
 */

/**
 * Format money for display in XAF (FCFA)
 *
 * @param amountXaf - Amount in XAF (whole francs, integer)
 * @param options - Intl.NumberFormat options
 * @returns Formatted string like "122 000 FCFA"
 */
export function formatMoney(
  amountXaf: number,
  options?: Intl.NumberFormatOptions,
): string {
  // Use en-US grouping so thousands are separated by commas (e.g. "122,000 FCFA")
  // instead of the spaces produced by the fr-CM locale.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amountXaf);
  return `${formatted} FCFA`;
}
