"use client";

import Image from "next/image";
import {
  Calendar,
  BedDouble,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  LeafIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const UPCOMING_ACTIVITIES = [
  {
    title: "Signature Massage",
    location: "The Royal Spa • 60 Minutes",
    time: "Today, 3:00 PM",
    icon: LeafIcon,
    status: "Upcoming",
    statusColor: "bg-[#FFF7F0] text-[#BA722E]",
  },
  {
    title: "Dinner Delivery",
    location: "In-Room Dining • Steak Frites",
    time: "Yesterday, 8:15 PM",
    icon: UtensilsCrossed,
    status: "Delivered",
    statusColor: "bg-gray-100 text-gray-500",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-10 max-w-6xl">
      {/* ── Welcome Header ─────────────────────────── */}
      <div className="space-y-1">
        <h1 className="manrope-bold text-4xl text-jagamn-primary">
          Welcome Back, Kumfa Jina.
        </h1>
        <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
          Jagamn Palace Hotel
        </p>
      </div>

      {/* ── Top Widgets Grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Stay Widget */}
        <div className="lg:col-span-2 bg-white rounded-md border-l-4 border-l-jagamn-primary overflow-hidden flex shadow-sm border-r border-t border-b border-gray-100 group">
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Current Stay
                </p>
                <h3 className="manrope-bold text-3xl text-jagamn-primary">
                  Suite 402
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-jagamn-neutral flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-jagamn-tertiary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Check-out
                    </p>
                    <p className="text-sm font-bold text-jagamn-primary">
                      Oct 24, 11:00 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-[#FFF7F0] flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-jagamn-tertiary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Room Status
                    </p>
                    <p className="text-sm font-bold text-jagamn-primary">
                      Serviced at 10:30 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-fit bg-jagamn-primary hover:bg-jagamn-primary/90 text-white h-12 px-6 rounded-md flex items-center gap-2 mt-8">
              View Folio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-[40%] relative hidden md:block">
            <Image
              src="/images/Royal Palace Suite.png"
              alt="Suite 402"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* In-Room Dining Widget */}
        <div className="bg-white rounded-md border-l-4 border-[#FFB77A] shadow-sm p-8 flex flex-col justify-between group">
          <div className="w-12 h-12 rounded-lg bg-jagamn-neutral flex items-center justify-center mb-6">
            <UtensilsCrossed className="w-6 h-6 text-jagamn-primary" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="manrope-bold text-2xl text-jagamn-primary">
                In-Room Dining
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Explore our culinary offerings delivered straight to your suite.
              </p>
            </div>

            <Button className="w-full bg-[#FFB77A] hover:bg-[#FFA552] text-[#412000] font-bold h-12 flex items-center justify-between px-6 rounded-md">
              Order Now
              <UtensilsCrossed className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Recent & Upcoming Section ──────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Recent & Upcoming
          </h2>
          <Button
            variant="ghost"
            className="text-xs font-bold text-gray-400 hover:text-jagamn-primary uppercase tracking-widest gap-1"
          >
            See All <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPCOMING_ACTIVITIES.map((activity, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md p-6 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded bg-jagamn-neutral flex items-center justify-center">
                  <activity.icon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-jagamn-primary">
                    {activity.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {activity.location}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3 text-jagamn-tertiary" />
                    <span className="text-[10px] font-bold text-jagamn-primary">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                className={cn(
                  "border-0 text-[9px] font-bold uppercase tracking-wider px-3 py-1",
                  activity.statusColor,
                )}
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
