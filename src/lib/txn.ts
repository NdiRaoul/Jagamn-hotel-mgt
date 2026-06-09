/**
 * Friendly, human-readable transaction codes.
 *
 * Turns an opaque ledger/payment UUID into a stable short code like `JHP-T12028`
 * for display in transaction tables. Deterministic — the same UUID always maps
 * to the same code — so it's safe to show without persisting anything.
 */
export function formatTxnId(id: string | null | undefined): string {
  if (!id) return "JHP-T00000";
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `JHP-T${(h % 100000).toString().padStart(5, "0")}`;
}
