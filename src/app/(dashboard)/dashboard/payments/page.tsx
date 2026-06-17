"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Smartphone,
  Plus,
  MoreVertical,
  ShieldCheck,
  ChevronRight,
  Download,
  Bed,
  UtensilsCrossed,
  Sparkles,
  MessageSquare,
  Phone,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatTxnId } from "@/lib/txn";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { format } from "date-fns";
import type { PaymentMethod, Payment } from "@/types/database";
import { useFolioSummary } from "@/hooks/use-folio";
import { OutstandingBalanceBanner } from "@/components/guest/balance";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

export default function PaymentsPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentsContent />
    </Elements>
  );
}

function PaymentsContent() {
  const supabase = createSupabaseBrowserClient();
  const stripe = useStripe();
  const elements = useElements();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { summary: folio, loading: folioLoading } = useFolioSummary();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<
    "card" | "mobile" | "google" | "apple"
  >("card");

  // Add card form (Stripe SetupIntent collects the card itself)
  const [cardHolder, setCardHolder] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileLabel, setMobileLabel] = useState("");
  const [mobileType, setMobileType] = useState<"mobile_money" | "orange_money">(
    "mobile_money",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: pm }, { data: tx }] = await Promise.all([
      supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setMethods((pm as PaymentMethod[]) || []);
    setTransactions((tx as Payment[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSetDefault(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", user.id);
    await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", id);
    loadData();
  }

  async function handleDelete(id: string) {
    await supabase.from("payment_methods").delete().eq("id", id);
    loadData();
  }

  async function handleAddMethod() {
    setSaveError(null);
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    // ── Card: real Stripe SetupIntent flow ──────────────────────────────
    // Saves a reusable payment method (off_session) that can be charged for
    // future bookings AND used to receive refunds.
    if (addType === "card") {
      if (!stripe || !elements) {
        setSaveError("Stripe is still loading. Please try again.");
        setSaving(false);
        return;
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setSaveError("Card field not found.");
        setSaving(false);
        return;
      }
      try {
        const siRes = await fetch("/api/payments/stripe/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const { clientSecret, error: siError } = await siRes.json();
        if (siError || !clientSecret) {
          setSaveError(siError || "Could not start card setup.");
          setSaving(false);
          return;
        }
        const { error: confirmError, setupIntent } =
          await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: { name: cardHolder || undefined },
            },
          });
        if (confirmError) {
          setSaveError(confirmError.message || "Card could not be saved.");
          setSaving(false);
          return;
        }
        const saveRes = await fetch("/api/payments/stripe/save-method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupIntentId: setupIntent?.id }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) {
          setSaveError(saveData.error || "Could not save card.");
          setSaving(false);
          return;
        }
        setAddModalOpen(false);
        setCardHolder("");
        loadData();
      } catch {
        setSaveError("Card setup failed. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    let row: any = { user_id: user.id, is_default: methods.length === 0 };

    if (addType === "mobile") {
      row = {
        ...row,
        method_type: mobileType,
        label:
          mobileLabel ||
          (mobileType === "mobile_money" ? "MTN MoMo" : "Orange Money"),
        phone: mobilePhone,
      };
    } else if (addType === "google") {
      row = { ...row, method_type: "google_pay", label: "Google Pay" };
    } else if (addType === "apple") {
      row = { ...row, method_type: "apple_pay", label: "Apple Pay" };
    }

    const { error } = await supabase.from("payment_methods").insert(row);
    if (error) {
      setSaveError(error.message);
    } else {
      setAddModalOpen(false);
      setCardHolder("");
      setMobilePhone("");
      setMobileLabel("");
      loadData();
    }
    setSaving(false);
  }

  function methodIcon(type: string) {
    if (type === "card")
      return <CreditCard className="w-5 h-5 text-jagamn-primary" />;
    if (type === "mobile_money" || type === "orange_money")
      return <Smartphone className="w-5 h-5 text-jagamn-primary" />;
    return <CreditCard className="w-5 h-5 text-jagamn-primary" />;
  }

  function methodDisplay(m: PaymentMethod) {
    if (m.method_type === "card")
      return `${m.card_brand || "Card"} •••• ${m.card_last4 || "****"}`;
    if (m.method_type === "mobile_money")
      return `MTN MoMo ${m.phone ? `• ${m.phone}` : ""}`;
    if (m.method_type === "orange_money")
      return `Orange Money ${m.phone ? `• ${m.phone}` : ""}`;
    if (m.method_type === "google_pay") return "Google Pay";
    if (m.method_type === "apple_pay") return "Apple Pay";
    return m.label || m.method_type;
  }

  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="manrope-bold text-5xl text-jagamn-primary tracking-tight">
            Secure Payments
          </h1>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your verified accounts and saved cards for a seamless
            experience.
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="h-12 px-8 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-jagamn-primary font-bold shadow-lg shadow-jagamn-tertiary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Method
        </Button>
      </div>

      {/* Outstanding Balance — room not fully paid and/or dining charged to room */}
      <OutstandingBalanceBanner
        summary={folio}
        loading={folioLoading}
        showAction={false}
      />

      {/* Accepted Methods Banner (static) */}
      <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Accepted Methods
        </p>
        {[
          "Visa",
          "Mastercard",
          "Google Pay",
          "Apple Pay",
          "MTN MoMo",
          "Orange Money",
        ].map((m) => (
          <span
            key={m}
            className="text-xs font-bold text-jagamn-primary border border-gray-100 px-3 py-1.5 rounded-md"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Saved Methods */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 bg-gray-100 rounded-md animate-pulse"
            />
          ))}
        </div>
      ) : methods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div
              key={method.id}
              className={cn(
                "bg-white rounded-md p-8 shadow-sm border border-gray-100 border-l-4 flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:shadow-md transition-shadow",
                method.is_default
                  ? "border-l-jagamn-tertiary"
                  : "border-l-jagamn-primary",
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {method.label || method.method_type}
                    {method.is_default && (
                      <span className="ml-2 text-jagamn-tertiary">
                        • Default
                      </span>
                    )}
                  </p>
                  <h3 className="manrope-bold text-lg text-jagamn-primary">
                    {methodDisplay(method)}
                  </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-300 hover:text-jagamn-primary transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!method.is_default && (
                      <DropdownMenuItem
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Star className="w-4 h-4 mr-2" /> Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(method.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-between items-end">
                {method.card_expiry && (
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Expires {method.card_expiry}
                  </p>
                )}
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center ml-auto">
                  {methodIcon(method.method_type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => setAddModalOpen(true)}
          className="bg-white rounded-md border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center space-y-4 hover:bg-gray-50/50 hover:border-jagamn-tertiary transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-jagamn-tertiary group-hover:text-white transition-all">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="manrope-bold text-lg text-jagamn-primary">
              Add a payment method
            </h4>
            <p className="text-xs text-gray-400">
              Connect a card, mobile money, or digital wallet.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-100 p-10 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="manrope-bold text-2xl text-jagamn-primary">
              Transaction History
            </h2>
            <button className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest flex items-center gap-2 hover:underline">
              Download Statements <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-8">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-jagamn-primary group-hover:bg-jagamn-neutral transition-colors">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-jagamn-primary">
                        {tx.booking_ref
                          ? `Booking ${tx.booking_ref}`
                          : "Payment"}
                      </h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-1">
                        {formatTxnId(tx.id)} •{" "}
                        {format(new Date(tx.created_at), "MMM d, yyyy")} •{" "}
                        {tx.payment_method || tx.provider || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="manrope-bold text-lg text-jagamn-primary mb-1">
                      ${(tx.amount / 100).toLocaleString("en-US")}
                    </p>
                    <Badge
                      className={cn(
                        "border-0 text-[8px] font-bold uppercase tracking-wider px-2 h-5",
                        tx.status === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Banner */}
        <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-tertiary space-y-8">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-jagamn-tertiary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-4">
            <h3 className="manrope-bold text-xl text-jagamn-primary leading-tight">
              World-Class Security
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your payment data is encrypted using military-grade AES-256
              protocols.
            </p>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest group">
            Security Settings{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-jagamn-primary rounded-md p-6 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 shadow-2xl shadow-jagamn-primary/30">
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <h3 className="manrope-bold text-2xl sm:text-3xl leading-tight">
            Having trouble with a payment?
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Our 24/7 concierge desk is available to assist with international
            transaction clearances.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <Button
            variant="outline"
            className="h-14 px-6 py-3 sm:px-10 bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 flex-1 justify-center"
          >
            <MessageSquare className="w-4 h-4" /> Chat Now
          </Button>
          <Button className="h-14 px-6 py-3 sm:px-10 bg-white text-jagamn-primary hover:bg-gray-100 font-bold gap-2 flex-1 justify-center">
            <Phone className="w-4 h-4" /> Call Concierge
          </Button>
        </div>
      </div>

      {/* Add Method Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="manrope-bold text-xl text-jagamn-primary">
              Add Payment Method
            </DialogTitle>
          </DialogHeader>

          {/* Method type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { key: "card", label: "Card", icon: CreditCard },
              { key: "mobile", label: "Mobile Money", icon: Smartphone },
              { key: "google", label: "Google Pay", icon: CreditCard },
              { key: "apple", label: "Apple Pay", icon: CreditCard },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAddType(opt.key as any)}
                className={cn(
                  "flex items-center gap-2 p-3 border rounded-md text-sm font-bold transition-all",
                  addType === opt.key
                    ? "border-jagamn-primary bg-jagamn-neutral text-jagamn-primary"
                    : "border-gray-100 text-gray-500 hover:border-gray-300",
                )}
              >
                <opt.icon className="w-4 h-4" /> {opt.label}
              </button>
            ))}
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-4">
              {saveError}
            </div>
          )}

          {addType === "card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Cardholder Name
                </Label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="John Doe"
                  className="bg-gray-50 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Card Details
                </Label>
                <div className="bg-gray-50 h-12 px-4 rounded-md flex items-center">
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
              <div className="flex items-start gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-jagamn-tertiary" />
                Your card is securely saved with Stripe for future bookings and
                refunds. We never store full card numbers.
              </div>
            </div>
          )}

          {addType === "mobile" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setMobileType("mobile_money")}
                  className={cn(
                    "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                    mobileType === "mobile_money"
                      ? "bg-[#00152A] text-white"
                      : "bg-gray-200 text-gray-500",
                  )}
                >
                  MTN MoMo
                </button>
                <button
                  onClick={() => setMobileType("orange_money")}
                  className={cn(
                    "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                    mobileType === "orange_money"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500",
                  )}
                >
                  Orange Money
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Phone Number
                </Label>
                <PhoneInput
                  value={mobilePhone}
                  onChange={setMobilePhone}
                  placeholder="670000000"
                  defaultCountryCode="CM"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Label (optional)
                </Label>
                <Input
                  value={mobileLabel}
                  onChange={(e) => setMobileLabel(e.target.value)}
                  placeholder="My MTN"
                  className="bg-gray-50 border-none h-11"
                />
              </div>
            </div>
          )}

          {(addType === "google" || addType === "apple") && (
            <div className="text-center py-4 text-sm text-gray-500">
              Click confirm to add{" "}
              {addType === "google" ? "Google Pay" : "Apple Pay"} as a payment
              method.
            </div>
          )}

          <Button
            onClick={handleAddMethod}
            disabled={saving}
            className="w-full h-12 bg-jagamn-primary text-white font-bold mt-4"
          >
            {saving ? "Saving..." : "Add Method"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
