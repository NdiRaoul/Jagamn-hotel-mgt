"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RoomOption {
  slug: string;
  name: string;
  available: number;
  price: number;
}

// Room options are seeded from the URL query param (passed by the server component wrapper)
// We fetch them client-side so the form stays fully interactive.
export default function WalkInBookingPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Load room availability once on mount
  React.useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then(
        (data: {
          rooms?: { slug: string; name: string; price_per_night: number }[];
        }) => {
          // map to RoomOption; available count comes from the summary view
          const opts: RoomOption[] = (data.rooms ?? []).map((rt) => ({
            slug: rt.slug,
            name: rt.name,
            available: 99, // availability checked server-side on submit
            price: rt.price_per_night,
          }));
          setRooms(opts);
          if (opts.length > 0) setSelectedRoom(opts[0].slug);
        },
      )
      .catch(() => {
        // fallback to empty — user can still fill form
      })
      .finally(() => setRoomsLoading(false));
  }, []);

  // Form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountry, setGuestCountry] = useState("US");
  const [guestIdNumber, setGuestIdNumber] = useState("");
  const [checkIn, setCheckIn] = useState(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [guests, setGuests] = useState("2");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [cashDialog, setCashDialog] = useState<{ open: boolean; bookingId: string | null }>({ open: false, bookingId: null });
  const [cashAmount, setCashAmount] = useState("");
  const [processingCash, setProcessingCash] = useState(false);

  const selectedRoomData = rooms.find((r) => r.slug === selectedRoom);
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );
  const roomTotal = (selectedRoomData?.price ?? 0) * nights;
  const tax = Math.round(roomTotal * 0.1);
  const totalDue = roomTotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      setFormError("Please select a room type.");
      return;
    }
    setFormError(null);
    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch("/api/reception/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || null,
          guest_country: guestCountry,
          guest_id_number: guestIdNumber || null,
          room_slug: selectedRoom,
          check_in: checkIn,
          check_out: checkOut,
          guests: parseInt(guests, 10),
          payment_method: paymentMethod === "card" ? "card" : "cash",
          amount: totalDue * 100, // API expects minor units for Stripe; route handles conversion
          currency: "xaf",
          clientIdempotencyKey: idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Booking failed — please try again.");
        return;
      }

      if (paymentMethod === "cash") {
        setCashAmount((totalDue).toString());
        setCashDialog({ open: true, bookingId: data.bookingId });
      } else {
        router.push(`/reception/check-in/success?id=${data.bookingId}`);
      }
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-2">
        <h1 className="manrope-bold text-4xl text-[#00152A]">
          Walk-In Booking
        </h1>
        <p className="text-gray-500 text-sm">
          Create a new reservation for an arriving guest.
        </p>
        {formError && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600 text-sm font-medium">
            {formError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          {/* ── 1. Guest Details ──────────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Guest Details
              </h2>
            </div>
            <div className="absolute right-10 top-10 opacity-5">
              <User className="w-24 h-24" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Full Name *
                </Label>
                <Input
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Email Address *
                </Label>
                <Input
                  required
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phone Number
                </Label>
                <Input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Country
                  </Label>
                  <Select value={guestCountry} onValueChange={setGuestCountry}>
                    <SelectTrigger className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="CM">Cameroon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    ID Number
                  </Label>
                  <Input
                    value={guestIdNumber}
                    onChange={(e) => setGuestIdNumber(e.target.value)}
                    placeholder="Passport / DL"
                    className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Stay Details ───────────────────────── */}
          <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="manrope-bold text-2xl text-[#00152A]">
                Stay Details
              </h2>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-lg space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Check-In *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00152A] z-10" />
                    <Input
                      required
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md pl-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Check-Out *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00152A] z-10" />
                    <Input
                      required
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md pl-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Guests
                </Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="w-full h-12 bg-[#E6E8EA] border-[#6B7280] rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room picker */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Available Room Types *
              </Label>
              {roomsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms…
                </div>
              ) : rooms.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  No room types found — ensure room_types are seeded in the DB.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room.slug}
                      onClick={() => setSelectedRoom(room.slug)}
                      className={cn(
                        "p-6 rounded-md border-2 transition-all cursor-pointer relative",
                        selectedRoom === room.slug
                          ? "border-[#00152A] bg-[#00152A]/5"
                          : "border-gray-100 bg-white hover:border-gray-300",
                      )}
                    >
                      {selectedRoom === room.slug && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00152A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <h4 className="manrope-bold text-lg text-[#00152A]">
                        {room.name}
                      </h4>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] font-bold text-[#BA722E] bg-[#BA722E]/10 px-2 py-1 rounded uppercase tracking-widest">
                          Available
                        </span>
                        <p className="text-[#00152A]">
                          <span className="manrope-bold text-xl">
                            {room.price}XAF
                          </span>
                          <span className="text-xs text-gray-400"> /night</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Payment Sidebar ────────────────────── */}
        <div className="bg-white rounded-lg border-l-4 border-l-[#00152A] shadow-sm p-10 space-y-10 xl:sticky xl:top-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00152A] text-white flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="manrope-bold text-2xl text-[#00152A]">Payment</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {selectedRoomData?.name ?? "—"} ({nights} night
                  {nights !== 1 ? "s" : ""})
                </p>
              </div>
              <p className="manrope-bold text-lg text-[#00152A]">
                ${roomTotal.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-600">Tax (10%)</p>
              <p className="manrope-bold text-lg text-[#00152A]">
                ${tax.toFixed(2)}
              </p>
            </div>
            {/* Resort fee removed per pricing changes */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Total Due
              </p>
              <p className="manrope-bold text-4xl text-[#00152A]">
                ${totalDue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "h-12 rounded-md flex items-center justify-center gap-2 font-bold transition-all border-2",
                  paymentMethod === "card"
                    ? "bg-[#00152A] border-[#00152A] text-white"
                    : "border-gray-100 text-gray-400 hover:border-gray-300",
                )}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "h-12 rounded-md flex items-center justify-center gap-2 font-bold transition-all border-2",
                  paymentMethod === "cash"
                    ? "bg-[#00152A] border-[#00152A] text-white"
                    : "border-gray-100 text-gray-400 hover:border-gray-300",
                )}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !guestName || !guestEmail || !selectedRoom}
            className="w-full h-14 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow-xl shadow-[#BA722E]/20 flex items-center justify-center gap-3 group transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
            {submitting ? "Processing…" : "Complete Check-In"}
          </Button>
        </div>
      </div>

      <Dialog open={cashDialog.open} onOpenChange={(open) => !open && setCashDialog({ open: false, bookingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Cash Payment</DialogTitle>
            <DialogDescription>
              Enter the amount of cash received from the guest for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount Received (XAF)</Label>
              <Input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => router.push(`/reception/check-in/success?id=${cashDialog.bookingId}`)}
              disabled={processingCash}
            >
              Skip for Now
            </Button>
            <Button
              disabled={processingCash || !cashAmount || Number(cashAmount) <= 0}
              onClick={async () => {
                setProcessingCash(true);
                try {
                  const res = await fetch("/api/reception/cash-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      booking_id: cashDialog.bookingId,
                      amount_minor: Number(cashAmount), // XAF has no minor units basically for Stripe, but backend assumes amount_minor for folio
                      description: "Walk-in Initial Cash Payment",
                    }),
                  });
                  if (res.ok) {
                    router.push(`/reception/check-in/success?id=${cashDialog.bookingId}`);
                  } else {
                    const data = await res.json();
                    alert(`Error: ${data.error}`);
                  }
                } finally {
                  setProcessingCash(false);
                }
              }}
            >
              {processingCash ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
