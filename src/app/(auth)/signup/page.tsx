"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    // If email confirmation is disabled, a session is returned immediately —
    // create the profile and head to the dashboard. Otherwise go to the
    // "verify your email" page.
    if (data.session) {
      await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* ── Left Side: Brand Imagery ── */}
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
              Join the Palace Club and unlock heritage hospitality with digital
              precision. Your private sanctuary awaits.
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

      {/* ── Right Side: Sign Up Form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 xl:px-48 bg-[#FAFAFA]">
        <div className="max-w-md w-full space-y-10">
          <div className="space-y-2">
            <h1 className="manrope-bold text-2xl text-jagamn-primary">
              Create Account
            </h1>
            <p className="text-sm text-gray-500">
              Join the Palace Club for exclusive benefits.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 pr-8 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-gray-300 hover:text-jagamn-primary transition-colors"
                  tabIndex={-1}
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
              <div className="relative flex items-center">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 pr-8 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 text-gray-300 hover:text-jagamn-primary transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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
            Sign up with Google
          </Button>

          <div className="pt-4 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-jagamn-tertiary hover:underline"
              >
                Log in
              </Link>
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
