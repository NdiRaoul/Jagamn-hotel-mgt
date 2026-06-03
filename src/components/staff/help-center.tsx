import React from "react";
import { HelpCircle, BookOpen, Phone, Mail, ChevronRight } from "lucide-react";
import type { HelpArticle } from "@/lib/data/help";

interface HelpCenterProps {
  heading: string;
  subheading: string;
  articles: HelpArticle[];
}

/**
 * Presentational help center used by every staff portal. Content is fully
 * data-driven from `help_articles` — articles are grouped by category and
 * rendered as expandable cards, so help text can change without a deploy.
 */
export function HelpCenter({ heading, subheading, articles }: HelpCenterProps) {
  const groups: { category: string; items: HelpArticle[] }[] = [];
  for (const article of articles) {
    const category = article.category || "General";
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, items: [] };
      groups.push(group);
    }
    group.items.push(article);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="manrope-bold text-4xl text-[#00152A]">{heading}</h1>
        <p className="text-gray-500 text-sm mt-1">{subheading}</p>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
          No help articles are available yet. Reach out to support below.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.category}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#BA722E]" />
                </div>
                <h3 className="manrope-bold text-lg text-[#00152A]">
                  {group.category}
                </h3>
              </div>
              <div className="space-y-1">
                {group.items.map((article) => (
                  <details
                    key={article.id}
                    className="group border-b border-gray-50 last:border-0 py-2"
                  >
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="font-bold text-sm text-[#00152A]">
                        {article.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-open:rotate-90 transition-transform shrink-0" />
                    </summary>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line border-l-2 border-[#BA722E]/30 pl-4 mt-3">
                      {article.body}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-[#00152A] rounded-xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="manrope-bold text-xl mb-2">Need Additional Help?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Contact the IT support team or your manager for technical
              assistance.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#BA722E]" />
                <span>Ext. 2100</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#BA722E]" />
                <span>support@jagamnpalace.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
