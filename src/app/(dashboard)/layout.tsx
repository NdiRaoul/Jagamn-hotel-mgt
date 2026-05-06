"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Utensils,
  User,
  CreditCard,
  Settings,
  HelpCircle,
  Plus,
  Search,
  Bell,
  Crown,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Bookings", icon: CalendarDays, href: "/dashboard/bookings" },
  { label: "In-Room Dining", icon: Utensils, href: "/dashboard/dining" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Payment Methods", icon: CreditCard, href: "/dashboard/payments" },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Help", icon: HelpCircle, href: "/dashboard/help" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getSearchPlaceholder = () => {
    if (pathname === "/dashboard") return "Search activity...";
    if (pathname.includes("/bookings")) return "Search reservations...";
    if (pathname.includes("/dining")) return "Search orders...";
    if (pathname.includes("/payments")) return "Search transactions...";
    if (pathname.includes("/profile")) return "Search profile...";
    return "Search...";
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/bookings")) return "My Bookings";
    if (pathname.includes("/dining")) return "In-Room Dining";
    if (pathname.includes("/payments")) return "Payment Methods";
    if (pathname.includes("/profile")) return "My Profile";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      {/* ── Mobile Overlay ───────────────────────── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────── */}
      <aside
        className={cn(
          "bg-[#00152A] text-white flex flex-col transition-all duration-300 z-50 fixed inset-y-0 left-0 md:relative md:h-full",
          isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full md:w-[80px] md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-8 flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#BA722E] flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>
          {(isSidebarOpen || !isSidebarOpen) && (
            <div className={cn("min-w-0 transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 md:hidden")}>
              <h2 className="manrope-bold text-lg leading-tight truncate">
                The Palace
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Guest Services
              </p>
            </div>
          )}
        </div>

        {/* Primary Action */}
        <div className="px-6 mb-8 flex-shrink-0">
          <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-12 rounded-md flex items-center justify-center gap-2 group transition-all overflow-hidden">
            <Plus className="w-4 h-4 text-jagamn-tertiary" />

            {isSidebarOpen && (
              <span className="text-sm font-bold whitespace-nowrap">Request Service</span>
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-md transition-all group",
                pathname === item.href
                  ? "bg-[#1A2E42] text-[#FFB77A]"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  pathname === item.href
                    ? "text-[#FFB77A]"
                    : "text-gray-500 group-hover:text-white",
                )}
              />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-white/5 space-y-2 flex-shrink-0">
          {BOTTOM_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[80px] bg-white border-b border-gray-100 px-10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-12 flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-500 mr-4"
            >
              <Menu className="w-6 h-6" /> 
            </button>
            <h2 className="manrope-bold text-xl text-[#00152A] whitespace-nowrap">
              {getPageTitle()}
            </h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={getSearchPlaceholder()}
                className="bg-[#F4F6F8] border-0 h-11 pl-12 rounded-md focus-visible:ring-1 focus-visible:ring-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-10">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#BA722E] transition-all">
                <Image
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#00152A] flex items-center gap-1">
                  Kumfa Jina
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Palace Member
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-10">{children}</main>
      </div>
    </div>
  );
}
