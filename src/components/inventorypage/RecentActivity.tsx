"use client";

import { ActivityItem } from "./purchaseData";

const dotColors: Record<string, string> = {
  amber: "bg-amber-400",
  dark:  "bg-gray-900",
  gray:  "bg-gray-300",
  green: "bg-green-500",
};

interface RecentActivityProps {
  items: ActivityItem[];
  onViewAll: () => void;
}

export function RecentActivity({ items, onViewAll }: RecentActivityProps) {
  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-base">⊙</span>
          <h2 className="font-bold text-gray-900 text-base">Recent Activity</h2>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wide"
        >
          View All
        </button>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1.75 top-2 bottom-2 w-px bg-gray-100" />

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start relative">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ring-2 ring-white ${dotColors[item.color]}`} />
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{item.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                <p className="text-[10px] text-gray-300 mt-0.5 font-medium">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}