"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Shield, Cloud, AlertTriangle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName?: string;
  staffEmail?: string;
  staffAvatar?: string;
}

export function StaffEditModal({ open, onOpenChange, staffName = "Julian St. James", staffEmail = "julian.stjames@regencysuite.com", staffAvatar = "JS" }: StaffEditModalProps) {
  const [isDeactivated, setIsDeactivated] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] lg:w-full lg:max-w-4xl p-6 lg:p-10 rounded-2xl border-0 shadow-2xl bg-[#F8F9FA] gap-6 max-h-[95vh] flex flex-col">
        <DialogHeader className="space-y-1 shrink-0">
          <DialogTitle className="manrope-bold text-2xl text-jagamn-primary">Edit Staff Profile</DialogTitle>
          <p className="text-gray-500 text-sm font-medium">Update administrative details for <span className="text-jagamn-primary font-bold">{staffName}</span></p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
          <div className="flex flex-col md:flex-row gap-8 mt-2">
            {/* Left Column: Avatar & Security */}
            <div className="w-full md:w-[280px] space-y-6 shrink-0">
              {/* Avatar Card */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-jagamn-primary rounded-l-xl" />
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg rounded-xl">
                    <AvatarFallback className="bg-jagamn-primary text-white manrope-bold text-2xl rounded-xl">{staffAvatar}</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-2 -right-2 bg-[#E8924A] text-white p-2 rounded-lg shadow-md hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="manrope-bold text-lg text-jagamn-primary">{staffName}</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">ID: #RS-9921</p>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-green-700">ACTIVE ACCOUNT</span>
                </div>
              </div>

              {/* Security Context */}
              <div className="bg-[#0D2137] p-6 rounded-xl shadow-xl text-white">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-4 h-4 text-[#E8924A]" />
                  <h4 className="manrope-bold text-sm">Security Context</h4>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">Last Login</span>
                    <span>2h ago</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">Access</span>
                    <span>Standard</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">
                  RESET PASSWORD
                </Button>
              </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Legal Name</Label>
                  <Input defaultValue={staffName} className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Corporate Email</Label>
                  <Input defaultValue={staffEmail} className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Department</Label>
                  <Select defaultValue="concierge">
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus:ring-0 focus:border-jagamn-tertiary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concierge">Concierge & Guest Services</SelectItem>
                      <SelectItem value="front-desk">Front Desk</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Role Assignment</Label>
                  <Select defaultValue="senior">
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-lg text-sm font-semibold focus:ring-0 focus:border-jagamn-tertiary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="senior">Senior Lead Concierge</SelectItem>
                      <SelectItem value="standard">Concierge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base Annual Salary (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">$</span>
                  <Input defaultValue="72,500.00" className="h-12 bg-white border-gray-200 rounded-lg pl-8 text-sm font-semibold focus-visible:ring-0 focus-visible:border-jagamn-tertiary transition-all" />
                </div>
                <p className="text-[9px] text-gray-400 font-medium pt-1">Last adjustment: Jan 12, 2024</p>
              </div>

              <hr className="border-gray-100 my-4" />

              <div className={cn("p-6 rounded-xl flex items-center justify-between border transition-colors", isDeactivated ? "bg-red-50 border-red-100" : "bg-white border-gray-100 shadow-sm")}>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm manrope-bold text-red-600 mb-1">DEACTIVATE ACCOUNT</h4>
                    <p className="text-xs text-gray-500 font-medium">Revokes all access to administration, payroll, and logs.</p>
                  </div>
                </div>
                <Switch checked={isDeactivated} onCheckedChange={setIsDeactivated} className="data-[state=checked]:bg-red-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-gray-400">
            <Cloud className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">AUTO-SAVE ENABLED</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-6 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-jagamn-primary">
              Cancel
            </Button>
            <Button className="h-11 px-8 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white manrope-bold rounded-lg shadow-md transition-all">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
