"use client";

import { useIdleLogout } from "@/hooks/use-idle-logout";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  useIdleLogout(20);
  return <>{children}</>;
}
