"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Printer,
  Mail,
  AlertCircle,
  ChevronRight,
  Flag,
  Info,
  Loader2,
  Plus,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_ref: string;
  guest_name: string;
  guest_email: string;
  room_slug: string;
  rooms: { unit_code: string } | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  room_price_per_night: number;
  tax_amount: number | null;
  payment_status: string;
  status: string;
}

export default function CheckOutClient({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [folioEntries, setFolioEntries] = useState<any[]>([]);
  const [folioBalance, setFolioBalance] = useState({ balance_minor: 0, paid_minor: 0 });
  const [loadingFolio, setLoadingFolio] = useState(true);

  const [chargeDialog, setChargeDialog] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCategory, setChargeCategory] = useState("minibar");
  const [chargeDesc, setChargeDesc] = useState("");
  const [processingCharge, setProcessingCharge] = useState(false);

  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchFolio = async () => {
    try {
      const res = await fetch(`/api/reception/folio?booking_id=${booking.id}`);
      if (res.ok) {
        const data = await res.json();
        setFolioEntries(data.entries);
        setFolioBalance(data.balance);
      }
    } finally {
      setLoadingFolio(false);
    }
  };

  React.useEffect(() => {
    fetchFolio();
  }, [booking.id]);

  const roomCharge = booking.room_price_per_night * booking.nights;
  const tax = booking.tax_amount ?? Math.round(roomCharge * 0.1);
  const totalDue = folioBalance.balance_minor / 100; // API returns minor=XAF
  const roomLabel =
    booking.rooms?.unit_code ?? booking.room_slug.replace(/-/g, " ");

  const handleConfirmCheckout = async () => {
    setError(null);
    setConfirming(true);
    try {
      const res = await fetch(
        `/api/reception/departures/check-out/${booking.id}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Check-out failed");
        return;
      }
      router.push("/reception/departures");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Breadcrumbs & Status ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/reception" className="hover:text-[#00152A]">
              Front Desk
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/reception/departures" className="hover:text-[#00152A]">
              Departures
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#BA722E]">
              Guest Check-Out &amp; Billing
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gray-100 text-gray-400 border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
              Room {roomLabel}
            </Badge>
            <Badge
              className={cn(
                "border-0 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5",
                booking.status === "checked_out" ||
                booking.status === "completed"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500",
              )}
            >
              {booking.status === "checked_out" ||
              booking.status === "completed"
                ? "Checked Out"
                : "Departing Today"}
            </Badge>
          </div>
          <h1 className="manrope-bold text-5xl text-[#00152A] tracking-tight">
            {booking.guest_name}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Folio #{booking.booking_ref} · Stay: {booking.check_in} —{" "}
            {booking.check_out} ({booking.nights} night
            {booking.nights !== 1 ? "s" : ""})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = `mailto:${booking.guest_email}?subject=Folio ${booking.booking_ref}`)
            }
            className="h-11 px-6 bg-gray-50 border-gray-100 text-[#00152A] font-bold flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Folio
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── Final Bill Summary ───────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-12">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#BA722E]" />
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Final Bill Summary
              </h2>
            </div>

            {/* Room Charges */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Room Charges
              </h3>
              <div className="flex items-start justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#00152A]">
                    {booking.room_slug.replace(/-/g, " ")} ({booking.nights}{" "}
                    Night
                    {booking.nights !== 1 ? "s" : ""})
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.check_in} — {booking.check_out} @ $
                    {(booking.room_price_per_night / 100).toFixed(2)}/night
                  </p>
                </div>
                <p className="manrope-bold text-lg text-[#00152A]">
                  ${(roomCharge / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Fees & Taxes */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Fees &amp; Taxes
              </h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between px-2">
                  <p className="text-sm font-bold text-[#00152A]">Tax</p>
                  <p className="manrope-bold text-lg text-[#00152A]">
                    ${(tax / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Folio Entries (Extras / Payments) */}
            <div className="space-y-6 pt-8 border-t border-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Folio &amp; Payments
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setChargeDialog(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Charge
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setPaymentAmount(Math.max(0, folioBalance.balance_minor).toString());
                    setPaymentDialog(true);
                  }}>
                    <Banknote className="w-3 h-3 mr-1" /> Take Payment
                  </Button>
                </div>
              </div>
              
              {loadingFolio ? (
                <p className="text-sm text-gray-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading folio...</p>
              ) : folioEntries.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No extra charges or payments.</p>
              ) : (
                <div className="space-y-3">
                  {folioEntries.map((e: any) => (
                    <div key={e.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-[#00152A]">{e.description}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{e.entry_type} · {new Date(e.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className={cn("manrope-bold", e.entry_type === "payment" ? "text-green-600" : "text-[#00152A]")}>
                        {e.entry_type === "payment" ? "-" : "+"}{(e.amount_minor / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Settlement Sidebar ───────────────────── */}
        <div className="space-y-8 xl:sticky xl:top-10">
          <div className="bg-[#00152A] rounded-lg p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <FileText className="w-40 h-40" />
            </div>

            <div className="space-y-1 relative">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Total Balance
              </p>
              <p className="text-[#BA722E] tracking-tight">
                <span className="text-5xl manrope-bold">
                  ${Math.floor(totalDue)}
                </span>
                <span className="text-xl font-bold">
                  .{String(Math.round((totalDue % 1) * 100)).padStart(2, "0")}
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  FCFA
                </span>
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 relative">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Payment Status</span>
                <span
                  className={cn(
                    "text-xs font-black uppercase",
                    booking.payment_status === "paid"
                      ? "text-green-400"
                      : "text-amber-400",
                  )}
                >
                  {booking.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm check-out */}
          {booking.status !== "checked_out" &&
            booking.status !== "completed" && (
            <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Confirm Check-Out
              </h3>
              {folioBalance.balance_minor > 0 ? (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs font-medium">
                  Cannot check out guest with an outstanding balance. Please settle the folio first.
                </div>
              ) : (
                <Button
                  onClick={handleConfirmCheckout}
                  disabled={confirming || loadingFolio}
                  className="w-full h-12 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow flex items-center justify-center gap-2"
                >
                  {confirming && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirming ? "Processing…" : "Confirm Check-Out"}
                </Button>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bg-[#F8F9FA] rounded-lg p-8 border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" />
              Disputes Pending?
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              If items are flagged, balance cannot be settled until resolved by
              management.
            </p>
          </div>
        </div>
      </div>

      {/* Charge Dialog */}
      <Dialog open={chargeDialog} onOpenChange={setChargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Folio Charge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <Select value={chargeCategory} onValueChange={setChargeCategory}>
                <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minibar">Minibar</SelectItem>
                  <SelectItem value="dining">Dining & F&B</SelectItem>
                  <SelectItem value="laundry">Laundry</SelectItem>
                  <SelectItem value="damage">Damage/Fee</SelectItem>
                  <SelectItem value="misc">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <Input className="mt-1" value={chargeDesc} onChange={(e) => setChargeDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Amount (XAF)</label>
              <Input type="number" className="mt-1" value={chargeAmount} onChange={(e) => setChargeAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setChargeDialog(false)}>Cancel</Button>
            <Button disabled={processingCharge || !chargeAmount} onClick={async () => {
              setProcessingCharge(true);
              try {
                const res = await fetch("/api/reception/folio", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ booking_id: booking.id, amount_minor: Number(chargeAmount), category: chargeCategory, description: chargeDesc })
                });
                if (res.ok) {
                  setChargeDialog(false);
                  setChargeAmount(""); setChargeDesc("");
                  fetchFolio();
                } else alert(`Error: ${(await res.json()).error}`);
              } finally { setProcessingCharge(false); }
            }}>
              {processingCharge ? "Adding..." : "Add Charge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Folio Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Amount (XAF)</label>
              <Input type="number" className="mt-1" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button disabled={processingPayment || !paymentAmount} onClick={async () => {
              setProcessingPayment(true);
              try {
                const res = await fetch("/api/reception/cash-payment", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ booking_id: booking.id, amount_minor: Number(paymentAmount), description: "Folio Settlement Payment" })
                });
                if (res.ok) {
                  setPaymentDialog(false);
                  setPaymentAmount("");
                  fetchFolio();
                } else alert(`Error: ${(await res.json()).error}`);
              } finally { setProcessingPayment(false); }
            }}>
              {processingPayment ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
