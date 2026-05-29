import React from "react";
import { getRoomBoard } from "@/lib/data/reception";
import RoomBoardClient from "./room-board-client";

export const dynamic = "force-dynamic";

export default async function RoomBoardPage() {
  let rooms: Awaited<ReturnType<typeof getRoomBoard>> = [];
  let error: string | null = null;

  try {
    rooms = await getRoomBoard();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load room board";
  }

  return <RoomBoardClient rooms={rooms} error={error} />;
}
