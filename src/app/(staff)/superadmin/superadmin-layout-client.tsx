"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  TrendingUp,
  History,
  Castle,
  RefreshCcw,
  UserCircle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AccountButton } from "@/components/account/AccountPanel";
import { SessionGuard } from "@/components/staff/session-guard";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StaffInfo {
  full_name: string;
  role: string;
  avatar_url?: string | null;
  email: string;
  is_owner?: boolean;
}

const SUPERADMIN_NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/superadmin" },
  { label: "Revenue", icon: TrendingUp, href: "/superadmin/revenue" },
  { label: "Users", icon: UserCircle, href: "/superadmin/users" },
  { label: "Staff", icon: Users, href: "/superadmin/staff" },
  { label: "HR", icon: Landmark, href: "/superadmin/hr" },
  { label: "Deductions", icon: DollarSign, href: "/superadmin/hr/deductions" },
  { label: "Payroll", icon: Wallet, href: "/superadmin/payroll" },
  { label: "Rooms", icon: Bed, href: "/superadmin/rooms" },
  { label: "F&B", icon: Utensils, href: "/superadmin/fb" },
  { label: "Procurement", icon: ShoppingCart, href: "/superadmin/procurement" },
  {
    label: "Financial Sync",
    icon: RefreshCcw,
    href: "/superadmin/financial-sync",
  },
  { label: "Alerts", icon: Bell, href: "/superadmin/alerts" },
  { label: "System Settings", icon: Settings, href: "/superadmin/settings" },
  { label: "Audit Logs", icon: History, href: "/superadmin/audit" },
];

export default function SuperAdminLayoutClient({
  children,
  initialStaff,
}: {
  children: React.ReactNode;
  initialStaff: StaffInfo;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [staff, setStaff] = useState<StaffInfo | null>(initialStaff || null);

  useEffect(() => {
    if (staff) return;

    async function loadStaff() {
      const res = await fetch("/api/staff/me");
      if (!res.ok) {
        router.push(`/staff-login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const data = await res.json();
      if (!data.staff?.is_owner) {
        router.push("/admin");
        return;
      }
      setStaff(data.staff);
    }

    loadStaff();
  }, [pathname, router, staff]);

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

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    window.dispatchEvent(
      new CustomEvent("jagamn-global-search", { detail: val }),
    );
  };

  return (
    <SessionGuard>
      <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "bg-[#00152A] text-white flex flex-col transition-all duration-500 z-50 shrink-0 fixed inset-y-0 left-0 md:relative shadow-2xl md:shadow-none",
            isSidebarOpen
              ? "translate-x-0 w-[280px]"
              : "-translate-x-full md:translate-x-0 md:w-[90px]",
          )}
        >
          <div
            className={cn(
              "p-8 flex items-center gap-3 transition-all duration-500",
              !isSidebarOpen && "md:px-6 md:justify-center",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#BA722E] flex items-center justify-center shrink-0">
                <Castle className="w-6 h-6 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="animate-in fade-in duration-500 overflow-hidden whitespace-nowrap">
                  <h2 className="manrope-bold text-lg leading-tight">
                    The Palace
                  </h2>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    Owner Suite
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <nav className="flex-1 min-h-0 px-0 space-y-1 mt-8 overflow-y-auto no-scrollbar overflow-x-hidden">
            <TooltipProvider delayDuration={0}>
              {SUPERADMIN_NAV.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/superadmin" &&
                    pathname.startsWith(item.href) &&
                    !SUPERADMIN_NAV.some(
                      (other) =>
                        other !== item &&
                        (pathname === other.href ||
                          pathname.startsWith(other.href + "/")),
                    ));
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-4 py-4 transition-all group relative",
                          isSidebarOpen ? "px-8" : "px-0 md:justify-center",
                          isActive
                            ? "bg-[#1A2E42] text-white border-l-2 border-l-[#BA722E]"
                            : "text-gray-500 hover:text-white hover:bg-white/5",
                        )}
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 768
                          )
                            setIsSidebarOpen(false);
                        }}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            isActive
                              ? "text-[#BA722E]"
                              : "text-gray-500 group-hover:text-white",
                          )}
                        />
                        {isSidebarOpen && (
                          <span className="text-[11px] font-black tracking-[0.15em] uppercase animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!isSidebarOpen && (
                      <TooltipContent
                        side="right"
                        className="hidden md:block bg-[#00152A] border-[#BA722E] text-white manrope-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg ml-2 shadow-2xl z-[100]"
                      >
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            {isSidebarOpen && staff && (
              <div className="px-4 pb-3 flex items-center gap-3">
                <Avatar className="w-9 h-9 border-2 border-jagamn-tertiary/40 shrink-0">
                  {staff.avatar_url && (
                    <AvatarImage
                      src={staff.avatar_url}
                      className="rounded-full"
                    />
                  )}
                  <AvatarFallback className="bg-jagamn-tertiary text-white text-xs font-black">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {staff.full_name}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold truncate">
                    {staff.email}
                  </p>
                </div>
              </div>
            )}
            <AccountButton
              isSidebarOpen={isSidebarOpen}
              className={cn(
                "flex items-center gap-4 py-3 text-gray-400 hover:text-white transition-colors w-full group",
                isSidebarOpen ? "px-4" : "md:justify-center",
              )}
            />
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-4 py-3 text-gray-400 hover:text-white transition-colors w-full group",
                isSidebarOpen ? "px-4" : "md:justify-center",
              )}
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:text-[#BA722E]" />
              {isSidebarOpen && (
                <span className="text-[11px] font-black uppercase tracking-widest animate-in fade-in duration-300 overflow-hidden whitespace-nowrap">
                  Logout
                </span>
              )}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-[72px] md:h-[90px] bg-white px-4 md:px-8 flex items-center justify-between gap-3 shrink-0 border-b border-gray-100">
            {/* Left */}
            <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 text-[#00152A] hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Search — desktop only */}
              <div className="relative w-full max-w-xl hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search across reports"
                  className="h-12 w-full bg-gray-100 pl-12 rounded-2xl border-0 focus:ring-0"
                />
              </div>
            </div>
            {/* Right */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {/* Search icon — mobile */}
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
              <NotificationBell audience="staff" />
              <button className="hidden md:flex rounded-2xl bg-[#BA722E] px-4 py-3 text-white text-[10px] font-black uppercase tracking-[0.25em]">
                Owner Portal
              </button>
            </div>
          </header>

          {/* Mobile search bar */}
          {mobileSearchOpen && (
            <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search across reports"
                  className="h-11 w-full bg-gray-100 pl-12 rounded-2xl border-0 focus:ring-0"
                  autoFocus
                />
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-4 md:p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
