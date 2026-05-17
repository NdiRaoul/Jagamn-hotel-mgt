"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Utensils,
  User,
  CreditCard,
  HelpCircle,
  Plus,
  Search,
  Bell,
  Crown,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Bookings", icon: CalendarDays, href: "/dashboard/bookings" },
  { label: "In-Room Dining", icon: Utensils, href: "/dashboard/dining" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Payment Methods", icon: CreditCard, href: "/dashboard/payments" },
];

const BOTTOM_NAV = [
  { label: "Help", icon: HelpCircle, href: "/dashboard/help" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadUser(user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, string>;
    }) {
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("auth_user_id", user.id)
        .single();

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Guest";

      setUserName(name);
      setUserAvatar(
        profile?.avatar_url || user.user_metadata?.avatar_url || null,
      );
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login?redirect=/dashboard");
      else loadUser(user);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

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
      {/* ── Sidebar — hidden on mobile, fixed on desktop ── */}
      <aside
        className={cn(
          "bg-[#00152A] text-white flex-col transition-all duration-300 z-50",
          "hidden md:flex md:fixed md:inset-y-0 md:left-0 md:h-full",
          isSidebarOpen ? "md:w-[280px]" : "md:w-[80px]",
        )}
      >
        {/* Logo */}
        <div className="p-8 flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#BA722E] flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div
            className={cn(
              "min-w-0 transition-opacity",
              isSidebarOpen ? "opacity-100" : "opacity-0 hidden",
            )}
          >
            <h2 className="manrope-bold text-lg leading-tight truncate">
              The Palace
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              Guest Services
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <div className="px-6 mb-8 flex-shrink-0">
          <Link href="/rooms">
            <Button className="w-full bg-[#1A2E42] hover:bg-[#253D55] border-0 h-12 rounded-md flex items-center justify-center gap-2 transition-all overflow-hidden">
              <Plus className="w-4 h-4 text-jagamn-tertiary" />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">
                  Book a Room
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-md transition-all group",
                pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "bg-[#1A2E42] text-[#FFB77A]"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href))
                    ? "text-[#FFB77A]"
                    : "text-gray-500 group-hover:text-white",
                )}
              />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">
                  {item.label}
                </span>
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
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-bold whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Floating Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#00152A] rounded-2xl shadow-2xl border border-white/10 px-2 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px]",
                isActive
                  ? "bg-[#1A2E42] text-[#FFB77A]"
                  : "text-gray-500 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-[#FFB77A]" : "text-gray-500",
                )}
              />
              <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}

        {/* Book button — mobile */}
        <Link
          href="/rooms"
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-jagamn-tertiary hover:text-white transition-all min-w-[52px]"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
            Book
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:text-white transition-all min-w-[52px]">
              <div className="w-5 h-5 rounded-full bg-jagamn-primary flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt="avatar"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                Account
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 mb-2">
            <DropdownMenuLabel>
              <p className="font-bold text-jagamn-primary truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-400 font-normal truncate">
                {userEmail}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/payments">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-500 focus:text-red-500 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* ── Main Content Area ── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300",
          isSidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]",
        )}
      >
        {/* Header */}
        <header className="h-[80px] bg-white border-b border-gray-100 px-10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-12 flex-1">
            {/* Sidebar toggle — desktop only */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 mr-4 hidden md:block"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="manrope-bold text-xl text-[#00152A] whitespace-nowrap hidden sm:block">
              {getPageTitle()}
            </h2>
            <div className="relative w-full max-w-md hidden md:block">
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

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#BA722E] transition-all flex-shrink-0">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt="Profile"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-jagamn-primary flex items-center justify-center text-white font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-[#00152A] flex items-center gap-1">
                      {userName}
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Palace Member
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-bold text-jagamn-primary">{userName}</p>
                    <p className="text-xs text-gray-400 font-normal">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/payments" className="cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" /> Payment Methods
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Content — extra bottom padding on mobile for floating nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
