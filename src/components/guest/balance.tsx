"use client";

import { Wallet, CheckCircle2, AlertCircle, BedDouble, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingFolio, GuestFolioSummary } from "@/types/folio";

export function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Compact balance pill for booking cards / list rows. Shows the amount still
 * owed (room not fully paid and/or dining charged to the room), or a paid
 * confirmation when the folio is settled.
 */
export function BalanceBadge({
  folio,
  className,
}: {
  folio: BookingFolio | undefined;
  className?: string;
}) {
  if (!folio) return null;
  if (folio.fullyPaid) {
    return (
      <Badge
        className={cn(
          "bg-[#E8F5E9] text-[#2E7D32] border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5",
          className,
        )}
      >
        <CheckCircle2 className="w-3 h-3" /> Paid in Full
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        "bg-[#FFF3E0] text-[#E65100] border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5",
        className,
      )}
    >
      <AlertCircle className="w-3 h-3" /> Balance Due {formatMoney(folio.balanceDue)}
    </Badge>
  );
}

/**
 * Prominent outstanding-balance banner for the dashboard / payments pages.
 * Renders nothing when the guest owes nothing across all stays.
 */
export function OutstandingBalanceBanner({
  summary,
  loading,
  showAction = true,
}: {
  summary: GuestFolioSummary | null;
  loading?: boolean;
  showAction?: boolean;
}) {
  if (loading) {
    return (
      <div className="h-28 rounded-md bg-gray-100 animate-pulse" />
    );
  }
  if (!summary || !summary.hasOutstanding) return null;

  const roomUnpaid = summary.bookings.reduce((s, b) => s + b.roomBalance, 0);
  const extrasUnpaid = summary.bookings.reduce((s, b) => s + b.extrasBalance, 0);

  return (
    <div className="bg-white rounded-md border border-gray-100 border-l-4 border-l-[#E65100] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6 text-[#E65100]" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Outstanding Balance
            </p>
          </div>
          <p className="manrope-bold text-3xl text-[#E65100]">
            {formatMoney(summary.totalBalanceDue)}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1">
            {roomUnpaid > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                Room {formatMoney(roomUnpaid)}
              </span>
            )}
            {extrasUnpaid > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                <UtensilsCrossed className="w-3.5 h-3.5 text-gray-400" />
                Dining & extras {formatMoney(extrasUnpaid)}
              </span>
            )}
          </div>
        </div>
      </div>
      {showAction && (
        <div className="flex flex-col items-stretch md:items-end gap-2">
          <Link href="/dashboard/payments">
            <Button className="bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-11 px-6 rounded-md w-full md:w-auto">
              View Payments
            </Button>
          </Link>
          <p className="text-[10px] text-gray-400 text-center md:text-right">
            Settle online or at the front desk.
          </p>
        </div>
      )}
    </div>
  );
}
