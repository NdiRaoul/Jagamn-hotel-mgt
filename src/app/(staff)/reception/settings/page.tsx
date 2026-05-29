"use client";

import React, { useState } from "react";
import { Bell, Moon, Globe, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ReceptionSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="space-y-1">
        <h1 className="manrope-bold text-4xl text-[#00152A]">Settings</h1>
        <p className="text-gray-500 text-sm">
          Manage your reception portal preferences.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            icon: Bell,
            label: "Arrival Notifications",
            desc: "Get notified when a guest checks in or a new booking arrives.",
            value: notifications,
            onChange: setNotifications,
          },
          {
            icon: Globe,
            label: "Auto-Refresh Lists",
            desc: "Automatically refresh arrivals and departures every 60 seconds.",
            value: autoRefresh,
            onChange: setAutoRefresh,
          },
          {
            icon: Moon,
            label: "Dark Mode",
            desc: "Switch the portal to a dark colour scheme.",
            value: darkMode,
            onChange: setDarkMode,
          },
        ].map(({ icon: Icon, label, desc, value, onChange }) => (
          <div
            key={label}
            className="flex items-center justify-between p-6 bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-sm font-bold text-[#00152A]">
                  {label}
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
            <Switch checked={value} onCheckedChange={onChange} />
          </div>
        ))}
      </div>

      <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#BA722E]" />
          <h3 className="font-bold text-[#00152A]">Security</h3>
        </div>
        <p className="text-sm text-gray-500">
          To change your password, use the{" "}
          <a
            href="/staff-login"
            className="text-[#BA722E] underline underline-offset-2"
          >
            staff login page
          </a>{" "}
          and select "Forgot password".
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-12 px-8 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
