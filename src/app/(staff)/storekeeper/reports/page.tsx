import { getStoreReports } from "@/lib/data/storekeeper";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getStoreReports();
  return <ReportsClient reports={reports} />;
}
