"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Boxes,
  ClipboardList,
  BarChart2,
  Plus,
  Menu,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountButton } from "@/components/account/AccountPanel";
import { SessionGuard } from "@/components/staff/session-guard";
import { NotificationBell } from "@/components/notifications/notification-bell";

const STOREKEEPER_NAV = [
  { label: "Dashboard", icon: LayoutGrid, href: "/storekeeper" },
  { label: "Inventory", icon: Boxes, href: "/storekeeper/inventory" },
  {
    label: "Purchase Orders",
    icon: ClipboardList,
    href: "/storekeeper/purchase-orders",
  },
  { label: "Reports", icon: BarChart2, href: "/storekeeper/reports" },
];

export default function StorekeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
                  Store Management
                </p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#BA722E] flex items-center justify-center font-bold text-white text-sm">
                P
              </div>
            )}
          </div>

          {/* New Purchase Order CTA */}
          <div className="px-4 mb-6 flex-shrink-0">
            <Link href="/storekeeper/purchase-orders">
              <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-11 rounded-md flex items-center justify-center gap-2 text-gray-300 hover:text-white overflow-hidden transition-all">
                <Plus className="w-4 h-4 text-[#BA722E] flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm font-bold whitespace-nowrap">
                    New Purchase Order
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {STOREKEEPER_NAV.map((item) => {
              const isActive =
                item.href === "/storekeeper"
                  ? pathname === "/storekeeper"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-3 py-3 rounded-md transition-all group",
                    isActive
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
                      isActive
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
              );
            })}
          </nav>

          {/* Bottom: Account + Profile + Logout */}
          <div className="p-3 border-t border-white/5 space-y-1 flex-shrink-0">
            <AccountButton
              isSidebarOpen={isSidebarOpen}
              className="flex items-center gap-4 px-3 py-3 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-all w-full text-left"
            />

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
                    {staff?.full_name ?? "Storekeeper"}
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
          <header className="h-[72px] bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between gap-3 flex-shrink-0">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 transition-all flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="manrope-bold text-base md:text-lg text-[#00152A] whitespace-nowrap truncate">
                Store Management
              </h2>
            </div>

            {/* Search — desktop only */}
            <div className="hidden md:flex relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inventory, orders..."
                className="bg-[#F4F6F8] border-0 h-10 pl-10 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-gray-200 w-full"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {/* Search icon — mobile */}
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
              <NotificationBell audience="staff" />
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-100">
                <Avatar className="w-9 h-9 border-2 border-gray-100">
                  {staff?.avatar_url && <AvatarImage src={staff.avatar_url} />}
                  <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#00152A]">
                    {staff?.full_name ?? "Storekeeper"}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate max-w-[120px]">
                    {staff?.email ?? ""}
                  </p>
                </div>
              </div>
              <div className="md:hidden">
                <Avatar className="w-9 h-9 border-2 border-gray-100">
                  {staff?.avatar_url && <AvatarImage src={staff.avatar_url} />}
                  <AvatarFallback className="bg-[#BA722E] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Mobile search bar */}
          {mobileSearchOpen && (
            <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search inventory, orders..."
                  className="bg-[#F4F6F8] border-0 h-10 pl-10 rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-gray-200 w-full"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
