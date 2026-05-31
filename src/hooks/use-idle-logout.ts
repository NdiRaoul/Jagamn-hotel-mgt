"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function useIdleLogout(timeoutMinutes = 20) {
  const router = useRouter();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/staff-login?timeout=1");
  };

  const resetTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(handleLogout, timeoutMs);
  };

  // Heartbeat ping to keep server session alive
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/staff/heartbeat", { method: "POST" }).catch(() => {});
    }, 5 * 60 * 1000); // every 5 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    resetTimer();

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const activityHandler = () => resetTimer();

    events.forEach((event) => document.addEventListener(event, activityHandler));

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((event) => document.removeEventListener(event, activityHandler));
    };
  }, [timeoutMs, router]);
}
