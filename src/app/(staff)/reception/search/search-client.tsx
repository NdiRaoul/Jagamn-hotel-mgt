"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, X, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ArrivalRecord } from "@/lib/data/reception";

interface Props {
  initialQuery: string;
  results: ArrivalRecord[];
  searchError: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  pending: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-500",
};

export default function SearchClient({
  initialQuery,
  results,
  searchError,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/reception/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasSearched = initialQuery.length > 0;
  const noResults = hasSearched && results.length === 0 && !searchError;

  return (
    <div className="fixed inset-0 bg-[#F4F6F8] z-50 flex flex-col overflow-y-auto animate-in fade-in duration-300">
      <header className="px-4 sm:px-10 py-4 sm:py-8 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <Link href="/reception">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-[#00152A] gap-2 px-0 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Front Desk
          </Button>
        </Link>
        <h2 className="manrope-bold text-base sm:text-xl text-[#00152A]">
          Palace Management
        </h2>
      </header>

      <main className="flex-1 flex flex-col p-4 sm:p-10 max-w-3xl mx-auto w-full space-y-8 sm:space-y-12">
        <div className="space-y-3">
          <h1 className="manrope-bold text-3xl sm:text-5xl text-[#00152A]">
            Find Reservation
          </h1>
          <p className="text-gray-500 text-sm sm:text-lg">
            Enter the booking reference, guest name, email, or phone to
            retrieve the folio.
          </p>
        </div>

        {/* Error */}
        {searchError && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-600 font-bold">Search Error</h3>
              <p className="text-sm text-red-500">{searchError}</p>
            </div>
          </div>
        )}

        {/* No results */}
        {noResults && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm font-bold">!</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-red-600 font-bold">
                Booking Reference not found
              </h3>
              <p className="text-sm text-red-500">
                No active or historical reservation matches &ldquo;
                {initialQuery}&rdquo;. Verify the reference with the guest
                and search again.
              </p>
            </div>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, phone, booking ref…"
              className="h-14 sm:h-16 pl-14 pr-12 text-base sm:text-lg bg-white border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-[#BA722E] rounded-xl text-[#00152A] font-medium"
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
          <Button
            type="submit"
            className="h-14 sm:h-16 px-6 sm:px-8 bg-[#00152A] hover:bg-[#0A2038] text-white rounded-xl shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="font-bold">Search</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {results.length} result{results.length !== 1 ? "s" : ""} for
              &ldquo;{initialQuery}&rdquo;
            </p>
            <div className="space-y-3">
              {results.map((record) => (
                <Link
                  key={record.id}
                  href={record.actionHref ?? `/reception/check-in/${record.id}`}
                  className="block bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#BA722E]/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="manrope-bold text-lg text-[#00152A] group-hover:text-[#BA722E] transition-colors">
                        {record.guestName}
                      </h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {record.bookingRef}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300">
                          ·
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.roomType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300">
                          ·
                        </span>
                        <span className="text-xs text-gray-500">
                          Check-in: {record.checkIn}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                          STATUS_COLOR[record.status] ?? "bg-gray-100 text-gray-500",
                        )}
                      >
                        {record.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#BA722E] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tips when idle */}
        {!hasSearched && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 space-y-4">
            <h4 className="text-[10px] font-bold text-[#00152A] uppercase tracking-widest">
              Search Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Use the booking reference (e.g. JPL-00123) for exact match.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Search by guest last name or email address.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                For OTA bookings (Expedia, Booking.com), use the OTA reference
                ID.
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
