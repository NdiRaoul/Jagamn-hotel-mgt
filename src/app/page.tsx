import { redirect } from "next/navigation";

// The guest-facing landing/booking experience has been removed from this
// (staff) build. The application entry point is the staff login.
export default function RootPage() {
  redirect("/staff-login");
}
