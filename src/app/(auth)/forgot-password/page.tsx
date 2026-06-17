"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Headset, Crown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="max-w-4xl w-full flex overflow-hidden rounded-md shadow-2xl bg-white min-h-[600px]">

        {/* ── Left Side ── */}
        <div className="hidden md:flex w-[45%] bg-jagamn-primary p-12 flex-col justify-between text-white">
          <div className="space-y-12">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Crown className="w-6 h-6 text-[#FFB77A]" />
              <span className="manrope-bold text-lg tracking-tight">Jagamn Palace</span>
            </Link>
            <div className="space-y-6">
              <h1 className="manrope-bold text-4xl leading-tight">Security<br />& Access</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
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

        {/* ── Right Side ── */}
        <div className="flex-1 p-12 md:p-20 flex flex-col justify-center">
          <div className="max-w-sm w-full space-y-10">

            {sent ? (
              /* ── Success state ── */
              <div className="space-y-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-3">
                  <h2 className="manrope-bold text-2xl text-jagamn-primary">Check Your Email</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
                  </p>
                  <p className="text-xs text-gray-400">
                    Didn&apos;t receive it? Check your spam folder or{" "}
                    <button
                      onClick={() => setSent(false)}
                      className="text-jagamn-tertiary font-bold underline"
                    >
                      try again
                    </button>.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-jagamn-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Request form ── */
              <>
                <div className="space-y-4">
                  <h2 className="manrope-bold text-3xl text-jagamn-primary">Forgot Password?</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Enter the email address associated with your guest account. We will send a secure link to reset your credentials.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Guest Email Address
                    </Label>
                    <div className="bg-[#ECEEF0] rounded px-4 py-1">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. guest@jagamnpalace.com"
                        className="border-none bg-transparent h-12 px-0 focus-visible:ring-0 text-jagamn-primary placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Sending..." : "Request Reset Link"}
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

                <div className="flex items-center gap-3 bg-gray-50 rounded p-4 border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    System secured by palace encryption
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
