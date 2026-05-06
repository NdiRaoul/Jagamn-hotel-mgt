"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Headset, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate request
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Reset link sent to your email.");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="max-w-4xl w-full flex overflow-hidden rounded-md shadow-2xl bg-white min-h-[600px]">
        {/* ── Left Side: Brand/Security Info ────────────────── */}
        <div className="hidden md:flex w-[45%] bg-jagamn-primary p-12 flex-col justify-between text-white relative">
          <div className="space-y-12">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#FFB77A]" />
              <span className="manrope-bold text-lg tracking-tight">Jagamn Palace</span>
            </div>

            <div className="space-y-6">
              <h1 className="manrope-bold text-4xl leading-tight">Security<br />& Access</h1>
              <p className="text-gray-400 text-sm leading-relaxed font-manrope">
                Restoring access to your private suite and guest dashboard. Our security protocols ensure your profile remains protected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-md border border-white/10">
            <div className="w-10 h-10 rounded bg-[#1A2E42] flex items-center justify-center">
              <Headset className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Concierge Assistance</p>
              <p className="text-[10px] text-gray-500">Need immediate help? Call us.</p>
            </div>
          </div>
        </div>

        {/* ── Right Side: Reset Form ─────────────────────── */}
        <div className="flex-1 p-12 md:p-20 flex flex-col justify-center">
          <div className="max-w-sm w-full space-y-10">
            <div className="space-y-4">
              <h2 className="manrope-bold text-3xl text-jagamn-primary">Forgot Password?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enter the email address associated with your guest account. We will send a secure link to reset your access credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Guest Email Address
                </Label>
                <div className="bg-[#ECEEF0] rounded px-4 py-1">
                  <Input
                    type="email"
                    placeholder="e.g. guest@royal-residency.com"
                    className="border-none bg-transparent h-12 px-0 focus-visible:ring-0 text-jagamn-primary placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing..." : "Request Reset Link"}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-jagamn-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Guest Login
                </Link>
              </div>
            </form>

            <div className="pt-8 flex items-center gap-3 bg-gray-50 rounded p-4 border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                System secured by palace encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
