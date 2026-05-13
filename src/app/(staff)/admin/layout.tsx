"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Wallet,
  Bed,
  Utensils,
  ShoppingCart,
  Menu,
  Bell,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const ADMIN_NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Staff", icon: Users, href: "/admin/staff" },
  { label: "HR", icon: Landmark, href: "/admin/hr" },
  { label: "Payroll", icon: Wallet, href: "/admin/payroll" },
  { label: "Rooms", icon: Bed, href: "/admin/rooms" },
  { label: "F&B", icon: Utensils, href: "/admin/fb" },
  { label: "Procurement", icon: ShoppingCart, href: "/admin/procurement" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────── */}
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-jagamn-primary text-white flex flex-col transition-all duration-500 z-50 shrink-0 fixed inset-y-0 left-0 md:relative md:translate-x-0 shadow-2xl md:shadow-none",
          isSidebarOpen
            ? "translate-x-0 w-[280px]"
            : "-translate-x-full md:translate-x-0 md:w-[80px]",
        )}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-jagamn-tertiary flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
              <div className="animate-in fade-in duration-500">
                <h2 className="manrope-bold text-lg leading-tight">The Palace</h2>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                  Management Suite
                </p>
              </div>
            )}
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 space-y-1 mt-8 overflow-y-auto custom-scrollbar">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-8 py-4 transition-all group relative",
                  isActive
                    ? "bg-white/10 text-white border-l-[3px] border-l-jagamn-tertiary"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent",
                )}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
                }}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
                  <span className="text-[11px] font-black tracking-[0.15em] uppercase">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full group">
            <LogOut className="w-5 h-5 group-hover:text-jagamn-tertiary" />
            {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar - Image 2 Style */}
        <header className="h-[90px] bg-white px-8 flex items-center justify-between shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-12 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-gray-400 hover:text-jagamn-tertiary transition-colors md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Global Pill Search */}
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search staff members..." 
                className="w-full h-12 bg-gray-100 border-0 rounded-2xl pl-12 text-sm font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-jagamn-tertiary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 pr-8 border-r border-gray-100">
              <button className="p-2.5 text-jagamn-primary hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-jagamn-tertiary border-2 border-white rounded-full" />
              </button>
              <button className="p-2.5 text-jagamn-primary hover:bg-gray-50 rounded-xl transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="manrope-extrabold text-[13px] text-jagamn-primary leading-none mb-1">Admin Palace</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Administrator</p>
              </div>
              <Avatar className="w-11 h-11 border-[2.5px] border-jagamn-tertiary p-0.5 shadow-sm">
                <AvatarImage src="/images/avatar-admin.png" className="rounded-full" />
                <AvatarFallback className="bg-jagamn-neutral text-jagamn-primary text-[10px] font-black">AP</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
