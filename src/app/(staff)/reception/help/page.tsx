import React from "react";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Phone,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const FAQ = [
  {
    q: "How do I check in a guest?",
    a: "Go to Arrivals, find the guest's booking, click Check In, verify their ID, assign a room, then confirm.",
  },
  {
    q: "How do I process a check-out?",
    a: "Go to Departures, find the guest, click Check Out. The system will settle the balance and mark the room as dirty.",
  },
  {
    q: "How do I create a walk-in booking?",
    a: "Click the + New Reservation button in the sidebar. Fill in guest details, select a room type, and capture payment.",
  },
  {
    q: "What does 'dirty' mean on the room board?",
    a: "A room marked dirty has been checked out and is awaiting housekeeping. It cannot be assigned to a new guest until cleaned.",
  },
  {
    q: "How do I cancel a reservation?",
    a: "Open the reservation in Active Reservations, scroll to Actions, and click Cancel & Refund. A 15% cancellation fee applies.",
  },
  {
    q: "Where can I see payment history?",
    a: "The Transactions page shows the full payment event timeline for all bookings, filterable by date, guest, and status.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div className="space-y-1">
        <h1 className="manrope-bold text-4xl text-[#00152A]">Help & Support</h1>
        <p className="text-gray-500 text-sm">
          Guides and answers for the reception portal.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: BookOpen,
            label: "Staff Manual",
            desc: "Full operational guide",
            href: "#",
          },
          {
            icon: MessageSquare,
            label: "Live Chat",
            desc: "Chat with IT support",
            href: "#",
          },
          {
            icon: Phone,
            label: "Call Desk",
            desc: "Ext. 1001 — 24/7",
            href: "tel:+1001",
          },
        ].map(({ icon: Icon, label, desc, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-[#BA722E]/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#BA722E]/10 flex items-center justify-center text-[#BA722E]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#00152A] text-sm group-hover:text-[#BA722E] transition-colors">
                {label}
              </p>
              <p className="text-[10px] text-gray-400">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#BA722E] transition-colors" />
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="manrope-bold text-xl text-[#00152A]">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-[#BA722E] shrink-0" />
                  <span className="font-bold text-sm text-[#00152A]">{q}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-6 pb-5 pt-0">
                <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-[#BA722E]/30 pl-4">
                  {a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
