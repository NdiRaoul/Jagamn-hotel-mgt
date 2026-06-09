"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Wallet,
  Bed,
  Utensils,
  ShoppingCart,
  Menu,
  Settings,
  LogOut,
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  UserCircle,
  Bell,
  History,
  CalendarDays,
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

const ADMIN_NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Revenue", icon: TrendingUp, href: "/admin/revenue" },
  { label: "Users", icon: UserCircle, href: "/admin/users" },
  { label: "Staff", icon: Users, href: "/admin/staff" },
  { label: "Arrivals", icon: CalendarDays, href: "/admin/arrivals" },
  { label: "HR", icon: Landmark, href: "/admin/hr" },
  { label: "Deductions", icon: TrendingDown, href: "/admin/hr/deductions" },
  { label: "Payroll", icon: Wallet, href: "/admin/payroll" },
  { label: "Rooms", icon: Bed, href: "/admin/rooms" },
  { label: "F&B", icon: Utensils, href: "/admin/fb" },
  { label: "Procurement", icon: ShoppingCart, href: "/admin/procurement" },
  { label: "Alerts", icon: Bell, href: "/admin/alerts" },
  { label: "Audit Logs", icon: History, href: "/admin/audit" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    window.dispatchEvent(
      new CustomEvent("jagamn-global-search", { detail: val }),
    );
  };

  return (
    <SessionGuard>
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
            "bg-jagamn-primary text-white flex flex-col transition-all duration-500 z-50 shrink-0 fixed inset-y-0 left-0 md:relative shadow-2xl md:shadow-none",
            isSidebarOpen
              ? "translate-x-0 w-[280px]"
              : "-translate-x-full md:translate-x-0 md:w-[90px]",
          )}
        >
          {/* Logo Section */}
          <div
            className={cn(
              "p-8 flex items-center gap-3 transition-all duration-500",
              !isSidebarOpen && "md:px-6 md:justify-center",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-jagamn-tertiary flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="animate-in fade-in duration-500 overflow-hidden whitespace-nowrap">
                  <h2 className="manrope-bold text-lg leading-tight">
                    The Palace
                  </h2>
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
          <nav className="flex-1 min-h-0 px-0 space-y-1 mt-8 overflow-y-auto no-scrollbar overflow-x-hidden">
            <TooltipProvider delayDuration={0}>
              {ADMIN_NAV.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-4 py-4 transition-all group relative",
                          isSidebarOpen ? "px-8" : "px-0 md:justify-center",
                          isActive
                            ? "bg-white/10 text-white border-l-[3px] border-l-jagamn-tertiary"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent",
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
                              ? "text-white"
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
                        className="hidden md:block bg-jagamn-primary border-jagamn-tertiary text-white manrope-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg ml-2 shadow-2xl z-[100]"
                      >
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <AccountButton
              isSidebarOpen={isSidebarOpen}
              className={cn(
                "flex items-center gap-4 py-3 text-gray-400 hover:text-white transition-colors w-full group",
                isSidebarOpen ? "px-4" : "md:justify-center",
              )}
            />
            <button
              onClick={async () => {
                const supabase = (
                  await import("@/lib/supabase")
                ).createSupabaseBrowserClient();
                await supabase.auth.signOut();
                router.push("/staff-login");
              }}
              className={cn(
                "flex items-center gap-4 py-3 text-gray-400 hover:text-white transition-colors w-full group",
                isSidebarOpen ? "px-4" : "md:justify-center",
              )}
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:text-jagamn-tertiary" />
              {isSidebarOpen && (
                <span className="text-[11px] font-black uppercase tracking-widest animate-in fade-in duration-300 overflow-hidden whitespace-nowrap">
                  Logout
                </span>
              )}
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
                className="p-2 text-gray-400 hover:text-jagamn-tertiary transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Global Pill Search */}
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Global search across pages..."
                  className="w-full h-12 bg-gray-100 border-0 rounded-2xl pl-12 text-sm font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-jagamn-tertiary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 pr-8 border-r border-gray-100">
                <NotificationBell audience="staff" />
                <button className="p-2.5 text-jagamn-primary hover:bg-gray-50 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="manrope-extrabold text-[13px] text-jagamn-primary leading-none mb-1">
                    {staff?.full_name ?? "Admin Palace"}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {staff?.email ?? "admin@palace.com"}
                  </p>
                </div>
                <Avatar className="w-11 h-11 border-[2.5px] border-jagamn-tertiary p-0.5 shadow-sm">
                  {staff?.avatar_url ? (
                    <AvatarImage
                      src={staff.avatar_url}
                      className="rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-jagamn-neutral text-jagamn-primary text-[10px] font-black">
                      {staff?.full_name
                        ? staff.full_name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                        : ""}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-4 md:p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
