"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** Reads ?tab= from the URL and syncs the active tab — must be inside <Suspense>. */
function TabSync({
  onTab,
}: {
  onTab: (tab: "signin" | "signup") => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup") onTab("signup");
  }, [searchParams, onTab]);
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate login
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* ── Left Side: Brand Imagery ────────────────── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden">
        <Image
          src="/images/login-image.png"
          alt="Jagamn Palace Lobby"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-jagamn-primary via-transparent to-transparent opacity-80" />

        {/* Content */}
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

        {/* Security Badge */}
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
        <div className="max-w-md w-full space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="manrope-bold text-2xl text-jagamn-primary">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500">
              Access your guest dashboard and managed bookings.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("signin")}
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
              onClick={() => setActiveTab("signup")}
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

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSignIn}>
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="guest@jagamnpalace.com"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
              </div>

              {/* Password */}
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="border-0 border-b border-gray-100 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-jagamn-primary transition-colors placeholder:text-gray-200"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="remember"
                className="border-gray-200 data-[state=checked]:bg-jagamn-primary"
              />
              <Label
                htmlFor="remember"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer"
              >
                Keep me signed in for 30 days
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-jagamn-primary hover:bg-jagamn-primary/90 text-white font-bold rounded-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Securing Entry..." : "Sign Into Palace"}
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

          {/* Social Auth */}
          <Button
            variant="outline"
            className="w-full h-14 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm flex items-center justify-center gap-3"
          >
            <Image
              src="/images/Google-logo.png"
              alt="Google"
              width={20}
              height={20}
              className=""
            />
            Sign in with Google
          </Button>

          {/* Quote */}
          <div className="pt-8 text-center">
            <p className="text-[10px] text-gray-400 italic leading-relaxed">
              &ldquo;Elegance is the only beauty that never fades.&rdquo; —
              Jagamn Concierge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
