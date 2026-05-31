"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UserCircle, User, CalendarRange, FileText, WalletCards, HelpCircle } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { LeaveSection } from "./LeaveSection";
import { PayslipsSection } from "./PayslipsSection";
import { PayoutSection } from "./PayoutSection";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "leave", label: "Leave Requests", icon: CalendarRange },
  { id: "payslips", label: "Payslips", icon: FileText },
  { id: "payout", label: "Payout Methods", icon: WalletCards },
];

export function AccountPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-3xl p-0 flex flex-col bg-[#F4F6F8] border-l-0 shadow-2xl"
      >
        <SheetHeader className="p-6 pb-0 bg-white border-b border-gray-100 flex-shrink-0">
          <SheetTitle className="manrope-bold text-2xl text-[#0D2137] flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-[#BA722E]" />
            My Account
          </SheetTitle>
          <div className="flex gap-6 mt-6 overflow-x-auto scrollbar-hide border-b-2 border-transparent">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-[#BA722E] text-[#0D2137]"
                      : "border-transparent text-slate-500 hover:text-[#0D2137]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#BA722E]" : ""}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "leave" && <LeaveSection />}
          {activeTab === "payslips" && <PayslipsSection />}
          {activeTab === "payout" && <PayoutSection />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AccountButton({
  isSidebarOpen = true,
  className = "",
}: {
  isSidebarOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ||
          `flex items-center gap-4 px-4 py-3 rounded-md transition-all group text-gray-500 hover:text-white hover:bg-white/5`
        }
      >
        <UserCircle className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-white" />
        {isSidebarOpen && (
          <span className="text-sm font-medium whitespace-nowrap">My Account</span>
        )}
      </button>
      <AccountPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
