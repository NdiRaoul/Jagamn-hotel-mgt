"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "signin",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign-in fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign-up fields
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  // Password visibility toggles
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createSupabaseBrowserClient();

  // ── Password strength ──────────────────────────────────────────────────────
  function getPasswordStrength(pw: string): {
    level: "weak" | "fair" | "strong";
    label: string;
    color: string;
    width: string;
  } {
    if (pw.length < 4)
      return {
        level: "weak",
        label: "Too short",
        color: "bg-red-500",
        width: "w-1/4",
      };
    if (pw.length < 8) {
      return {
        level: "weak",
        label: "Weak",
        color: "bg-red-500",
        width: "w-1/3",
      };
    }
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const typeCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
      Boolean,
    ).length;
    if (pw.length >= 10 && typeCount >= 3) {
      return {
        level: "strong",
        label: "Strong",
        color: "bg-green-500",
        width: "w-full",
      };
    }
    return {
      level: "fair",
      label: "Fair",
      color: "bg-amber-500",
      width: "w-2/3",
    };
  }

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // ── Sign In ────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    if (error) {
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  // ── Sign Up ────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (signUpPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);

    // Check if a member account already exists with this email
    // (guest rows are fine — they get upgraded; only block if already a member)
    const checkRes = await fetch(
      `/api/auth/check-email?email=${encodeURIComponent(signUpEmail)}`,
    );
    if (checkRes.ok) {
      const { role } = await checkRes.json();
      if (role === "member") {
        setError("An account with this email already exists. Please sign in.");
        setIsSubmitting(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    // If session is immediately available (email confirmation disabled), create profile and redirect
    if (data.session) {
      await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email: signUpEmail }),
      });
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setSuccessMsg(
      "Account created! Check your email to confirm your account before signing in.",
    );
    setIsSubmitting(false);
  };

  // ── Google OAuth ───────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* ── Left Side: Brand Imagery ────────────────── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden">
        <Image
          src="/images/login-image.png"
          alt="Jagamn Palace Lobby"
          fill
          sizes="45vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-jagamn-primary via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-20 left-20 right-20 space-y-10">
          <div className="space-y-4">
            <h2 className="manrope-bold text-white text-xl">Jagamn Palace</h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Experience the ultimate intersection of heritage hospitality and
              digital precision. Step into your private sanctuary.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-[1px] w-12 bg-jagamn-tertiary" />
            <span className="manrope-bold text-jagamn-tertiary text-xs uppercase tracking-[0.3em]">
              The Stately Modernist
            </span>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-md rounded-md p-3 flex items-center gap-3 border border-white/20 shadow-xl">
          <div className="w-8 h-8 rounded-full bg-jagamn-tertiary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white uppercase tracking-wider">
              Security Protocol
            </p>
            <p className="text-[9px] text-gray-300">
              AES-256 Encrypted Connection
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side: Auth Forms ─────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 xl:px-48 bg-[#FAFAFA]">
        <div className="max-w-md w-full space-y-10">
          <div className="space-y-2">
            <h1 className="manrope-bold text-2xl text-jagamn-primary">
              {activeTab === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-gray-500">
              {activeTab === "signin"
                ? "Access your guest dashboard and managed bookings."
                : "Join the Palace Club for exclusive benefits."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => {
                setActiveTab("signin");
                setError(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative",
                activeTab === "signin"
                  ? "text-jagamn-primary"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Sign In
              {activeTab === "signin" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jagamn-primary" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "pb-4 px-10 text-xs font-bold uppercase tracking-widest transition-all relative",
                activeTab === "signup"
                  ? "text-jagamn-primary"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Create Account
              {activeTab === "signup" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jagamn-primary" />
              )}
            </button>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
              {successMsg}
            </div>
          )}

          {/* ── Sign In Form ── */}
          {activeTab === "signin" && (
            <form className="space-y-8" onSubmit={handleSignIn}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="guest@jagamnpalace.com"
                    className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      type={showSignInPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 pr-8 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-0 text-gray-300 hover:text-jagamn-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Securing Entry..." : "Sign Into Palace"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {activeTab === "signup" && (
            <form className="space-y-6" onSubmit={handleSignUp}>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Full Name
                </Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Johnathan Doe"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="guest@jagamnpalace.com"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Password
                </Label>
                <div className="relative flex items-center">
                  <Input
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => {
                      setSignUpPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    onBlur={() => {
                      if (signUpPassword && signUpPassword.length < 4) {
                        setPasswordError(
                          "Password must be at least 4 characters.",
                        );
                      } else {
                        setPasswordError(null);
                      }
                    }}
                    placeholder="••••••••"
                    className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 pr-8 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-0 text-gray-300 hover:text-jagamn-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Password strength bar */}
                {signUpPassword.length > 0 &&
                  (() => {
                    const s = getPasswordStrength(signUpPassword);
                    return (
                      <div className="space-y-1 pt-1">
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${s.color} ${s.width}`}
                          />
                        </div>
                        <p
                          className={`text-[10px] font-bold ${s.level === "strong" ? "text-green-600" : s.level === "fair" ? "text-amber-600" : "text-red-500"}`}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })()}
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Confirm Password
                </Label>
                <div className="relative flex items-center">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError(null);
                    }}
                    onBlur={() => {
                      if (
                        confirmPassword &&
                        confirmPassword !== signUpPassword
                      ) {
                        setConfirmPasswordError("Passwords do not match.");
                      } else {
                        setConfirmPasswordError(null);
                      }
                    }}
                    placeholder="••••••••"
                    className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 pr-8 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 text-gray-300 hover:text-jagamn-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-600 mt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Creating Account..." : "Create Palace Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em]">
              <span className="bg-[#FAFAFA] px-4 text-gray-400">
                Or Secure With
              </span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-14 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm flex items-center justify-center gap-3"
          >
            <Image
              src="/images/Google-logo.png"
              alt="Google"
              width={20}
              height={20}
            />
            Sign in with Google
          </Button>

          <div className="pt-4 flex flex-col items-center gap-4">
            <p className="text-[10px] text-gray-400 italic leading-relaxed text-center">
              &ldquo;Elegance is the only beauty that never fades.&rdquo; —
              Jagamn Concierge
            </p>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-jagamn-primary uppercase tracking-widest transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Back to Jagamn Palace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
