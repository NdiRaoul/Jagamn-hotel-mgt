"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Grid3X3,
  Receipt,
  Plus,
  Bell,
  Settings,
  HelpCircle,
  Search,
  Menu,
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountButton } from "@/components/account/AccountPanel";
import { SessionGuard } from "@/components/staff/session-guard";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const RECEPTION_NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/reception" },
  { label: "Arrivals", icon: ArrowDownCircle, href: "/reception/arrivals" },
  { label: "Departures", icon: ArrowUpCircle, href: "/reception/departures" },
  {
    label: "Active Reservations",
    icon: CalendarDays,
    href: "/reception/reservations",
  },
  { label: "Room Board", icon: Grid3X3, href: "/reception/room-board" },
  { label: "Transactions", icon: Receipt, href: "/reception/transactions" },
];

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [staff, setStaff] = useState<{
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
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

  return (
    <SessionGuard>
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
            isSidebarOpen
              ? "w-[280px] translate-x-0"
              : "w-[280px] -translate-x-full md:w-[80px] md:translate-x-0",
          )}
        >
          {/* Logo & Portal Info */}
          <div className="p-8 pb-6 flex items-center gap-4 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#BA722E] flex items-center justify-center flex-shrink-0 font-bold text-white text-lg">
              P
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <h2 className="manrope-bold text-sm leading-tight truncate">
                  Palace Management
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Receptionist Portal
                </p>
              </div>
            )}
          </div>

          {/* Primary Action at Top */}
          <div className="px-6 mb-8 flex-shrink-0">
            <Link href="/reception/walk-in" className="block w-full">
              <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-12 rounded-md flex items-center justify-center gap-2 group transition-all text-gray-300 hover:text-white overflow-hidden">
                {isSidebarOpen ? (
                  <>
                    <Plus className="w-4 h-4 text-jagamn-tertiary" />
                    <span className="text-sm font-bold whitespace-nowrap">
                      New Reservation
                    </span>
                  </>
                ) : (
                  <Plus className="w-5 h-5 text-jagamn-tertiary" />
                )}
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
            {RECEPTION_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-md transition-all group",
                  pathname === item.href
                    ? "bg-[#1A2E42] text-white"
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

          {/* Bottom Profile & Logout */}
          <div className="mt-auto p-4 border-t border-white/5 flex-shrink-0 space-y-2">
            <AccountButton
              isSidebarOpen={isSidebarOpen}
              className="flex items-center gap-4 w-full text-left group px-4 py-2 hover:bg-white/5 rounded-md transition-colors"
            />
            <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-4 w-full text-left group">
                  <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-[#BA722E] transition-all flex-shrink-0">
                    {staff?.avatar_url && (
                      <AvatarImage src={staff.avatar_url} />
                    )}
                    <AvatarFallback className="bg-[#BA722E] text-white">
                      {staff?.full_name
                        ? staff.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                        : ""}
                    </AvatarFallback>
                  </Avatar>
                  {isSidebarOpen && (
                    <div className="min-w-0 transition-opacity opacity-100">
                      <p className="text-sm font-bold text-white truncate">
                        {staff?.full_name ?? "Reception Staff"}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold truncate">
                        {staff?.email ?? "reception@palace.com"}
                      </p>
                    </div>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0 border-0 overflow-hidden bg-white rounded-xl shadow-2xl">
                <div className="flex h-32">
                  <div className="flex-1 p-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <LogOut className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl manrope-bold text-[#00152A]">
                        System Logout
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        Confirm logout from the system
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="w-16 bg-[#F4F6F8]"></div>
                </div>
                <div className="px-8 pb-8 space-y-8">
                  <div className="space-y-2">
                    <p className="text-[#00152A] font-medium">
                      Are you sure you want to log out?
                    </p>
                    <p className="text-sm font-bold text-[#00152A]">
                      Your current shift data has been auto-saved.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsLogoutOpen(false)}
                      className="text-gray-500 hover:text-[#00152A] font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        const supabase = (
                          await import("@/lib/supabase")
                        ).createSupabaseBrowserClient();
                        await supabase.auth.signOut();
                        router.push("/staff-login");
                      }}
                      className="bg-[#00152A] hover:bg-[#0A2038] text-white px-8 font-bold rounded-lg shadow-md"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-[80px] bg-white border-b border-gray-100 px-10 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="manrope-bold text-xl text-[#00152A] whitespace-nowrap">
                Front Desk
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const q = formData.get("q") as string;
                if (q.trim()) {
                  window.location.href = `/reception/search?q=${encodeURIComponent(q)}`;
                }
              }}
              className="flex items-center gap-8 flex-1 max-w-2xl px-12"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  name="q"
                  placeholder="Search guests, rooms, bookings..."
                  className="bg-[#F4F6F8] border-0 h-11 pl-12 rounded-md focus-visible:ring-1 focus-visible:ring-gray-200"
                />
              </div>
            </form>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#00152A]">
                    {staff?.full_name ?? "Reception Staff"}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    {staff?.email ?? "reception@palace.com"}
                  </p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-gray-100">
                  {staff?.avatar_url && <AvatarImage src={staff.avatar_url} />}
                  <AvatarFallback>
                    {staff?.full_name
                      ? staff.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                      : ""}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
      </div>
    </SessionGuard>
  );
}
