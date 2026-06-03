"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIdleLogout } from "@/hooks/use-idle-logout";

/**
 * SessionGuard — wraps a staff portal and enforces the 20-minute idle policy.
 *
 * Warns at 19:00 ("Still there?" countdown modal) and hard-logs-out at 20:00.
 * Server-side enforcement lives in `getStaffSession` and `proxy.ts`; this is
 * the in-app warning + auto-logout UX, synced across tabs.
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { showWarning, secondsRemaining, stayActive, logoutNow } =
    useIdleLogout();

  return (
    <>
      {children}

      <Dialog
        open={showWarning}
        onOpenChange={(open) => {
          if (!open) stayActive();
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Still there?</DialogTitle>
            <DialogDescription>
              You&apos;ve been inactive for a while. For your security,
              you&apos;ll be signed out in{" "}
              <span className="font-semibold text-[#BA722E]">
                {secondsRemaining}s
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={logoutNow}>
              Log out now
            </Button>
            <Button
              onClick={stayActive}
              className="bg-[#BA722E] hover:bg-[#A36328] text-white"
            >
              Stay signed in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
