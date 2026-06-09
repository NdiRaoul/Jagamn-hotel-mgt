"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/currency";

export interface RefundTarget {
  paymentId: string;
  bookingRef: string | null;
  /** Full transaction amount in whole XAF. */
  amountXaf: number;
}

/**
 * Admin / owner refund dialog. Defaults to a full refund; the operator may
 * lower the amount and add a reason. Calls the unified /api/admin/refunds
 * endpoint, which resolves the provider and records the refund.
 */
export function RefundModal({
  target,
  onClose,
  onRefunded,
}: {
  target: RefundTarget;
  onClose: () => void;
  onRefunded?: () => void;
}) {
  const [amount, setAmount] = useState(String(target.amountXaf));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: target.paymentId,
          amountXaf: Number.parseFloat(amount),
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Refund failed.");
        return;
      }
      setDone(true);
      onRefunded?.();
      setTimeout(onClose, 1200);
    } catch {
      setError("Refund failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="manrope-bold text-xl text-jagamn-primary">
              Issue Refund
            </h2>
            {target.bookingRef && (
              <p className="text-xs text-gray-400 font-mono mt-1">
                {target.bookingRef}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-semibold text-emerald-600">
              Refund issued successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Refund Amount (FCFA)
              </label>
              <Input
                type="number"
                value={amount}
                max={target.amountXaf}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12"
              />
              <p className="text-[11px] text-gray-400">
                Full payment: {formatMoney(target.amountXaf)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Reason (optional)
              </label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Cancelled stay"
                className="h-12"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="h-11 px-6">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !amount ||
                  Number.parseFloat(amount) <= 0 ||
                  Number.parseFloat(amount) > target.amountXaf
                }
                className="h-11 px-7 bg-jagamn-primary text-white disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm Refund"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
