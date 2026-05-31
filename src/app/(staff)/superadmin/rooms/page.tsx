import { getRoomBoard } from "@/lib/data/reception";
import { requireOwner } from "@/lib/auth/guard";
import RoomsClient from "./rooms-client";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  await requireOwner();
  const rooms = await getRoomBoard();
  return <RoomsClient rooms={rooms} />;
}
