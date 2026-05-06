"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, AlertCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function FindReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/reception/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F4F6F8] z-50 flex flex-col overflow-y-auto animate-in fade-in duration-300">
      <header className="px-10 py-8 flex items-center justify-between flex-shrink-0">
        <Link href="/reception">
          <Button variant="ghost" className="text-gray-500 hover:text-[#00152A] gap-2 px-0 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Return to Front Desk
          </Button>
        </Link>
        <h2 className="manrope-bold text-xl text-[#00152A]">
          Palace Management
        </h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-10 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-12">
          <div className="space-y-4">
            <h1 className="manrope-bold text-5xl text-[#00152A]">Find Reservation</h1>
            <p className="text-gray-500 text-lg">
              Enter the booking reference or guest details to retrieve the folio.
            </p>
          </div>

          {initialQuery && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold">!</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-red-600 font-bold">Booking Reference not found</h3>
                <p className="text-sm text-red-500">
                  The reference number does not match any active or historical reservation. Please verify the code with the guest and search again.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-16 pl-14 pr-12 text-lg bg-white border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-[#BA722E] rounded-xl text-[#00152A] font-medium"
              />
              {query && (
                <button 
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-16 px-8 bg-[#00152A] hover:bg-[#0A2038] text-white rounded-xl shadow-md flex items-center gap-2">
              <span className="font-bold">Search Again</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 space-y-4">
            <h4 className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest">
              Search Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Ensure there are no leading or trailing spaces.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                For third-party bookings (Expedia, Booking.com), use the OTA reference ID.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Try searching by the primary guest's last name instead.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
