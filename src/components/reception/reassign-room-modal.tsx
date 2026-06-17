"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";

export interface ReassignTarget {
  bookingId: string;
  unitCode: string;
  guestName: string | null;
  roomSlug: string | null; // current room-type slug
  roomTypeName: string;
  balanceDue: number;
}

interface RoomTypeOpt {
  id: string;
  slug: string;
  name: string;
  price_per_night: number;
}

export function ReassignRoomModal({
  target,
  onClose,
}: {
  target: ReassignTarget | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [types, setTypes] = useState<RoomTypeOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setError(null);
    setSelectedSlug(target.roomSlug ?? "");
    setLoading(true);
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((d: { rooms?: RoomTypeOpt[] }) => {
        const opts = (d.rooms ?? [])
          .map((rt) => ({
            id: rt.id,
            slug: rt.slug,
            name: rt.name,
            price_per_night: rt.price_per_night,
          }))
          .filter((o) => o.slug && typeof o.price_per_night === "number");
        setTypes(opts);
      })
      .catch(() => setError("Could not load room types"))
      .finally(() => setLoading(false));
  }, [target]);

  if (!target) return null;

  const currentType = types.find((t) => t.slug === target.roomSlug);
  const selectedType = types.find((t) => t.slug === selectedSlug);
  const basePrice = currentType?.price_per_night ?? 0;
  const delta = (selectedType?.price_per_night ?? 0) - basePrice;
  const direction = !selectedType
    ? null
    : selectedType.slug === target.roomSlug
      ? "current"
      : delta > 0
        ? "upgrade"
        : delta < 0
          ? "downgrade"
          : "lateral";

  async function handleSubmit() {
    if (!selectedType || !target) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reception/reassign-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: target.bookingId,
          room_slug: selectedType.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reassignment failed");
        return;
      }
      toast.success(
        `Moved to ${data.roomType} — Room ${data.unitCode}${
          data.typeChanged
            ? ` (${data.direction}, new total ${formatMoney(data.newTotal)})`
            : ""
        }`,
      );
      onClose();
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const dirBadge = {
    upgrade: { label: "Upgrade", cls: "bg-emerald-50 text-emerald-600", Icon: ArrowUpRight },
    downgrade: { label: "Downgrade", cls: "bg-amber-50 text-amber-600", Icon: ArrowDownRight },
    lateral: { label: "Same Rate", cls: "bg-gray-100 text-gray-500", Icon: ArrowLeftRight },
    current: { label: "Current Room", cls: "bg-gray-100 text-gray-500", Icon: ArrowLeftRight },
  } as const;

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="manrope-bold text-xl text-[#00152A]">
            Reassign Room
          </DialogTitle>
          <DialogDescription>
            {target.guestName || target.bookingId} — currently in Room{" "}
            {target.unitCode} ({target.roomTypeName})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              New Room Type
            </Label>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading types…
              </div>
            ) : (
              <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                <SelectTrigger className="mt-1 h-12">
                  <SelectValue placeholder="Choose a room type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.slug} value={t.slug}>
                      {t.name} — {formatMoney(t.price_per_night)}/night
                      {t.slug === target.roomSlug ? " (current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedType && direction && (
            <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                  dirBadge[direction].cls,
                )}
              >
                {(() => {
                  const I = dirBadge[direction].Icon;
                  return <I className="w-3 h-3" />;
                })()}
                {dirBadge[direction].label}
              </span>
              {(direction === "upgrade" || direction === "downgrade") && (
                <span className="text-sm font-bold text-[#00152A]">
                  {delta > 0 ? "+" : ""}
                  {formatMoney(delta)}
                </span>
              )}
            </div>
          )}

          {selectedType && selectedType.slug !== target.roomSlug && (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              The stay will be re-rated at {formatMoney(selectedType.price_per_night)}/night.
              Any change updates the room balance shown on the board. A free unit
              of this type is assigned automatically.
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !selectedType ||
              selectedType.slug === target.roomSlug
            }
            className="bg-[#00152A] text-white"
          >
            {submitting ? "Reassigning…" : "Confirm Reassignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
