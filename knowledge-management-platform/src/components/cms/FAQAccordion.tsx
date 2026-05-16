"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Props {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="bg-white dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {faq.question}
              </span>
              <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
