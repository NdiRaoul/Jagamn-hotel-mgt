"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, PartyPopper } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const [showModal, setShowModal] = useState(true);

  // Show the celebratory success modal, then auto-redirect to /login.
  useEffect(() => {
    const redirect = setTimeout(() => {
      router.push("/login");
    }, 10000);
    const hideModal = setTimeout(() => setShowModal(false), 6000);
    return () => {
      clearTimeout(redirect);
      clearTimeout(hideModal);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      {/* Account-created success modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <PartyPopper className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="text-4xl">🎉</div>
            <h2 className="manrope-bold text-2xl text-jagamn-primary">
              Account Created!
            </h2>
            <p className="text-sm text-gray-500">
              Welcome to the Palace Club. Just one more step — verify your email.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-jagamn-neutral flex items-center justify-center mx-auto">
          <MailCheck className="w-10 h-10 text-jagamn-tertiary" />
        </div>
        <div className="space-y-3">
          <h1 className="manrope-bold text-3xl text-jagamn-primary">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            A verification email has been sent to{" "}
            <strong className="text-jagamn-primary">{email}</strong> — please
            verify your account.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-4 h-4 border-2 border-jagamn-tertiary border-t-transparent rounded-full animate-spin" />
          Redirecting you to sign in…
        </div>
        <Link
          href="/login"
          className="inline-block text-[10px] font-bold text-gray-400 hover:text-jagamn-primary uppercase tracking-widest transition-colors"
        >
          Go to sign in now
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
