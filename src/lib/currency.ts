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
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amountXaf);
}

/**
 * @deprecated Use formatMoney() directly. XAF is zero-decimal, no minor units.
 * This function is kept for backward compatibility during migration.
 *
 * MIGRATION NOTE: If you're calling this, you're likely doing unnecessary ÷100.
 * XAF has no subunits - 1000 XAF = 1000 francs, not 1000 cents.
 *
 * After Phase 4 migration, all *_minor columns are renamed to plain amounts.
 * Replace: formatMoneyMinor(value) → formatMoney(value)
 */
export function formatMoneyMinor(
  amountXaf: number,
  options?: Intl.NumberFormatOptions,
): string {
  // During migration: some old data might still be stored as ×100
  // After migration complete: this should just call formatMoney(amountXaf)
  console.warn(
    "formatMoneyMinor is deprecated. Use formatMoney() for XAF (zero-decimal currency).",
  );
  return formatMoney(amountXaf / 100, options);
}
