import { getHelpArticles } from "@/lib/data/help";
import { HelpCenter } from "@/components/staff/help-center";

export const dynamic = "force-dynamic";

export default async function KitchenHelpPage() {
  const articles = await getHelpArticles("kitchen");

  return (
    <HelpCenter
      heading="Kitchen Help & Support"
      subheading="Quick reference guide for kitchen operations"
      articles={articles}
    />
  );
}
