"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  EarthIcon,
  Menu,
  Share2,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthUser = {
  name: string;
  email: string;
  avatar: string | null;
};

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("auth_user_id", user.id)
        .single();

      setAuthUser({
        name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Guest",
        email: user.email || "",
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      });
      setAuthLoading(false);
    }

    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="guest-layout flex flex-col min-h-screen relative">
      {/* ── Navbar ── */}
      <header className="px-4 sm:px-8 py-6 flex items-center justify-between text-white bg-jagamn-primary">
        <div className="font-bold text-xl tracking-widest uppercase">
          <Link href="/">Jagamn Palace</Link>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link
            href="/rooms"
            className="hover:text-jagamn-tertiary transition-colors"
          >
            Rooms & Suites
          </Link>
          <Link
            href="#dining"
            className="hover:text-jagamn-tertiary transition-colors"
          >
            Fine Dining
          </Link>
          <Link
            href="#spa"
            className="hover:text-jagamn-tertiary transition-colors"
          >
            The Spa
          </Link>
          <Link
            href="#offers"
            className="hover:text-jagamn-tertiary transition-colors"
          >
            Offers
          </Link>
        </nav>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : authUser ? (
            /* ── Logged-in: profile dropdown ── */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                    {authUser.avatar ? (
                      <Image
                        src={authUser.avatar}
                        alt="avatar"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-jagamn-tertiary flex items-center justify-center text-white text-xs font-bold">
                        {authUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white max-w-[120px] truncate">
                    {authUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-bold text-jagamn-primary truncate">
                    {authUser.name}
                  </p>
                  <p className="text-xs text-gray-400 font-normal truncate">
                    {authUser.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/bookings" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Bookings
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
          ) : (
            /* ── Logged-out: sign in / register ── */
            <>
              <Link
                href="/login"
                className="hover:text-jagamn-tertiary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?tab=signup"
                className="hover:text-jagamn-tertiary transition-colors"
              >
                Register
              </Link>
              <Link href="/rooms">
                <Button className="bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white border-0 rounded-sm px-6">
                  Book Now
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/10"
              >
                {!authLoading && authUser ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white/30">
                    {authUser.avatar ? (
                      <Image
                        src={authUser.avatar}
                        alt="avatar"
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-jagamn-tertiary flex items-center justify-center text-white text-[10px] font-bold">
                        {authUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/rooms">Rooms &amp; Suites</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#dining">Fine Dining</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#spa">The Spa</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#offers">Offers</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {authUser ? (
                <>
                  <DropdownMenuLabel>
                    <p className="font-bold text-jagamn-primary truncate">
                      {authUser.name}
                    </p>
                    <p className="text-xs text-gray-400 font-normal truncate">
                      {authUser.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookings">
                      <User className="w-4 h-4 mr-2" />
                      My Bookings
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
                </>
              ) : (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login?tab=signup">Register</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/rooms" className="w-full">
                      <Button className="w-full bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white border-0 rounded-sm">
                        Book Now
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-[#0A1622] text-white pt-20 pb-10 mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <h3 className="font-bold text-xl mb-4 uppercase tracking-[0.2em]">
                Jagamn Palace
              </h3>
              <p className="text-sm text-white/60 leading-relaxed font-manrope">
                Where heritage architecture meets contemporary luxury.
                Experience the hospitality of kings.
              </p>
              <div className="w-fit flex items-center gap-5 mt-5">
                <span className="border border-white/20 rounded-xl p-2">
                  <EarthIcon />
                </span>
                <span className="border border-white/20 rounded-xl p-2">
                  <Share2 />
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">
                Explore
              </h4>
              <ul className="space-y-3 text-sm text-white/80 font-manrope">
                <li>
                  <Link
                    href="/rooms"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Rooms & Suites
                  </Link>
                </li>
                <li>
                  <Link
                    href="#dining"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Dining Experiences
                  </Link>
                </li>
                <li>
                  <Link
                    href="#spa"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Wellness & Spa
                  </Link>
                </li>
                <li>
                  <Link
                    href="#tours"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Palace Tours
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">
                Concierge
              </h4>
              <ul className="space-y-3 text-sm text-white/80 font-manrope">
                <li>
                  <Link
                    href="/rooms"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Make a Booking
                  </Link>
                </li>
                <li>
                  <Link
                    href="#events"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Group Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="#weddings"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Weddings
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="hover:text-jagamn-tertiary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">
                Newsletter
              </h4>
              <p className="text-sm text-white/60 mb-4 font-manrope">
                Join our elite circle for exclusive palace offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-white/5 border border-white/10 rounded-l-md px-4 py-2 w-full text-sm focus:outline-none focus:border-jagamn-tertiary text-white font-manrope"
                />
                <button className="bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white px-4 py-2 rounded-r-md transition-colors">
                  <span className="text-xs">➔</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 font-manrope">
            <p>
              &copy; 2026 JAGAMN PALACE HOTELS & RESORTS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              <Link
                href="#privacy"
                className="hover:text-white transition-colors"
              >
                PRIVACY POLICY
              </Link>
              <Link
                href="#terms"
                className="hover:text-white transition-colors"
              >
                TERMS OF SERVICE
              </Link>
            
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
