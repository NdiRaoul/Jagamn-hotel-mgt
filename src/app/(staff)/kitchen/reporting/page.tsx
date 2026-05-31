import { getDiningReporting } from "@/lib/data/kitchen";
import ReportingClient from "./reporting-client";

export const dynamic = "force-dynamic";

export default async function ReportingPage() {
  const reporting = await getDiningReporting();

  return <ReportingClient reporting={reporting} />;
}
