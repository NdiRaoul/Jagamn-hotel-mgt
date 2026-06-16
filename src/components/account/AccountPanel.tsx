"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, X } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { LeaveSection } from "./LeaveSection";
import { PayslipsSection } from "./PayslipsSection";

interface AccountButtonProps {
  isSidebarOpen?: boolean;
  className?: string;
}

export function AccountButton({
  isSidebarOpen = true,
  className,
}: AccountButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={className}>
          <UserCircle className="w-5 h-5 shrink-0 group-hover:text-jagamn-tertiary" />
          {isSidebarOpen && (
            <span className="text-[11px] font-black uppercase tracking-widest animate-in fade-in duration-300 overflow-hidden whitespace-nowrap">
              My Account
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[95vh] overflow-y-auto bg-[#F8F9FA] p-0 rounded-3xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 sm:py-6 z-10 rounded-t-3xl flex items-start justify-between gap-4">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-jagamn-primary">
              My Account
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Manage your profile, leave requests, and payslips
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#00152A] transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </div>

        <div className="px-8 py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white p-1 rounded-xl shadow-sm h-14">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-jagamn-primary data-[state=active]:text-white rounded-lg font-bold text-sm transition-all"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="leave"
                className="data-[state=active]:bg-jagamn-primary data-[state=active]:text-white rounded-lg font-bold text-sm transition-all"
              >
                Leave
              </TabsTrigger>
              <TabsTrigger
                value="payslips"
                className="data-[state=active]:bg-jagamn-primary data-[state=active]:text-white rounded-lg font-bold text-sm transition-all"
              >
                Payslips
              </TabsTrigger>
            </TabsList>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <TabsContent value="profile" className="mt-0">
                <ProfileSection />
              </TabsContent>

              <TabsContent value="leave" className="mt-0">
                <LeaveSection />
              </TabsContent>

              <TabsContent value="payslips" className="mt-0">
                <PayslipsSection />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
