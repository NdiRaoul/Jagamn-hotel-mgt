"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Users, UserCheck, Repeat, X } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import type { CustomerRow, CustomersResult } from "@/lib/data/customers";

export default function UsersClient({ data }: { data: CustomersResult }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "member" | "guest" | "returning">(
    "all",
  );
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return data.rows.filter((r) => {
      const matchesSearch =
        !q ||
        (r.full_name ?? "").toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        r.bookings.some((b) => b.booking_ref.toLowerCase().includes(q));
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "returning"
            ? r.returning
            : filter === "member"
              ? r.role === "member"
              : r.role !== "member";
      return matchesSearch && matchesFilter;
    });
  }, [data.rows, search, filter]);

  const cards = [
    { label: "Total Users", value: data.overview.total, icon: Users },
    { label: "Members", value: data.overview.members, icon: UserCheck },
    { label: "Guests", value: data.overview.guests, icon: Users },
    { label: "Returning", value: data.overview.returning, icon: Repeat },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jagamn-tertiary">
          Directory
        </p>
        <h1 className="manrope-bold text-3xl text-jagamn-primary">
          Users &amp; Customers
        </h1>
        <p className="text-sm text-jagamn-secondary mt-1">
          All members and guests of the hotel, with booking history.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-jagamn-secondary mb-2">
              <c.icon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                {c.label}
              </p>
            </div>
            <p className="manrope-bold text-3xl text-jagamn-primary">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, booking ID…"
            className="w-full h-11 pl-10 pr-3 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jagamn-primary"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "member", "guest", "returning"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                filter === f
                  ? "bg-jagamn-primary text-white"
                  : "text-jagamn-secondary hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-jagamn-primary text-white text-[10px] uppercase tracking-widest">
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Bookings</th>
                <th className="text-left px-4 py-3 font-semibold">Account</th>
                <th className="text-right px-4 py-3 font-semibold">Total Spent</th>
                <th className="text-center px-4 py-3 font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 ${idx % 2 ? "bg-gray-50/40" : "bg-white"}`}
                >
                  <td className="px-5 py-3 text-sm font-semibold text-jagamn-primary">
                    {r.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        r.role === "member"
                          ? "bg-jagamn-tertiary/10 text-jagamn-tertiary"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.role === "member" ? "Member" : "Guest"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.booking_count}
                    {r.returning && (
                      <span className="ml-2 text-[10px] font-bold text-jagamn-tertiary uppercase">
                        Returning
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        r.has_account
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.has_account ? "Account" : "No account"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-jagamn-primary">
                    {formatMoney(r.total_spent)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelected(r)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-jagamn-secondary hover:bg-gray-100 hover:text-jagamn-primary transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-sm text-gray-400 italic"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="manrope-bold text-xl text-jagamn-primary">
                  {selected.full_name ?? "Guest"}
                </h3>
                <p className="text-sm text-jagamn-secondary">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <Detail label="Phone" value={selected.phone ?? "—"} />
              <Detail
                label="Type"
                value={selected.role === "member" ? "Member" : "Guest"}
              />
              <Detail label="Loyalty" value={selected.loyalty_tier} />
              <Detail
                label="Account"
                value={selected.has_account ? "Authenticated" : "No account"}
              />
              <Detail label="Bookings" value={String(selected.booking_count)} />
              <Detail
                label="Total spent"
                value={formatMoney(selected.total_spent)}
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-jagamn-secondary mb-2">
              Booking history
            </p>
            {selected.bookings.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No bookings yet.</p>
            ) : (
              <ul className="space-y-2">
                {selected.bookings.map((b) => (
                  <li
                    key={b.booking_ref}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-jagamn-primary">
                        {b.booking_ref}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(b.check_in).toLocaleDateString()} –{" "}
                        {new Date(b.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-jagamn-primary">
                        {formatMoney(b.total_amount)}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase ${
                          b.payment_status === "paid"
                            ? "text-green-600"
                            : "text-jagamn-tertiary"
                        }`}
                      >
                        {b.payment_status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-jagamn-primary font-medium">{value}</p>
    </div>
  );
}
