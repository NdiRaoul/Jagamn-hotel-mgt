"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
  Lock,
  ChevronRight,
  User,
  CreditCard,
  Smartphone,
  Check,
  ShieldCheck,
  Coffee,
  Car,
  Wifi,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getRoomBySlug } from "@/lib/data/rooms";

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe("pk_test_51O...placeholder");

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();

  const roomSlug = searchParams.get("room");
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");
  const guestsStr = searchParams.get("guests") || "2a1c";

  const room = roomSlug ? getRoomBySlug(roomSlug) : null;
  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [createAccount, setCreateAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "Johnathan Doe",
    email: "john@example.com",
    phone: "+1 (555) 000-0000",
    country: "US",
    idType: "Passport",
    idNumber: "X12345678",
    mobileMoneyPhone: "",
    mobileMoneyMedium: "mobile money", // or orange money
  });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const roomTotal = room ? room.price * nights : 0;
  const resortFee = 150;
  const tax = Math.round(roomTotal * 0.12);
  const totalPrice = roomTotal + resortFee + tax;

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="manrope-bold text-2xl mb-4">Invalid Booking Session</h2>
          <Button onClick={() => router.push("/rooms")}>Return to Rooms</Button>
        </div>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Generate reference
    const ref = `JP-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    if (paymentMethod === "card") {
      // Simulate Stripe payment
      setTimeout(() => {
        router.push(
          `/booking/confirmed?ref=${ref}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`
        );
      }, 2000);
    } else if (paymentMethod === "mobile") {
      // Simulate Fapshi payment
      console.log("Initiating Fapshi payment for", formData.mobileMoneyPhone);
      setTimeout(() => {
        router.push(
          `/booking/confirmed?ref=${ref}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`
        );
      }, 2000);
    } else {
      // Other methods
      setTimeout(() => {
        router.push(
          `/booking/confirmed?ref=${ref}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`
        );
      }, 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 mt-20">
      {/* ── Left Column: Forms ──────────────────────── */}
      <div className="flex-1 space-y-12">
        {/* Step 1: Guest Details */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-md bg-[#00152A] text-white flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="manrope-bold text-2xl text-[#00152A]">Guest Details</h2>
          </div>

          <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Johnathan Doe"
                  className="bg-gray-50 border-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-gray-50 border-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="bg-gray-50 border-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Country of Residence</Label>
                <Select defaultValue={formData.country}>
                  <SelectTrigger className="bg-gray-50 border-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CM">Cameroon</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Identification Type</Label>
                <Select defaultValue={formData.idType}>
                  <SelectTrigger className="bg-gray-50 border-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="National ID">National ID</SelectItem>
                    <SelectItem value="Driver's License">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">ID Number</Label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="X12345678"
                  className="bg-gray-50 border-none h-12"
                />
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-md p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="create-account"
                  checked={createAccount}
                  onCheckedChange={(checked) => setCreateAccount(!!checked)}
                  className="border-gray-300 data-[state=checked]:bg-[#00152A]"
                />
                <Label htmlFor="create-account" className="text-sm text-gray-600 font-medium cursor-pointer">
                  Save my details and create a free Palace Club account
                </Label>
              </div>

              {createAccount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Choose Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-white h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" className="bg-white h-11" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Step 2: Payment Information */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-md bg-[#00152A] text-white flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="manrope-bold text-2xl text-[#00152A]">Payment Information</h2>
          </div>

          <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Option: Card */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all",
                  paymentMethod === "card" ? "border-[#00152A] bg-gray-50" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-bold text-[#00152A]">Mastercard / Visa</span>
                </div>
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", paymentMethod === "card" ? "border-[#00152A]" : "border-gray-300")}>
                  {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-[#00152A]" />}
                </div>
              </div>

              {/* Payment Option: Fapshi */}
              <div
                onClick={() => setPaymentMethod("mobile")}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all",
                  paymentMethod === "mobile" ? "border-[#00152A] bg-gray-50" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-bold text-[#00152A]">MTN / Orange Money</span>
                </div>
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", paymentMethod === "mobile" ? "border-[#00152A]" : "border-gray-300")}>
                  {paymentMethod === "mobile" && <div className="w-2 h-2 rounded-full bg-[#00152A]" />}
                </div>
              </div>

              {/* Payment Option: Google Pay */}
              <div
                onClick={() => setPaymentMethod("google")}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all",
                  paymentMethod === "google" ? "border-[#00152A] bg-gray-50" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" width={40} height={20} className="h-4" />
                  <span className="text-sm font-bold text-[#00152A]">Google Pay</span>
                </div>
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", paymentMethod === "google" ? "border-[#00152A]" : "border-gray-300")}>
                  {paymentMethod === "google" && <div className="w-2 h-2 rounded-full bg-[#00152A]" />}
                </div>
              </div>

              {/* Payment Option: Apple Pay */}
              <div
                onClick={() => setPaymentMethod("apple")}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all",
                  paymentMethod === "apple" ? "border-[#00152A] bg-gray-50" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="ApplePay" width={40} height={20} className="h-4" />
                  <span className="text-sm font-bold text-[#00152A]">Apple Pay</span>
                </div>
                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", paymentMethod === "apple" ? "border-[#00152A]" : "border-gray-300")}>
                  {paymentMethod === "apple" && <div className="w-2 h-2 rounded-full bg-[#00152A]" />}
                </div>
              </div>
            </div>

            {/* Dynamic Payment Forms */}
            <div className="bg-gray-50 rounded-md p-8">
              {paymentMethod === "card" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Card Number</Label>
                    <div className="bg-white h-12 px-4 rounded border-none flex items-center">
                      <CardElement className="w-full" options={{ style: { base: { fontSize: '16px', color: '#00152A', '::placeholder': { color: '#A0AEC0' } } } }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expiry Date</Label>
                      <Input placeholder="MM / YY" className="bg-white h-12 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">CVV / CVC</Label>
                      <Input placeholder="•••" className="bg-white h-12 border-none" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "mobile" && (
                <div className="space-y-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setFormData({ ...formData, mobileMoneyMedium: 'mobile money' })}
                      className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", formData.mobileMoneyMedium === 'mobile money' ? "bg-[#00152A] text-white" : "bg-gray-200 text-gray-500")}
                    >
                      MTN
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, mobileMoneyMedium: 'orange money' })}
                      className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", formData.mobileMoneyMedium === 'orange money' ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500")}
                    >
                      ORANGE
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Number (6XXXXXXXX)</Label>
                    <Input
                      value={formData.mobileMoneyPhone}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyPhone: e.target.value })}
                      placeholder="670000000"
                      className="bg-white h-12 border-none"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">You will receive a payment request on your phone after clicking Confirm & Pay.</p>
                </div>
              )}

              {(paymentMethod === "google" || paymentMethod === "apple") && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-sm text-gray-500">Pay securely with your saved details.</p>
                  <Button className="bg-black text-white h-14 px-12 rounded-md hover:bg-gray-900 w-full md:w-auto">
                    {paymentMethod === "google" ? "Pay with Google Pay" : "Pay with Apple Pay"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Legal & CTA */}
        <div className="space-y-8">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" className="mt-1 border-gray-300 data-[state=checked]:bg-[#00152A]" />
            <Label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
              I have read and agree to the <Link href="#" className="text-[#00152A] font-bold underline">Terms of Service</Link> and the <Link href="#" className="text-[#00152A] font-bold underline">Cancellation Policy</Link>. I understand that cancellations made within 48 hours of check-in are subject to a one-night fee.
            </Label>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">256-bit Secure Encrypted Payment</span>
            </div>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-[#BA722E] hover:bg-[#A35F24] text-white h-14 px-16 rounded-md text-sm font-bold w-full md:w-auto shadow-lg shadow-[#BA722E]/20"
            >
              {isProcessing ? "Processing..." : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right Column: Sidebar ───────────────────── */}
      <aside className="w-full lg:w-[400px] space-y-6">
        <div className="bg-[#00152A] rounded-md overflow-hidden text-white shadow-xl">
          {/* Room Header */}
          <div className="relative h-48">
            <Image src={room.images.main} alt={room.name} fill className="object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00152A] to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFB77A] mb-1 block">Selected Room</span>
              <h3 className="manrope-bold text-xl">{room.name}</h3>
            </div>
          </div>

          {/* Stay Info */}
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-in</p>
                <p className="text-sm font-bold">{format(checkIn, "MMM d, yyyy")}</p>
              </div>
              <ArrowLeftRight className="w-4 h-4 text-[#FFB77A]" />
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-out</p>
                <p className="text-sm font-bold">{format(checkOut, "MMM d, yyyy")}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 border-y border-white/10 py-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{room.name} ({nights} Nights)</span>
                <span className="font-bold">${roomTotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Palace Resort Fee</span>
                <span className="font-bold">${resortFee.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Taxes (12%)</span>
                <span className="font-bold">${tax.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Price</p>
                <p className="text-3xl manrope-bold">${totalPrice.toLocaleString()}.00</p>
              </div>
              <span className="text-[10px] text-gray-500">All inclusive</span>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Wifi className="w-3.5 h-3.5 text-[#FFB77A]" /> Complimentary
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Coffee className="w-3.5 h-3.5 text-[#FFB77A]" /> Breakfast incl.
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Car className="w-3.5 h-3.5 text-[#FFB77A]" /> Valet Parking
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB77A]" /> Spa Access
              </div>
            </div>

            {/* Badge */}
            <div className="pt-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-800 rounded px-4 py-1.5">
                Best Price Guaranteed
              </span>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-white rounded-md border border-dashed border-gray-300 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#00152A]">Need assistance?</p>
            <p className="text-xs text-gray-500">Our Palace Concierge is online.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Suspense fallback={<div className="pt-40 text-center">Loading...</div>}>
        <Elements stripe={stripePromise}>
          <BookingContent />
        </Elements>
      </Suspense>
    </div>
  );
}
