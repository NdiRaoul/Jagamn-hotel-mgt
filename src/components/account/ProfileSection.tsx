"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  hire_date: string | null;
  status: string;
  department: string | null;
  position: string | null;
  staff_code: string | null;
}

export function ProfileSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [phone, setPhone] = useState("");

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data.profile);
      setPhone(data.profile.phone || "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePhone() {
    if (!profile) return;
    try {
      setSaving(true);
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to update phone");
      const data = await res.json();
      setProfile(data.profile);
      toast({
        title: "Success",
        description: "Phone number updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload avatar");
      const data = await res.json();
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.avatar_url } : null,
      );
      toast({
        title: "Success",
        description: "Avatar updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-jagamn-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-500">Profile not found</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-jagamn-tertiary shadow-lg">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} />
            ) : (
              <AvatarFallback className="bg-jagamn-neutral text-jagamn-primary text-2xl font-black">
                {profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-2 bg-jagamn-primary text-white rounded-full cursor-pointer hover:bg-jagamn-tertiary transition-colors shadow-lg"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-jagamn-primary mb-1">
            {profile.full_name}
          </h3>
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">
            {profile.role}
          </p>
          {profile.staff_code && (
            <p className="text-xs text-gray-400 font-mono">
              ID: {profile.staff_code}
            </p>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-6">
        <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">
          Personal Information
        </h4>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              Full Name
            </Label>
            <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg">
              {profile.full_name}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              Email
            </Label>
            <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg whitespace-nowrap overflow-x-hidden">
              {profile.email}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              Role
            </Label>
            <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg capitalize">
              {profile.role}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              Status
            </Label>
            <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg capitalize">
              {profile.status}
            </p>
          </div>
          {profile.department && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                Department
              </Label>
              <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg">
                {profile.department}
              </p>
            </div>
          )}
          {profile.position && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                Position
              </Label>
              <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg">
                {profile.position}
              </p>
            </div>
          )}
          {profile.hire_date && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                Hire Date
              </Label>
              <p className="text-sm font-medium text-jagamn-primary px-4 py-3 bg-gray-50 rounded-lg">
                {new Date(profile.hire_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Editable Phone */}
        <div className="pt-4 border-t border-gray-100">
          <Label
            htmlFor="phone"
            className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3 block"
          >
            Phone Number
          </Label>
          <div className="flex gap-3">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
              className="flex-1 h-12 bg-white border-gray-200 rounded-lg"
            />
            <Button
              onClick={handleSavePhone}
              disabled={saving || phone === (profile.phone || "")}
              className="bg-jagamn-primary hover:bg-jagamn-tertiary h-12 px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        {/* Password Change */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
            Security
          </h4>
          <Dialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 border-gray-200 hover:border-jagamn-primary hover:text-jagamn-primary"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white z-[100]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-jagamn-primary">
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="current-password"
                    className="text-xs text-gray-500 uppercase tracking-wider font-bold"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-12 pr-12 bg-white border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-jagamn-primary"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-xs text-gray-500 uppercase tracking-wider font-bold"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 pr-12 bg-white border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-jagamn-primary"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-xs text-gray-500 uppercase tracking-wider font-bold"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pr-12 bg-white border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-jagamn-primary"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPasswordDialogOpen(false)}
                    className="flex-1 h-12 border-gray-200"
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      changingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="flex-1 h-12 bg-jagamn-primary hover:bg-jagamn-tertiary"
                  >
                    {changingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
