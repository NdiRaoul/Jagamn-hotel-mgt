"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Save, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StaffProfile } from "@/lib/data/self-service";

export function ProfileSection() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setPhone(data.profile.phone || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8 text-center text-red-500">Profile not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24 border-4 border-gray-100">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-2xl manrope-bold bg-[#0D2137] text-white">
                {profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" size="sm" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>

          {/* Details */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: profile.full_name },
              { label: "Email", value: profile.email },
              { label: "Role", value: profile.role, capitalize: true },
              { label: "Department", value: profile.department || "—" },
              { label: "Staff Code", value: profile.staff_code || "—" },
              {
                label: "Hire Date",
                value: profile.hire_date
                  ? new Date(profile.hire_date).toLocaleDateString()
                  : "—",
              },
            ].map(({ label, value, capitalize }) => (
              <div key={label}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {label}
                </p>
                <p
                  className={`manrope-bold text-sm text-[#0D2137] mt-1 ${capitalize ? "capitalize" : ""}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Annual Salary
          </p>
          <p className="manrope-bold text-xl text-[#0D2137] mt-1">
            {formatMoney(profile.salary)}
          </p>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="manrope-bold text-lg text-[#0D2137] mb-4">
          Contact Information
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="panel-phone">Phone Number</Label>
            <Input
              id="panel-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
