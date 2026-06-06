"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  PackageSearch,
  BarChart2,
  Plus,
  HelpCircle,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STOREKEEPER_NAV = [
  { label: "Dashboard", icon: LayoutGrid, href: "/storekeeper" },
  { label: "Inventory", icon: UtensilsCrossed, href: "/storekeeper/inventory" },
  { label: "Purchase Orders", icon: PackageSearch, href: "/storekeeper/purchase-orders" },
  { label: "Reports", icon: BarChart2, href: "/storekeeper/reports" },
];

export default function StorekeperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      {/* ── Mobile Overlay ────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside
        className={cn(
          "bg-[#00152A] text-white flex flex-col transition-all duration-300 z-50 fixed inset-y-0 left-0 md:relative md:h-full",
          isSidebarOpen
            ? "w-60 translate-x-0"
            : "w-60 -translate-x-full md:w-20 md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 pb-4 shrink-0">
          {isSidebarOpen ? (
            <div>
              <h2 className="text-[#BA722E] font-extrabold text-lg leading-tight">
                The Palace
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Storekeeper Services
              </p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#BA722E] flex items-center justify-center font-bold text-white text-sm">
              P
            </div>
          )}
        </div>

        {/* New Order CTA */}
        <div className="px-4 mb-6 shrink-0">
          <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-11 rounded-md flex items-center justify-center gap-2 text-gray-300 hover:text-white overflow-hidden transition-all">
            <Plus className="w-4 h-4 text-[#BA722E] shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold whitespace-nowrap">New Purchase Order</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {STOREKEEPER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-md transition-all group",
                pathname === item.href
                  ? "bg-[#1A2E42] text-white border-l-2 border-l-[#BA722E]"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  pathname === item.href ? "text-[#BA722E]" : "text-gray-500 group-hover:text-white"
                )}
              />
              {isSidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Help */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0">
          <Link
            href="/kitchen/help"
            className="flex items-center gap-4 px-3 py-3 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Help</span>}
          </Link>

          {/* Chef Profile */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2">
            <Avatar className="w-9 h-9 border-2 border-[#BA722E]/30 shrink-0">
              <AvatarImage src="/images/avatar-staff.png" />
              <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">CA</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Mr. Atabong Joe</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold truncate">
                  Chief Storekeeper
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-18 bg-white border-b border-gray-100 px-8 flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="manrope-bold text-lg text-[#00152A] whitespace-nowrap">
              Store Management
            </h2>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders, ingredients..."
              className="bg-[#F4F6F8] border-0 h-10 pl-10 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-gray-200"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Icons */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50">
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <Avatar className="w-9 h-9 border-2 border-gray-100">
                <AvatarImage src="/images/avatar-staff.png" />
                <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">AJ</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-[#00152A]">Mr. Atabong Joe</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Chief Storekeeper</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}