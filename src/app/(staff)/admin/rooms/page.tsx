import { getRoomAvailabilitySummary } from "@/lib/data/admin";
import { getRoomBoard } from "@/lib/data/reception";
import RoomsClient from "./rooms-client";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  let rooms: Awaited<ReturnType<typeof getRoomBoard>> = [];
  let summary: Awaited<ReturnType<typeof getRoomAvailabilitySummary>> = [];
  let error: string | null = null;

  try {
    [rooms, summary] = await Promise.all([
      getRoomBoard(),
      getRoomAvailabilitySummary(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load room data";
  }

  return <RoomsClient rooms={rooms} summary={summary} error={error} />;
}
