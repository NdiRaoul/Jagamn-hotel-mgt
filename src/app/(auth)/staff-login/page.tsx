"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const redirectTo = searchParams.get("redirect") || "";
  const isTimeout = searchParams.get("timeout") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    isTimeout
      ? "Session expired due to inactivity. Please sign in again."
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portalFor = (role: string) =>
    role === "owner"
      ? "/superadmin"
      : role === "admin" || role === "manager"
        ? "/admin"
        : role === "kitchen"
          ? "/kitchen"
          : role === "storekeeper"
            ? "/admin/procurement"
            : "/reception"; // reception

  const canVisit = (role: string, path: string) =>
    role === "owner"
      ? true
      : path.startsWith("/superadmin")
        ? false
        : path.startsWith("/admin/procurement")
          ? ["admin", "manager", "storekeeper"].includes(role)
          : path.startsWith("/admin")
            ? ["admin", "manager"].includes(role)
            : path.startsWith("/kitchen")
              ? role === "kitchen"
              : path.startsWith("/reception")
                ? ["admin", "manager", "reception"].includes(role)
                : false;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const staffResponse = await fetch(
      `/api/staff/me${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`,
    );
    const staffData = await staffResponse.json();

    if (!staffResponse.ok || !staffData?.staff) {
      await supabase.auth.signOut();
      setError("Access denied / account suspended");
      setIsSubmitting(false);
      return;
    }

    if (staffData.must_reset_pw) {
      router.push("/reset-password");
      return;
    }

    const destination =
      redirectTo && canVisit(staffData.role, redirectTo)
        ? redirectTo
        : portalFor(staffData.role);
    router.push(destination);
  }
  return (
    <div className="w-full max-w-sm space-y-12">
      <div className="space-y-3">
        <h2 className="manrope-bold text-4xl text-[#00152A]">Staff Portal</h2>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          Secure access for authorized personnel only.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="name@jagamnpalace.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-14 pl-12 bg-[#F4F6F8] border-0 rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 pl-12 bg-[#F4F6F8] border-0 rounded-md focus-visible:ring-1 focus-visible:ring-[#BA722E]"
              />
            </div>
          </div>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-[#BA722E] hover:bg-[#A36328] text-white font-bold rounded-md shadow-xl shadow-[#BA722E]/20 flex items-center justify-center gap-2 group transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "SIGN IN"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>

      <div className="flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#00152A] transition-colors"
        >
          <Globe className="w-4 h-4" />
          Return to Main Website
        </Link>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* ── Left Side: Brand & Visual ──────────────── */}
      <div className="relative w-full hidden lg:flex md:w-[50%] h-[40vh] md:h-screen overflow-hidden">
        <Image
          src="/images/staff-portal-image.png"
          alt="Jagamn Palace Interior"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-[#00152A]/60" />

        {/* Content on Image */}
        <div className="absolute inset-0 p-12 md:p-20 flex flex-col justify-end">
          <div className="max-w-md space-y-6">
            <h1 className="manrope-bold text-5xl md:text-7xl text-white leading-tight">
              The Stately
              <br />
              Modernist
            </h1>
            <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed">
              We are a tribal and hospitality brand that feels like a family.
              Enter your credentials to access the estate management portal.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side: Login Form ─────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20">
        <Suspense
          fallback={
            <div className="w-full max-w-sm space-y-12">
              <div className="space-y-3">
                <h2 className="manrope-bold text-4xl text-[#00152A]">
                  Staff Portal
                </h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Loading...
                </p>
              </div>
            </div>
          }
        >
          <StaffLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
