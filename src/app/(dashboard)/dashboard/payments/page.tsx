"use client";

import Image from "next/image";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  {
    id: "p1",
    type: "Visa Signature",
    number: "•••• •••• •••• 4829",
    expiry: "09/26",
    label: "Primary Card",
    icon: "/images/visa-logo.png", // Using a placeholder concept for now
    border: "border-l-jagamn-primary",
  },
  {
    id: "p2",
    type: "Mastercard Gold",
    number: "•••• •••• •••• 1105",
    expiry: "12/25",
    label: "Secondary",
    icon: "/images/mastercard-logo.png",
    border: "border-l-jagamn-primary",
  },
  {
    id: "p3",
    type: "Mobile Money",
    number: "+254 ••• ••• 882",
    expiry: "Verified",
    label: "Digital Wallet",
    icon: "/images/momo-logo.png",
    border: "border-l-jagamn-primary",
  },
];

const RECENT_ACTIVITY = [
  {
    id: "t1",
    title: "Regency Suite - 3 Nights",
    date: "Oct 12, 2023",
    method: "Visa •••• 4829",
    amount: "$2,450.00",
    status: "Completed",
    icon: Bed,
  },
  {
    id: "t2",
    title: "The Gilded Fork - Dinner Service",
    date: "Oct 11, 2023",
    method: "Mastercard •••• 1105",
    amount: "$412.50",
    status: "Completed",
    icon: UtensilsCrossed,
  },
  {
    id: "t3",
    title: "Velvet Spa - Full Body Ritual",
    date: "Oct 10, 2023",
    method: "Visa •••• 4829",
    amount: "$180.00",
    status: "Completed",
    icon: Sparkles,
  },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="manrope-bold text-5xl text-jagamn-primary tracking-tight">
            Secure Payments
          </h1>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your verified accounts and saved cards for a seamless
            experience across all Jagamn Palace services.
          </p>
        </div>
        <Button className="h-12 px-8 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-jagamn-primary font-bold shadow-lg shadow-jagamn-tertiary/20 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Method
        </Button>
      </div>

      {/* ── Saved Methods ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            className={cn(
              "bg-white rounded-md p-8 shadow-sm border border-gray-100 border-l-4 flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:shadow-md transition-shadow",
              method.border,
            )}
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {method.label}
                </p>
                <h3 className="manrope-bold text-lg text-jagamn-primary">
                  {method.type}
                </h3>
              </div>
              <button className="text-gray-300 hover:text-jagamn-primary transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="manrope-bold text-lg text-jagamn-primary tracking-[0.2em]">
                {method.number}
              </p>
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Expires {method.expiry}
                </p>
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Card Dash ─────────────────────────── */}
      <div className="bg-white rounded-md border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center space-y-4 hover:bg-gray-50/50 hover:border-jagamn-tertiary transition-all cursor-pointer group">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-jagamn-tertiary group-hover:text-white transition-all">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="manrope-bold text-lg text-jagamn-primary">
            Add another payment option
          </h4>
          <p className="text-xs text-gray-400">
            Connect Apple Pay, PayPal, or a corporate card.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Recent Activity ─────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-100 p-10 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="manrope-bold text-2xl text-jagamn-primary">
              Recent Activity
            </h2>
            <button className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest flex items-center gap-2 hover:underline">
              Download Statements <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-8">
            {RECENT_ACTIVITY.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-jagamn-primary group-hover:bg-jagamn-neutral transition-colors">
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-jagamn-primary">
                      {activity.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-1">
                      {activity.date} • {activity.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="manrope-bold text-lg text-jagamn-primary mb-1">
                    {activity.amount}
                  </p>
                  <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] font-bold uppercase tracking-wider px-2 h-5">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security Banner ─────────────────────── */}
        <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-tertiary space-y-8 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-jagamn-tertiary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-4">
            <h3 className="manrope-bold text-xl text-jagamn-primary leading-tight">
              World-Class Security
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your payment data is encrypted using military-grade AES-256
              protocols. We never store your full CVV or PIN numbers on our
              local servers.
            </p>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest group">
            Security Settings{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Help Section ─────────────────────────── */}
      <div className="bg-jagamn-primary rounded-md p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-jagamn-primary/30">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <h3 className="manrope-bold text-3xl leading-tight">
            Having trouble with a payment?
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Our 24/7 concierge desk is available to assist with international
            transaction clearances and corporate billing.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="h-14 px-10 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat Now
          </Button>
          <Button className="h-14 px-10 bg-white text-jagamn-primary hover:bg-gray-100 font-bold gap-2">
            <Phone className="w-4 h-4" />
            Call Concierge
          </Button>
        </div>
      </div>
    </div>
  );
}
