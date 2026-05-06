"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Globe,
  Plane,
  ShieldCheck,
  Settings,
  HelpCircle,
  Crown,
  ChevronRight,
  LogOut,
  Trash2,
  Download,
  Lock,
  Gift,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="manrope-bold text-5xl text-jagamn-primary tracking-tight">
            Your Digital Identity
          </h1>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your personal information, security settings, and stay
            preferences for your upcoming visit to Jagamn Palace.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="h-12 px-8 border-gray-200 text-jagamn-primary font-bold hover:bg-gray-50"
          >
            Discard Changes
          </Button>
          <Button
            className="h-12 px-8 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white font-bold shadow-lg shadow-jagamn-tertiary/20"
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 2000);
            }}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Left Column: Personal Details ───────────── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-primary space-y-10">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-jagamn-tertiary" />
              <h2 className="manrope-bold text-xl text-jagamn-primary">
                Personal Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Full Name
                </Label>
                <div className="bg-gray-50 rounded px-4 h-14 flex items-center">
                  <Input
                    defaultValue="Kumfa Jina"
                    className="border-0 bg-transparent h-full px-0 focus-visible:ring-0 text-jagamn-primary font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="bg-gray-50 rounded px-4 h-14 flex items-center">
                  <Input
                    defaultValue="besibangk@gmail.com"
                    className="border-0 bg-transparent h-full px-0 focus-visible:ring-0 text-jagamn-primary font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phone Number
                </Label>
                <div className="bg-gray-50 rounded px-4 h-14 flex items-center">
                  <Input
                    defaultValue="+237 679693831"
                    className="border-0 bg-transparent h-full px-0 focus-visible:ring-0 text-jagamn-primary font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Country of Residence
                </Label>
                <div className="bg-gray-50 rounded px-4 h-14 flex items-center justify-between">
                  <span className="text-jagamn-primary font-bold">
                    Cameroon
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                Identification Document
              </Label>
              <div className="bg-gray-50 rounded-md p-6 flex items-center justify-between group hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-jagamn-primary flex items-center justify-center text-white">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-jagamn-primary">
                        Passport • **** **** 8821
                      </p>
                      <Badge className="bg-blue-50 text-blue-600 border-0 text-[8px] font-bold uppercase tracking-wider h-5">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Expires Oct 2028
                    </p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-jagamn-tertiary uppercase tracking-[0.2em] hover:underline">
                  Update
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Membership Level */}
            <div className="bg-[#E6E8EA] rounded-md p-10 space-y-6">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Membership Level
              </p>
              <h3 className="manrope-bold text-4xl text-jagamn-primary leading-tight">
                Gold Elite
              </h3>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-jagamn-tertiary rounded-full w-[75%]" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 text-right uppercase tracking-widest">
                  75% to Platinum
                </p>
              </div>
            </div>

            {/* Total Palace Points */}
            <div className="bg-white rounded-md p-10 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-tertiary flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Total Palace Points
                </p>
                <h3 className="manrope-bold text-4xl text-jagamn-tertiary tracking-tight">
                  24,850
                </h3>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-bold text-jagamn-primary uppercase tracking-widest group">
                Explore Rewards{" "}
                <Gift className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Preferences & Security ─────── */}
        <div className="space-y-8">
          {/* Stay Preferences */}
          <div className="bg-jagamn-primary rounded-md p-8 text-white space-y-10 shadow-xl">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-jagamn-tertiary" />
              <h2 className="manrope-bold text-xl text-white">
                Stay Preferences
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { label: "High Floor Preference", active: true },
                { label: "Quiet Zone Only", active: false },
                { label: "Allergen-Free Bedding", active: true },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-300">
                    {pref.label}
                  </span>
                  <Switch
                    checked={pref.active}
                    className="data-[state=checked]:bg-jagamn-tertiary"
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-2">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Pillow Menu Choice
              </p>
              <p className="text-xs font-bold text-white">
                Egyptian Cotton • Firm Goose Down
              </p>
            </div>
          </div>

          {/* Security & Access */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-primary space-y-6 relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5">
              <Lock className="w-32 h-32" />
            </div>
            <h2 className="manrope-bold text-lg text-jagamn-primary">
              Security & Access
            </h2>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Last password change: 42 days ago
              </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-bold text-jagamn-tertiary uppercase tracking-widest group">
              Change Password{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Upgrade Promo */}
          <div className="relative h-[200px] rounded-md overflow-hidden shadow-sm group">
            <Image
              src="/images/palace-detail.png"
              alt="Upgrade"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h4 className="manrope-bold text-white text-lg leading-tight mb-1">
                Your Next Exclusive Upgrade
              </h4>
              <p className="text-[10px] text-jagamn-tertiary uppercase tracking-widest">
                Spa & Wellness Suite Access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Actions ────────────────────────── */}
      <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h4 className="manrope-bold text-sm text-jagamn-primary">
            Account Privacy
          </h4>
          <p className="text-xs text-gray-500">
            Request a copy of your personal data or delete your account
            permanently.
          </p>
        </div>
        <div className="flex items-center gap-10">
          <button className="text-xs font-bold text-gray-400 hover:text-jagamn-primary transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
}
