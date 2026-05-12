"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ChevronDown,
  LogOut,
  Menu,
  Bell,
  Settings,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Building2,
  Utensils,
  ShoppingCart,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ADMIN_NAV = [
  { label: "STAFF", icon: Users, href: "/admin/staff" },
  { label: "HR", icon: ClipboardList, href: "/admin/hr" },
  { label: "PAYROLL", icon: CreditCard, href: "/admin/payroll" },
  { label: "ROOMS", icon: Building2, href: "/admin/rooms" },
  { label: "F&B", icon: Utensils, href: "/admin/f&b" },
  { label: "PROCUREMENT", icon: ShoppingCart, href: "/admin/procurement" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────── */}
      {/* Mobile Backdrop */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      <aside className={cn(
        "bg-jagamn-primary text-white flex flex-col transition-all duration-300 z-50 shrink-0 fixed inset-y-0 left-0 md:relative md:translate-x-0",
        isSidebarOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full md:w-[80px] md:translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-jagamn-tertiary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {(isSidebarOpen || window.innerWidth < 768) && (
            <div className="animate-in fade-in duration-500">
              <h2 className="manrope-bold text-lg leading-tight">The Palace</h2>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Management Suite</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto custom-scrollbar">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all group",
                pathname.startsWith(item.href)
                  ? "bg-jagamn-tertiary text-white shadow-lg shadow-orange-900/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <item.icon className={cn("w-5 h-5", pathname.startsWith(item.href) ? "text-white" : "text-gray-500 group-hover:text-white")} />
              {(isSidebarOpen || window.innerWidth < 768) && <span className="text-xs font-black tracking-widest uppercase">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-gray-500 hover:text-red-400 transition-all group">
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            {(isSidebarOpen || window.innerWidth < 768) && <span className="text-xs font-black tracking-widest uppercase">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-[80px] bg-white px-4 md:px-8 flex items-center justify-between shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-4 md:gap-12">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-gray-500 hover:text-jagamn-tertiary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="manrope-bold text-base md:text-xl text-jagamn-primary truncate">The Grand Palace</h1>
            <nav className="hidden lg:flex items-center gap-8">
              {['Overview', 'Analytics', 'Schedule'].map((tab) => (
                <button 
              key={tab} 
              className={cn(
                "text-sm font-bold transition-all border-b-2 py-7",
                tab === 'Overview' ? "border-jagamn-tertiary text-jagamn-tertiary" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              {tab}
            </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-100">
              <Avatar className="w-9 h-9 md:w-10 md:h-10 border-2 border-white shadow-sm">
                <AvatarImage src="/images/avatar-admin.png" />
                <AvatarFallback className="bg-orange-100 text-jagamn-tertiary text-[10px] font-black">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
