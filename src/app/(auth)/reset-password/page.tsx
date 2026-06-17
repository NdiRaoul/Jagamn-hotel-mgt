"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Crown, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the token in the URL hash — the SSR client exchanges it automatically.
  // We just need to wait for the session to be established.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    // Also check if already in a valid session (e.g. page reload)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="max-w-4xl w-full flex overflow-hidden rounded-md shadow-2xl bg-white min-h-[560px]">
        {/* Left brand panel */}
        <div className="hidden md:flex w-[45%] bg-jagamn-primary p-12 flex-col justify-between text-white">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Crown className="w-6 h-6 text-[#FFB77A]" />
            <span className="manrope-bold text-lg tracking-tight">
              Jagamn Palace
            </span>
          </Link>
          <div className="space-y-6">
            <h1 className="manrope-bold text-4xl leading-tight">
              Set New
              <br />
              Password
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Choose a strong password to secure your Palace Club account.
            </p>
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">
            AES-256 Encrypted
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 p-12 md:p-20 flex flex-col justify-center">
          <div className="max-w-sm w-full space-y-10">
            {done ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="manrope-bold text-2xl text-jagamn-primary">
                  Password Updated!
                </h2>
                <p className="text-sm text-gray-500">
                  Redirecting you to your dashboard…
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <h2 className="manrope-bold text-3xl text-jagamn-primary">
                    New Password
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter and confirm your new password below.
                  </p>
                </div>

                {!sessionReady && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-md">
                    Verifying your reset link… please wait.
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      New Password
                    </Label>
                    <div className="relative bg-[#ECEEF0] rounded px-4 py-1 flex items-center">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="border-none bg-transparent h-12 px-0 focus-visible:ring-0 text-jagamn-primary pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-400 hover:text-jagamn-primary"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Confirm Password
                    </Label>
                    <div className="relative bg-[#ECEEF0] rounded px-4 py-1 flex items-center">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="border-none bg-transparent h-12 px-0 focus-visible:ring-0 text-jagamn-primary pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 text-gray-400 hover:text-jagamn-primary"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !sessionReady}
                    className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating…" : "Set New Password"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <Link
                  href="/staff-login"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-jagamn-primary transition-colors"
                >
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
