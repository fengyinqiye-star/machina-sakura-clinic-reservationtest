"use client";

import { useState } from "react";

interface AccordionItemProps {
  question: string;
  answer: string;
}

export default function AccordionItem({ question, answer }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-2 flex items-center justify-between text-left min-h-[44px]"
      >
        <span className="flex items-start gap-2 text-gray-800 font-medium pr-4">
          <span className="text-sakura-400 font-bold shrink-0">Q.</span>
          {question}
        </span>
        <span
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          &#9660;
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 px-2 pl-8">
          <p className="text-gray-600 leading-relaxed text-sm">
            <span className="text-wgreen-400 font-bold mr-1">A.</span>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
