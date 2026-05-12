"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EarthIcon, Menu, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="guest-layout flex flex-col min-h-screen relative">
      {/* ── Navbar ── */}
      <header className="px-8 py-6 flex items-center justify-between text-white bg-jagamn-primary">
        <div className="font-bold text-xl tracking-widest uppercase">
          <Link href="/">Jagamn Palace</Link>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/rooms" className="hover:text-jagamn-tertiary transition-colors">
            Rooms & Suites
          </Link>
          <Link href="#dining" className="hover:text-jagamn-tertiary transition-colors">
            Fine Dining
          </Link>
          <Link href="#spa" className="hover:text-jagamn-tertiary transition-colors">
            The Spa
          </Link>
          <Link href="#offers" className="hover:text-jagamn-tertiary transition-colors">
            Offers
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/login" className="hover:text-jagamn-tertiary transition-colors">
            Sign In
          </Link>
          <Link href="/login?tab=signup" className="hover:text-jagamn-tertiary transition-colors">
            Register
          </Link>
          <Link href="/rooms">
            <Button className="bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white border-0 rounded-sm px-6">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/login">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login?tab=signup">Register</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/rooms">Rooms & Suites</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/rooms">
                  <Button className="w-full bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white border-0 rounded-sm">
                    Book Now
                  </Button>
                </Link>
              </DropdownMenuItem>
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
              <h3 className="font-bold text-xl mb-4 uppercase tracking-[0.2em]">Jagamn Palace</h3>
              <p className="text-sm text-white/60 leading-relaxed font-manrope">
                Where heritage architecture meets contemporary luxury. Experience the hospitality of kings.
              </p>
              <div className="w-fit flex items-center gap-5 mt-5">
                <span className="border border-white/20 rounded-xl p-2"><EarthIcon /></span>
                <span className="border border-white/20 rounded-xl p-2"><Share2 /></span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">Explore</h4>
              <ul className="space-y-3 text-sm text-white/80 font-manrope">
                <li><Link href="/rooms" className="hover:text-jagamn-tertiary transition-colors">Rooms & Suites</Link></li>
                <li><Link href="#dining" className="hover:text-jagamn-tertiary transition-colors">Dining Experiences</Link></li>
                <li><Link href="#spa" className="hover:text-jagamn-tertiary transition-colors">Wellness & Spa</Link></li>
                <li><Link href="#tours" className="hover:text-jagamn-tertiary transition-colors">Palace Tours</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">Concierge</h4>
              <ul className="space-y-3 text-sm text-white/80 font-manrope">
                <li><Link href="/rooms" className="hover:text-jagamn-tertiary transition-colors">Make a Booking</Link></li>
                <li><Link href="#events" className="hover:text-jagamn-tertiary transition-colors">Group Events</Link></li>
                <li><Link href="#weddings" className="hover:text-jagamn-tertiary transition-colors">Weddings</Link></li>
                <li><Link href="#contact" className="hover:text-jagamn-tertiary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-white/50">Newsletter</h4>
              <p className="text-sm text-white/60 mb-4 font-manrope">Join our elite circle for exclusive palace offers.</p>
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
            <p>&copy; 2026 JAGAMN PALACE HOTELS & RESORTS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link href="#privacy" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
              <Link href="#terms" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
