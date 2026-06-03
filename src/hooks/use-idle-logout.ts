"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { IDLE_TIMEOUT_MS, IDLE_WARNING_MS } from "@/lib/auth/session-constants";

const HEARTBEAT_THROTTLE_MS = 4 * 60 * 1000; // at most one heartbeat / 4 min
const BROADCAST_CHANNEL = "staff-session";
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "click",
  "touchstart",
] as const;

export interface UseIdleLogout {
  showWarning: boolean;
  secondsRemaining: number;
  /** User confirmed they're present — reset the timer and ping the server. */
  stayActive: () => void;
  /** User chose to log out immediately. */
  logoutNow: () => void;
}

/**
 * Tracks user activity in a staff portal, warns 60s before the 20-minute idle
 * limit, hard-logs-out at the limit, and stays in sync across tabs via
 * BroadcastChannel. The server-side teeth live in `getStaffSession` +
 * `proxy.ts` (both read the HttpOnly activity cookie); this hook is the UX.
 */
export function useIdleLogout(
  timeoutMs: number = IDLE_TIMEOUT_MS,
  warningMs: number = IDLE_WARNING_MS,
): UseIdleLogout {
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(warningMs / 1000),
  );

  const deadlineRef = useRef<number>(0); // set in the mount effect (impure now())
  const lastHeartbeatRef = useRef<number>(0);
  const showWarningRef = useRef(false);
  const loggingOutRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const doLogout = useCallback(
    async (broadcast: boolean) => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      if (broadcast) channelRef.current?.postMessage({ type: "logout" });
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // best-effort — proceed to the login page regardless
      }
      router.push("/staff-login?timeout=1");
    },
    [router],
  );

  const sendHeartbeat = useCallback(() => {
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_THROTTLE_MS) return;
    lastHeartbeatRef.current = now;
    fetch("/api/staff/heartbeat", { method: "POST" })
      .then((res) => {
        if (res.status === 401) doLogout(true);
      })
      .catch(() => {});
  }, [doLogout]);

  const resetDeadline = useCallback(() => {
    deadlineRef.current = Date.now() + timeoutMs;
    if (showWarningRef.current) {
      showWarningRef.current = false;
      setShowWarning(false);
    }
  }, [timeoutMs]);

  // Real activity inside THIS tab.
  const handleActivity = useCallback(() => {
    // Once the warning is showing, ignore passive events so the countdown is
    // real — only an explicit "Stay signed in" should dismiss it.
    if (showWarningRef.current) return;
    resetDeadline();
    sendHeartbeat();
    channelRef.current?.postMessage({ type: "activity" });
  }, [resetDeadline, sendHeartbeat]);

  const stayActive = useCallback(() => {
    resetDeadline();
    sendHeartbeat();
    channelRef.current?.postMessage({ type: "activity" });
  }, [resetDeadline, sendHeartbeat]);

  const logoutNow = useCallback(() => {
    doLogout(true);
  }, [doLogout]);

  useEffect(() => {
    deadlineRef.current = Date.now() + timeoutMs;

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === "activity") {
          resetDeadline();
        } else if (event.data?.type === "logout") {
          doLogout(false);
        }
      };
    }

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true }),
    );
    const onVisibility = () => {
      if (document.visibilityState === "visible") handleActivity();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ticker = setInterval(() => {
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        doLogout(true);
        return;
      }
      if (remaining <= warningMs) {
        if (!showWarningRef.current) {
          showWarningRef.current = true;
          setShowWarning(true);
        }
        setSecondsRemaining(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity),
      );
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(ticker);
      channel?.close();
      channelRef.current = null;
    };
  }, [handleActivity, resetDeadline, doLogout, warningMs, timeoutMs]);

  return { showWarning, secondsRemaining, stayActive, logoutNow };
}
