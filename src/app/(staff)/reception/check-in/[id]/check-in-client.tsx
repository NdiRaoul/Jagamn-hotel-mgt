"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CheckInClient({
  booking,
  availableRooms,
}: {
  booking: any;
  availableRooms: any[];
}) {
  const router = useRouter();
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assignedRoomId, setAssignedRoomId] = useState<string | null>(
    booking?.room_id ?? null,
  );
  const checkedIn = booking?.status === "checked_in";

  const paymentColor =
    booking?.payment_status === "paid"
      ? "bg-green-100 text-green-700"
      : booking?.payment_status === "failed"
        ? "bg-red-100 text-red-700"
        : booking?.payment_status === "refunded"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-100 text-amber-700";

  async function assignRoom(roomId: string) {
    setAssigning(roomId);
    try {
      const res = await fetch(`/api/reception/check-in/${booking.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not assign room");
      }
      setAssignedRoomId(roomId);
      toast.success("Room assigned — guest checked in.");
      // Re-render server data so the room board / arrivals reflect it without
      // a manual refresh.
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "Could not assign room");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="manrope-bold text-3xl">
          Check In — {booking?.booking_ref}
        </h1>
        <Badge className={`text-[10px] font-black uppercase ${paymentColor}`}>
          {booking?.payment_status || "pending"}
        </Badge>
        {checkedIn && (
          <Badge className="bg-green-100 text-green-700 text-[10px] font-black uppercase">
            Checked in
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-500">Guest: {booking?.guest_name}</p>
      <p className="text-sm text-gray-500">
        Room type: {booking?.room_types?.name ?? booking?.room_slug}
      </p>
      <p className="text-sm text-gray-500">
        Total: {formatMoney(booking?.total_amount ?? 0)}
      </p>
      <div>
        <h3 className="text-sm font-bold mb-2">Available Rooms</h3>
        <ul className="space-y-2">
          {availableRooms.map((r) => {
            const isAssigned = assignedRoomId === r.id;
            return (
              <li key={r.id} className="flex items-center justify-between">
                <span>
                  {r.unit_code} {r.floor ? `(Floor ${r.floor})` : null}
                </span>
                {isAssigned ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircle2 className="w-4 h-4" /> Assigned
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={assigning !== null || !!assignedRoomId}
                    onClick={() => assignRoom(r.id)}
                  >
                    {assigning === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Assign"
                    )}
                  </Button>
                )}
              </li>
            );
          })}
          {availableRooms.length === 0 && (
            <li className="text-sm text-gray-400">No rooms available</li>
          )}
        </ul>
      </div>
    </div>
  );
}
