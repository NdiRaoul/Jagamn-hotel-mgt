"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
  User,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Coffee,
  Car,
  Wifi,
  Sparkles,
  ArrowLeftRight,
  Phone,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import type {
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/ui/country-select";
import { IdInput } from "@/components/ui/id-input";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { getRoomBySlug } from "@/lib/data/rooms";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();
  const supabase = createSupabaseBrowserClient();

  const roomSlug =
    searchParams.get("room") ||
    searchParams.get("amp;room") ||
    searchParams.get("room;");
  const checkInStr =
    searchParams.get("checkIn") ||
    searchParams.get("amp;checkIn") ||
    searchParams.get("checkIn;");
  const checkOutStr =
    searchParams.get("checkOut") ||
    searchParams.get("amp;checkOut") ||
    searchParams.get("checkOut;");
  const guestsStr =
    searchParams.get("guests") ||
    searchParams.get("amp;guests") ||
    searchParams.get("guests;") ||
    "3";

  // Resolve the selected room. Static data covers the 3 legacy rooms; for all
  // other (DB-only) room types — e.g. Garden Terrace, Maharaja — we fetch the
  // live price/name/image so pricing works for every room.
  const staticRoom = roomSlug ? getRoomBySlug(roomSlug) : null;
  const [room, setRoom] = useState<{
    slug: string;
    name: string;
    price: number;
    image: string;
  } | null>(
    staticRoom
      ? {
          slug: staticRoom.slug,
          name: staticRoom.name,
          price: staticRoom.price,
          image: staticRoom.images.main,
        }
      : null,
  );
  const [roomLoading, setRoomLoading] = useState(!staticRoom && !!roomSlug);

  const checkIn = useMemo(() => {
    if (!checkInStr) return null;
    const d = new Date(checkInStr);
    return isNaN(d.getTime()) ? null : d;
  }, [checkInStr]);

  const checkOut = useMemo(() => {
    if (!checkOutStr) return null;
    const d = new Date(checkOutStr);
    return isNaN(d.getTime()) ? null : d;
  }, [checkOutStr]);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [createAccount, setCreateAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientIdempotencyKey] = useState(() => crypto.randomUUID());

  // Fapshi polling state
  const [fapshiTransId, setFapshiTransId] = useState<string | null>(null);
  const [fapshiPolling, setFapshiPolling] = useState(false);
  const [fapshiPhone, setFapshiPhone] = useState("");
  const [fapshiBookingRef, setFapshiBookingRef] = useState<string | null>(null);

  // Wallet (Apple Pay / Google Pay) state. The Stripe PaymentRequest drives the
  // native wallet sheet; `walletAvail` reflects device/browser support.
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [walletAvail, setWalletAvail] = useState<
    "checking" | "available" | "unavailable"
  >("checking");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "CM",
    idType: "passport",
    idNumber: "",
    specialRequests: "",
    mobileMoneyPhone: "",
    mobileMoneyMedium: "mobile money",
    password: "",
    confirmPassword: "",
  });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const roomTotal = room ? room.price * nights : 0;
  const tax = Math.round(roomTotal * 0.1);
  const totalPrice = roomTotal + tax;

  // Load live room data (price/name/image) for DB-only room types.
  useEffect(() => {
    if (!roomSlug) return;
    let active = true;
    async function loadRoom() {
      try {
        const res = await fetch("/api/rooms");
        const json = await res.json();
        const rt = (json.rooms || []).find(
          (r: { slug: string }) => r.slug === roomSlug,
        );
        if (active && rt) {
          setRoom({
            slug: rt.slug,
            name: rt.name,
            price: rt.price_per_night ?? rt.price ?? 0,
            image:
              rt.main_image || rt.images?.main || "/images/palace-deluxe.png",
          });
        }
      } catch {
        // keep static fallback if any
      } finally {
        if (active) setRoomLoading(false);
      }
    }
    loadRoom();
    return () => {
      active = false;
    };
  }, [roomSlug]);

  // Pre-fill from session
  useEffect(() => {
    async function prefill() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();
        setFormData((prev) => ({
          ...prev,
          fullName: profile?.full_name || user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: profile?.phone || "",
          country: profile?.country || "CM",
          idType: profile?.id_type || "passport",
          idNumber: profile?.id_number || "",
        }));
      }
    }
    prefill();
  }, []);

  // Fapshi polling
  useEffect(() => {
    if (!fapshiTransId || !fapshiPolling) return;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5s intervals

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setFapshiPolling(false);
        setPaymentError("Payment timed out. Please try again.");
        return;
      }

      try {
        const res = await fetch(
          `/api/payments/fapshi?transId=${fapshiTransId}`,
        );
        const data = await res.json();

        if (data.status === "SUCCESSFUL") {
          clearInterval(interval);
          setFapshiPolling(false);
          // Update booking payment status
          await fetch(`/api/bookings`, { method: "GET" }); // trigger refresh
          router.push(
            `/booking/confirmed?ref=${fapshiBookingRef || ""}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`,
          );
        } else if (data.status === "FAILED" || data.status === "EXPIRED") {
          clearInterval(interval);
          setFapshiPolling(false);
          setPaymentError("Payment failed. Please try again.");
        }
      } catch {
        // continue polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fapshiTransId, fapshiPolling, fapshiBookingRef]);

  // ── Apple Pay / Google Pay ────────────────────────────────────────────────
  // The wallet settles the SAME Stripe PaymentIntent as the card flow, so a
  // wallet booking moves pending → paid through the identical confirm path.
  // The listener is attached once; it reads the latest handler from a ref to
  // avoid stale form state.
  const walletCtxRef = useRef<
    ((ev: PaymentRequestPaymentMethodEvent) => void) | null
  >(null);

  // Settle a wallet (Apple/Google Pay) payment via the same booking →
  // PaymentIntent → confirm pipeline used by cards. The booking only flips
  // pending → paid through /api/payments/stripe/confirm.
  const handleWalletPayment = async (ev: PaymentRequestPaymentMethodEvent) => {
    if (!stripe) {
      ev.complete("fail");
      return;
    }
    if (!termsAccepted) {
      ev.complete("fail");
      setPaymentError("Please accept the terms and conditions.");
      return;
    }
    if (!formData.fullName || !formData.email) {
      ev.complete("fail");
      setPaymentError("Please complete your guest details first.");
      return;
    }

    setIsProcessing(true);
    let walletClosed = false;
    try {
      // 1. Create the booking (status pending) → returns the booking code.
      const bookingData = await createBooking(paymentMethod);
      if (bookingData.error) {
        ev.complete("fail");
        setPaymentError(bookingData.error);
        setIsProcessing(false);
        return;
      }

      // 2. Create the PaymentIntent (amount resolved server-side from booking).
      const piRes = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: bookingData.bookingRef,
          clientIdempotencyKey,
        }),
      });
      const {
        clientSecret,
        paymentIntentId,
        error: piError,
      } = await piRes.json();
      if (piError || !clientSecret) {
        ev.complete("fail");
        setPaymentError(piError || "Could not start payment.");
        setIsProcessing(false);
        return;
      }

      // 3. Confirm with the wallet's payment method. handleActions:false lets us
      //    close the sheet before resolving any 3-D Secure step.
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

      if (confirmError) {
        ev.complete("fail");
        setPaymentError(confirmError.message || "Wallet payment failed.");
        setIsProcessing(false);
        return;
      }

      // Close the native sheet, then finish any required action (3DS).
      ev.complete("success");
      walletClosed = true;
      if (paymentIntent && paymentIntent.status === "requires_action") {
        const { error: actionError } =
          await stripe.confirmCardPayment(clientSecret);
        if (actionError) {
          setPaymentError(actionError.message || "Authentication failed.");
          setIsProcessing(false);
          return;
        }
      }

      // 4. Server-verify + settle (pending → paid); idempotent with the webhook.
      try {
        await fetch("/api/payments/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingRef: bookingData.bookingRef,
            paymentIntentId,
          }),
        });
      } catch {
        /* webhook / reconcile queue will still settle it */
      }

      await handleCreateAccount(bookingData.bookingId);
      router.push(
        `/booking/confirmed?ref=${bookingData.bookingRef}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`,
      );
    } catch (err: unknown) {
      if (!walletClosed) ev.complete("fail");
      const message =
        err instanceof Error ? err.message : "Wallet payment failed.";
      setPaymentError(message);
      setIsProcessing(false);
    }
  };

  // Keep the listener pointed at the latest handler (fresh form state) without
  // re-creating the PaymentRequest on every keystroke.
  useEffect(() => {
    walletCtxRef.current = handleWalletPayment;
  });

  useEffect(() => {
    if (!stripe || !room || totalPrice <= 0) return;

    const pr = stripe.paymentRequest({
      country: process.env.NEXT_PUBLIC_STRIPE_MERCHANT_COUNTRY || "US",
      currency: "xaf",
      total: {
        label: "Jagamn Palace Booking",
        // XAF is zero-decimal — the amount is the whole-franc integer.
        amount: Math.round(totalPrice),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.on("paymentmethod", (ev) => walletCtxRef.current?.(ev));

    let cancelled = false;
    pr.canMakePayment()
      .then((result) => {
        if (cancelled) return;
        if (result) {
          // Only expose the request once a wallet is actually usable.
          setPaymentRequest(pr);
          setWalletAvail("available");
        } else {
          setWalletAvail("unavailable");
        }
      })
      .catch(() => {
        if (!cancelled) setWalletAvail("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [stripe, room, totalPrice]);

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-jagamn-tertiary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="manrope-bold text-2xl mb-4">
            Invalid Booking Session
          </h2>
          <Button onClick={() => router.push("/rooms")}>Return to Rooms</Button>
        </div>
      </div>
    );
  }

  async function createBooking(paymentMethodStr: string) {
    const guestCount =
      guestsStr.includes("2a2c") || guestsStr === "4"
        ? 4
        : guestsStr.includes("2a1c") || guestsStr === "3"
          ? 3
          : guestsStr.includes("2a") || guestsStr === "2"
            ? 2
            : 1;

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_name: formData.fullName,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_country: formData.country,
        guest_id_type: formData.idType,
        guest_id_number: formData.idNumber,
        room_slug: roomSlug,
        check_in: checkInStr,
        check_out: checkOutStr,
        nights,
        guests: guestCount,
        room_price_per_night: room!.price,
        tax_amount: tax,
        total_amount: totalPrice,
        payment_method: paymentMethodStr,
        special_requests: formData.specialRequests || null,
      }),
    });
    return res.json();
  }

  async function handleCreateAccount(bookingId: string) {
    if (!createAccount || !formData.password) return;
    if (formData.password !== formData.confirmPassword) {
      setPaymentError("Passwords do not match.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName } },
      });
      if (!error && data.user) {
        // Call the server route to create/upgrade the users row
        await fetch("/api/auth/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
          }),
        });
        // Link booking to new user
        await fetch("/api/bookings/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, userId: data.user.id }),
        });
      }
    } catch {
      // Don't block booking completion
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setPaymentError("Please accept the terms and conditions.");
      return;
    }
    setPaymentError(null);
    setIsProcessing(true);

    try {
      if (paymentMethod === "card") {
        if (!stripe || !elements) {
          setPaymentError("Stripe is not loaded. Please refresh.");
          setIsProcessing(false);
          return;
        }

        // Create booking first
        const bookingData = await createBooking("card");
        if (bookingData.error) {
          setPaymentError(bookingData.error);
          setIsProcessing(false);
          return;
        }

        // Create PaymentIntent
        const piRes = await fetch("/api/payments/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingRef: bookingData.bookingRef,
            totalAmount: totalPrice,
            currency: "xaf",
            clientIdempotencyKey,
          }),
        });
        const {
          clientSecret,
          paymentIntentId,
          error: piError,
        } = await piRes.json();
        if (piError) {
          setPaymentError(piError);
          setIsProcessing(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setPaymentError("Card element not found.");
          setIsProcessing(false);
          return;
        }

        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: formData.fullName,
                email: formData.email,
              },
            },
          },
        );

        if (confirmError) {
          setPaymentError(confirmError.message || "Payment failed.");
          setIsProcessing(false);
          return;
        }

        // Reconcile server-side so the booking flips to paid even if the Stripe
        // webhook never arrives (sandbox). Re-reads the PaymentIntent server-side
        // and is idempotent, so a later webhook is a harmless no-op.
        try {
          await fetch("/api/payments/stripe/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingRef: bookingData.bookingRef,
              paymentIntentId,
            }),
          });
        } catch {
          /* webhook / reconcile queue will still cover it */
        }

        await handleCreateAccount(bookingData.bookingId);
        router.push(
          `/booking/confirmed?ref=${bookingData.bookingRef}&room=${roomSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsStr}`,
        );
      } else if (paymentMethod === "mobile") {
        const phone = formData.mobileMoneyPhone.trim();
        if (!phone) {
          setPaymentError("Please enter your mobile money phone number.");
          setIsProcessing(false);
          return;
        }

        // Create booking
        const bookingData = await createBooking(formData.mobileMoneyMedium);
        if (bookingData.error) {
          setPaymentError(bookingData.error);
          setIsProcessing(false);
          return;
        }

        // Initiate Fapshi payment
        const fapshiRes = await fetch("/api/payments/fapshi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            phone,
            medium: formData.mobileMoneyMedium,
            bookingRef: bookingData.bookingRef,
            email: formData.email,
            name: formData.fullName,
            clientIdempotencyKey,
          }),
        });
        const fapshiData = await fapshiRes.json();

        if (fapshiData.error || !fapshiData.transId) {
          setPaymentError(
            fapshiData.error ||
              fapshiData.message ||
              "Mobile money initiation failed.",
          );
          setIsProcessing(false);
          return;
        }

        setFapshiTransId(fapshiData.transId);
        setFapshiPhone(phone);
        setFapshiBookingRef(bookingData.bookingRef);
        setFapshiPolling(true);
        await handleCreateAccount(bookingData.bookingId);
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setPaymentError(message);
      setIsProcessing(false);
    }
  };

  // Fapshi waiting overlay
  if (fapshiPolling) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-jagamn-neutral flex items-center justify-center mx-auto">
            <Phone className="w-10 h-10 text-jagamn-tertiary animate-pulse" />
          </div>
          <h2 className="manrope-bold text-2xl text-jagamn-primary">
            Check Your Phone
          </h2>
          <p className="text-sm text-gray-500">
            Waiting for your approval on <strong>{fapshiPhone}</strong>. Please
            approve the payment prompt on your phone.
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-jagamn-tertiary border-t-transparent rounded-full animate-spin" />
          </div>
          <button
            onClick={() => {
              setFapshiPolling(false);
              setFapshiTransId(null);
              setPaymentError("Payment cancelled.");
            }}
            className="text-xs text-gray-400 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 flex flex-col lg:flex-row gap-6 md:gap-12 mt-20">
      {/* ── Left Column: Forms ── */}
      <div className="flex-1 space-y-6 md:space-y-12">
        {/* Step 1: Guest Details */}
        <section>
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-[#00152A] text-white flex items-center justify-center font-bold text-sm md:text-base">
              1
            </div>
            <h2 className="manrope-bold text-xl md:text-2xl text-[#00152A]">
              Guest Details
            </h2>
          </div>

          <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Logged-in notice */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-emerald-700">
                  Your profile details have been pre-filled. Fields marked with
                  a lock are from your account.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  Full Name *
                  {isLoggedIn && formData.fullName && (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      From profile
                    </span>
                  )}
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Johnathan Doe"
                  className={`h-12 ${isLoggedIn && formData.fullName ? "bg-gray-50 border-gray-100 text-jagamn-primary font-semibold" : "bg-gray-50 border-none"}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  Email Address *
                  {isLoggedIn && formData.email && (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      From profile
                    </span>
                  )}
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  readOnly={isLoggedIn && !!formData.email}
                  className={`h-12 ${isLoggedIn && formData.email ? "bg-gray-100 border-gray-100 text-jagamn-primary font-semibold cursor-not-allowed" : "bg-gray-50 border-none"}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  Phone Number *
                  {isLoggedIn && formData.phone && (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      From profile
                    </span>
                  )}
                </Label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="670000000"
                  defaultCountryCode="CM"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  Country of Residence *
                  {isLoggedIn && formData.country && (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      From profile
                    </span>
                  )}
                </Label>
                <CountrySelect
                  value={formData.country}
                  onChange={(code) =>
                    setFormData({ ...formData, country: code })
                  }
                  placeholder="Select your country"
                />
              </div>
            </div>

            {/* Identification — full width */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                Identification *
                {isLoggedIn && formData.idNumber && (
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                    From profile
                  </span>
                )}
              </Label>
              <IdInput
                idType={formData.idType}
                idNumber={formData.idNumber}
                onTypeChange={(v) => setFormData({ ...formData, idType: v })}
                onNumberChange={(v) =>
                  setFormData({ ...formData, idNumber: v })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Special Requests
              </Label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="Any special requests or preferences..."
                className="w-full bg-gray-50 rounded-md px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-jagamn-primary"
              />
            </div>

            {/* Create account — only shown to guests */}
            {!isLoggedIn && (
              <div className="bg-[#F8F9FA] rounded-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="create-account"
                    checked={createAccount}
                    onCheckedChange={(c) => setCreateAccount(!!c)}
                    className="border-gray-300 data-[state=checked]:bg-[#00152A]"
                  />
                  <Label
                    htmlFor="create-account"
                    className="text-sm text-gray-600 font-medium cursor-pointer"
                  >
                    Save my details and create a free Palace Club account
                  </Label>
                </div>
                {createAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Choose Password
                      </Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className="bg-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Confirm Password
                      </Label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="bg-white h-11"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Payment Information */}
        <section>
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-[#00152A] text-white flex items-center justify-center font-bold text-sm md:text-base">
              2
            </div>
            <h2 className="manrope-bold text-xl md:text-2xl text-[#00152A]">
              Payment Information
            </h2>
          </div>

          <div className="bg-white rounded-md border-l-4 border-[#00152A] shadow-sm p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "card", icon: CreditCard, label: "Mastercard / Visa" },
                {
                  key: "mobile",
                  icon: Smartphone,
                  label: "MTN / Orange Money",
                },
                { key: "google", icon: null, label: "Google Pay" },
                { key: "apple", icon: null, label: "Apple Pay" },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setPaymentMethod(opt.key)}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all",
                    paymentMethod === opt.key
                      ? "border-[#00152A] bg-gray-50"
                      : "border-gray-100 hover:border-gray-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon ? (
                      <opt.icon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <span className="text-xs font-bold text-gray-600">
                        {opt.label.split(" ")[0]}
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#00152A]">
                      {opt.label}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      paymentMethod === opt.key
                        ? "border-[#00152A]"
                        : "border-gray-300",
                    )}
                  >
                    {paymentMethod === opt.key && (
                      <div className="w-2 h-2 rounded-full bg-[#00152A]" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-md p-8">
              {paymentMethod === "card" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Card Details
                    </Label>
                    <div className="bg-white h-12 px-4 rounded border border-gray-200 flex items-center">
                      <CardElement
                        className="w-full"
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#00152A",
                              "::placeholder": { color: "#A0AEC0" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "mobile" && (
                <div className="space-y-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mobileMoneyMedium: "mobile money",
                        })
                      }
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all",
                        formData.mobileMoneyMedium === "mobile money"
                          ? "bg-[#00152A] text-white"
                          : "bg-gray-200 text-gray-500",
                      )}
                    >
                      MTN
                    </button>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mobileMoneyMedium: "orange money",
                        })
                      }
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all",
                        formData.mobileMoneyMedium === "orange money"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-500",
                      )}
                    >
                      ORANGE
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Phone Number (6XXXXXXXX)
                    </Label>
                    <PhoneInput
                      value={formData.mobileMoneyPhone}
                      onChange={(v) =>
                        setFormData({ ...formData, mobileMoneyPhone: v })
                      }
                      placeholder="670000000"
                      defaultCountryCode="CM"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                    You will receive a payment prompt on your phone. Approve it
                    to complete your booking.
                  </div>
                </div>
              )}

              {(paymentMethod === "google" || paymentMethod === "apple") && (
                <div className="space-y-4 py-2">
                  {walletAvail === "checking" && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Checking wallet availability…
                    </p>
                  )}

                  {walletAvail === "available" && paymentRequest && (
                    <>
                      <p className="text-xs text-gray-500 text-center">
                        Approve the payment in the{" "}
                        {paymentMethod === "apple" ? "Apple Pay" : "Google Pay"}{" "}
                        sheet to confirm your booking.
                      </p>
                      {!termsAccepted && (
                        <p className="text-xs text-amber-600 text-center font-semibold">
                          Accept the terms below to enable the wallet button.
                        </p>
                      )}
                      <div
                        className={cn(
                          !termsAccepted && "opacity-50 pointer-events-none",
                        )}
                      >
                        <PaymentRequestButtonElement
                          options={{
                            paymentRequest,
                            style: {
                              paymentRequestButton: {
                                theme: "dark",
                                height: "48px",
                              },
                            },
                          }}
                        />
                      </div>
                    </>
                  )}

                  {walletAvail === "unavailable" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800 text-center">
                      {paymentMethod === "apple" ? "Apple Pay" : "Google Pay"}{" "}
                      isn&apos;t available on this device or browser. Please
                      choose Card or Mobile Money instead.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Error */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
            {paymentError}
          </div>
        )}

        {/* Legal & CTA */}
        <div className="space-y-8">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(!!c)}
              className="mt-1 border-gray-300 data-[state=checked]:bg-[#00152A]"
            />
            <Label
              htmlFor="terms"
              className="text-xs text-gray-500 leading-relaxed"
            >
              I have read and agree to the{" "}
              <Link href="#" className="text-[#00152A] font-bold underline">
                Terms of Service
              </Link>{" "}
              and the{" "}
              <Link href="#" className="text-[#00152A] font-bold underline">
                Cancellation Policy
              </Link>
              .
            </Label>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                256-bit Secure Encrypted Payment
              </span>
            </div>
            {paymentMethod === "google" || paymentMethod === "apple" ? (
              <p className="text-xs text-gray-400 text-center md:text-right">
                {walletAvail === "available"
                  ? `Use the wallet button above to pay ${formatMoney(totalPrice)}.`
                  : `Select Card or Mobile Money to pay ${formatMoney(totalPrice)}.`}
              </p>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !termsAccepted}
                className="bg-[#BA722E] hover:bg-[#A35F24] text-white h-14 px-16 rounded-md text-sm font-bold w-full md:w-auto shadow-lg shadow-[#BA722E]/20 disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : `Confirm & Pay ${formatMoney(totalPrice)}`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Column: Sidebar ── */}
      <aside className="w-full lg:w-[400px] space-y-6">
        <div className="bg-[#00152A] rounded-md overflow-hidden text-white shadow-xl">
          <div className="relative h-48">
            <Image
              src={room.image}
              alt={room.name}
              fill
              sizes="400px"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00152A] to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFB77A] mb-1 block">
                Selected Room
              </span>
              <h3 className="manrope-bold text-xl">{room.name}</h3>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Check-in
                </p>
                <p className="text-sm font-bold">
                  {format(checkIn, "MMM d, yyyy")}
                </p>
              </div>
              <ArrowLeftRight className="w-4 h-4 text-[#FFB77A]" />
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Check-out
                </p>
                <p className="text-sm font-bold">
                  {format(checkOut, "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-y border-white/10 py-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {room.name} ({nights} Night{nights !== 1 ? "s" : ""})
                </span>
                <span className="font-bold">{formatMoney(roomTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Taxes (10%)</span>
                <span className="font-bold">{formatMoney(tax)}</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Total Price
                </p>
                <p className="text-3xl manrope-bold">
                  {formatMoney(totalPrice)}
                </p>
              </div>
              <span className="text-[10px] text-gray-500">All inclusive</span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Wifi className="w-3.5 h-3.5 text-[#FFB77A]" /> Complimentary
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Coffee className="w-3.5 h-3.5 text-[#FFB77A]" /> Breakfast
                incl.
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Car className="w-3.5 h-3.5 text-[#FFB77A]" /> Valet Parking
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB77A]" /> Spa Access
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-dashed border-gray-300 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#00152A]">Need assistance?</p>
            <p className="text-xs text-gray-500">
              Our Palace Concierge is online.
            </p>
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
