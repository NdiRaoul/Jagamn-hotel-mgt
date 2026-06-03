import { getHelpArticles } from "@/lib/data/help";
import { HelpCenter } from "@/components/staff/help-center";

export const dynamic = "force-dynamic";

export default async function ReceptionHelpPage() {
  const articles = await getHelpArticles("reception");

  return (
    <HelpCenter
      heading="Help & Support"
      subheading="Guides and answers for the reception portal."
      articles={articles}
    />
  );
}
