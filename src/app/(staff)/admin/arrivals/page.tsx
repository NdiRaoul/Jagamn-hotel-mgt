import React from "react";
import { CalendarDays } from "lucide-react";
import { getArrivals, getDepartures } from "@/lib/data/reception";

export const dynamic = "force-dynamic";

// Read-only oversight view for admin: guest name + arrival/checkout dates only.
// No check-in actions, no room assignment, no payment controls — those live in
// the reception portal (which admins cannot reach).
export default async function AdminArrivalsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);
  const until = horizon.toISOString().slice(0, 10);

  const [arrivals, departures] = await Promise.all([
    getArrivals(today, until).catch(() => []),
    getDepartures(today, until).catch(() => []),
  ]);

  // Merge by booking id so each guest shows both arrival and checkout dates.
  const checkoutById = new Map(departures.map((d) => [d.id, d.checkOut]));
  const rows = arrivals.map((a) => ({
    id: a.id,
    guestName: a.guestName,
    arrival: a.checkIn,
    checkout: checkoutById.get(a.id) ?? null,
  }));

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">
            Front Desk Oversight
          </p>
          <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
            Arrivals
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
            Read-only view of upcoming guest arrivals and checkout dates.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full md:min-w-[640px] text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Guest
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Arrival
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Checkout
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 md:px-8 py-5 manrope-bold text-sm text-[#0D2137]">
                      {r.guestName}
                    </td>
                    <td className="px-6 md:px-8 py-5 text-sm text-slate-500">
                      {fmt(r.arrival)}
                    </td>
                    <td className="px-6 md:px-8 py-5 text-sm text-slate-500">
                      {fmt(r.checkout)}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-20 text-center text-slate-400 manrope-bold italic"
                    >
                      <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      No upcoming arrivals.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
