"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Zap,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountButton } from "@/components/account/AccountPanel";
import { SessionGuard } from "@/components/staff/session-guard";

const KITCHEN_NAV = [
  { label: "Orders", icon: LayoutGrid, href: "/kitchen" },
  { label: "Menu Management", icon: UtensilsCrossed, href: "/kitchen/menu" },
  {
    label: "Inventory Requests",
    icon: PackageSearch,
    href: "/kitchen/inventory",
  },
  { label: "Reporting", icon: BarChart2, href: "/kitchen/reporting" },
];

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [staff, setStaff] = useState<{
    full_name: string;
    role: string;
    avatar_url: string | null;
    email: string;
  } | null>(null);

  useEffect(() => {
    async function loadStaff() {
      const res = await fetch("/api/staff/me");
      if (!res.ok) {
        router.push(`/staff-login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const data = await res.json();
      setStaff(data.staff);
    }
    loadStaff();
  }, [pathname, router]);

  const initials = staff?.full_name
    ? staff.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
    : "";

  const handleLogout = async () => {
    const supabase = (
      await import("@/lib/supabase")
    ).createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/staff-login");
  };

  return (
    <SessionGuard>
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
              ? "w-[240px] translate-x-0"
              : "w-[240px] -translate-x-full md:w-[80px] md:translate-x-0",
          )}
        >
          {/* Logo */}
          <div className="p-6 pb-4 flex-shrink-0">
            {isSidebarOpen ? (
              <div>
                <h2 className="text-[#BA722E] font-extrabold text-lg leading-tight">
                  The Palace
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Guest Services
                </p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#BA722E] flex items-center justify-center font-bold text-white text-sm">
                P
              </div>
            )}
          </div>

          {/* New Order CTA */}
          <div className="px-4 mb-6 flex-shrink-0">
            <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-11 rounded-md flex items-center justify-center gap-2 text-gray-300 hover:text-white overflow-hidden transition-all">
              <Plus className="w-4 h-4 text-[#BA722E] flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">
                  New Order
                </span>
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {KITCHEN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-md transition-all group",
                  pathname === item.href
                    ? "bg-[#1A2E42] text-white border-l-2 border-l-[#BA722E]"
                    : "text-gray-500 hover:text-white hover:bg-white/5",
                )}
                onClick={() => {
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    pathname === item.href
                      ? "text-[#BA722E]"
                      : "text-gray-500 group-hover:text-white",
                  )}
                />
                {isSidebarOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Help */}
          <div className="p-3 border-t border-white/5 space-y-1 flex-shrink-0">
            <Link
              href="/kitchen/help"
              className="flex items-center gap-4 px-3 py-3 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  Help
                </span>
              )}
            </Link>
            <AccountButton
              isSidebarOpen={isSidebarOpen}
              className="flex items-center gap-4 px-3 py-3 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all w-full text-left"
            />

            {/* Staff Profile + Logout */}
            <div className="flex items-center gap-3 px-3 py-3 mt-2">
              <Avatar className="w-9 h-9 border-2 border-[#BA722E]/30 flex-shrink-0">
                {staff?.avatar_url && <AvatarImage src={staff.avatar_url} />}
                <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {staff?.full_name ?? "Kitchen Staff"}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate">
                    {staff?.email ?? ""}
                  </p>
                </div>
              )}
              {isSidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-white transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between gap-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="manrope-bold text-lg text-[#00152A] whitespace-nowrap">
                Kitchen Operations
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
              {/* Kitchen Active */}
              <div className="flex items-center gap-2 bg-[#E6F4EA] text-[#1B7F34] text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#1B7F34] animate-pulse" />
                KITCHEN ACTIVE
              </div>

              {/* Emergency Stop */}
              <button className="flex items-center gap-1.5 border border-red-300 text-red-500 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-md hover:bg-red-50 transition-colors">
                <Zap className="w-3.5 h-3.5" />
                EMERGENCY STOP
              </button>

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
                  {staff?.avatar_url && <AvatarImage src={staff.avatar_url} />}
                  <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-[#00152A]">
                    {staff?.full_name ?? "Kitchen Staff"}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate max-w-[120px]">
                    {staff?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
