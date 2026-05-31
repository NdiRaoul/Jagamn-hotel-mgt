"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function CheckInClient({
  booking,
  availableRooms,
}: {
  booking: any;
  availableRooms: any[];
}) {
  return (
    <div className="space-y-6">
      <h1 className="manrope-bold text-3xl">
        Check In — {booking?.booking_ref}
      </h1>
      <p className="text-sm text-gray-500">Guest: {booking?.guest_name}</p>
      <p className="text-sm text-gray-500">
        Room type: {booking?.room_types?.name ?? booking?.room_slug}
      </p>
      <div>
        <h3 className="text-sm font-bold mb-2">Available Rooms</h3>
        <ul className="space-y-2">
          {availableRooms.map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <span>
                {r.unit_code} {r.floor ? `(Floor ${r.floor})` : null}
              </span>
              <Button size="sm">Assign</Button>
            </li>
          ))}
          {availableRooms.length === 0 && (
            <li className="text-sm text-gray-400">No rooms available</li>
          )}
        </ul>
      </div>
    </div>
  );
}
