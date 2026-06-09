"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  app_user_id: string | null;
  staff_id: string | null;
  role: string | null;
}

interface AudienceDescriptor {
  kind: "guest" | "staff";
  userId?: string | null;
  staffId?: string | null;
  role?: string | null;
}

/**
 * Unified notification bell for guests and staff. The list + unread count come
 * from the scoped `/api/notifications` route; a Supabase realtime subscription
 * prepends matching new rows live and toasts them. One component, two audiences.
 */
export function NotificationBell({ audience }: { audience: "guest" | "staff" }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const descriptorRef = useRef<AudienceDescriptor | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
      descriptorRef.current = data.audience ?? null;
    } catch {
      // bell is non-critical — fail quietly
    }
  }, []);

  useEffect(() => {
    // async IIFE: the initial fetch's setState happens after `await`, so it is
    // not a synchronous effect update.
    void (async () => {
      await load();
    })();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${audience}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as NotificationItem;
          const d = descriptorRef.current;
          if (!d) return;
          const mine =
            d.kind === "guest"
              ? n.app_user_id === d.userId
              : n.staff_id === d.staffId || (!!n.role && n.role === d.role);
          if (!mine) return;
          setItems((prev) => [n, ...prev].slice(0, 20));
          if (!n.is_read) setUnread((c) => c + 1);
          toast(n.title, { description: n.body || undefined });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [audience]);

  const markOne = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // optimistic — ignore
    }
  };

  // Clicking a notification marks it read and, for dining/order notifications,
  // asks the kitchen board (if mounted) to open the related order's detail.
  const handleItemClick = (n: { id: string; type: string; is_read: boolean }) => {
    if (!n.is_read) markOne(n.id);
    if (n.type === "dining" || n.type === "order") {
      window.dispatchEvent(
        new CustomEvent("jagamn-open-order", { detail: { id: n.id } }),
      );
    }
  };

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      // optimistic — ignore
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) load();
      }}
    >
      <PopoverTrigger asChild>
        <button
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-bold text-sm text-[#0D2137]">Notifications</span>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-[10px] font-bold uppercase tracking-widest text-[#BA722E] hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-400">
              No notifications yet.
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors flex gap-3",
                  !n.is_read && "bg-[#FFF8F0]",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 w-2 h-2 rounded-full shrink-0",
                    n.is_read ? "bg-transparent" : "bg-[#BA722E]",
                  )}
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-xs text-[#0D2137] truncate">
                    {n.title}
                  </span>
                  {n.body && (
                    <span className="block text-[11px] text-gray-500 line-clamp-2">
                      {n.body}
                    </span>
                  )}
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
