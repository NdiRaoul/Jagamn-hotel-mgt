"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Plane,
  Trash2,
  Download,
  Lock,
  Gift,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/ui/country-select";
import { IdInput } from "@/components/ui/id-input";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    idType: "Passport",
    idNumber: "",
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setIsOAuthUser(user?.app_metadata?.provider === "google");

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      setForm({
        fullName: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
        country: profile?.country || "",
        idType: profile?.id_type || "passport",
        idNumber: profile?.id_number || "",
      });
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!userId) return;
    setIsSaving(true);
    setSaveMsg(null);
    setSaveError(null);

    const { error } = await supabase.from("users").upsert(
      {
        auth_user_id: userId,
        full_name: form.fullName,
        phone: form.phone || null,
        country: form.country || null,
        id_type: form.idType || null,
        id_number: form.idNumber || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id" },
    );

    if (error) {
      console.error("[profile] save error:", error);
      setSaveError(`Failed to save profile: ${error.message}`);
    } else {
      setSaveMsg("Profile saved successfully.");
    }
    setIsSaving(false);
  }
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);

    if (newPassword !== confirmNewPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }

    setIsChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwMsg("Password updated successfully.");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setIsChangingPw(false);
  }

  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="manrope-bold text-5xl text-jagamn-primary tracking-tight">
            Your Digital Identity
          </h1>
          <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your personal information, security settings, and stay
            preferences.
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
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
          {saveMsg}
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Personal Details */}
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
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    className="border-0 bg-transparent h-full px-0 focus-visible:ring-0 text-jagamn-primary font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="bg-gray-100 rounded px-4 h-14 flex items-center">
                  <Input
                    value={form.email}
                    readOnly
                    className="border-0 bg-transparent h-full px-0 focus-visible:ring-0 text-jagamn-primary font-bold cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Email cannot be changed here.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Phone Number
                </Label>
                <PhoneInput
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="670000000"
                  defaultCountryCode="CM"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Country of Residence
                </Label>
                <CountrySelect
                  value={form.country}
                  onChange={(code) => setForm({ ...form, country: code })}
                  placeholder="Select your country"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Identification
                </Label>
                <IdInput
                  idType={form.idType}
                  idNumber={form.idNumber}
                  onTypeChange={(v) => setForm({ ...form, idType: v })}
                  onNumberChange={(v) => setForm({ ...form, idNumber: v })}
                  size="sm"
                />
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                Identification Document
              </Label>
              <div className="bg-gray-50 rounded-md p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-jagamn-primary flex items-center justify-center text-white">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-jagamn-primary">
                        {form.idType} •{" "}
                        {form.idNumber
                          ? `****${form.idNumber.slice(-4)}`
                          : "Not set"}
                      </p>
                      {form.idNumber && (
                        <Badge className="bg-blue-50 text-blue-600 border-0 text-[8px] font-bold uppercase tracking-wider h-5">
                          On File
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty tier (static display) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Right Column */}
        <div className="space-y-8">
          {/* Stay Preferences (static) */}
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

          {/* Change Password — hidden for Google OAuth users */}
          {!isOAuthUser && (
            <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100 border-l-4 border-l-jagamn-primary space-y-6">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-jagamn-tertiary" />
                <h2 className="manrope-bold text-lg text-jagamn-primary">
                  Change Password
                </h2>
              </div>

              {pwMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded">
                  {pwMsg}
                </div>
              )}
              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
                  {pwError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border-0 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border-0 h-11"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isChangingPw}
                  className="w-full h-11 bg-jagamn-primary text-white font-bold"
                >
                  {isChangingPw ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          )}

          {/* Upgrade Promo */}
          <div className="relative h-[200px] rounded-md overflow-hidden shadow-sm group">
            <Image
              src="/images/palace-detail.png"
              alt="Upgrade"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
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

      {/* Footer Actions */}
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
