"use client";

// Thin compatibility shim over `sonner`.
//
// The app's global toaster is sonner's <Toaster /> (mounted in the root
// layout). This module previously held a self-contained toast store that had
// NO renderer mounted, so every `useToast()` toast was silently dropped. To
// keep the many existing call sites working unchanged — `const { toast } =
// useToast(); toast({ title, description, variant })` — we map that shape onto
// sonner here instead of maintaining a second toast system.

import { toast as sonnerToast } from "sonner";

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

type ToastReturn = { id: string; dismiss: () => void; update: () => void };

function show(props: Toast): ToastReturn {
  const { title, description, variant } = props;
  const message = title ?? description ?? "";
  const opts = title && description ? { description } : undefined;

  const id =
    variant === "destructive"
      ? sonnerToast.error(message, opts)
      : sonnerToast.success(message, opts);

  const idStr = String(id);
  return {
    id: idStr,
    dismiss: () => sonnerToast.dismiss(id),
    update: () => {},
  };
}

/** Standalone toast — `toast({ title, description, variant })`. */
function toast(props: Toast): ToastReturn {
  return show(props);
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    toasts: [] as Toast[],
  };
}

export { useToast, toast };
