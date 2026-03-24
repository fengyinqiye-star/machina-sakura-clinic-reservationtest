"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, maxLength, currentLength, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border
            bg-white text-gray-800
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-sakura-300 focus:border-sakura-400
            transition-colors duration-200
            resize-y min-h-[100px]
            ${error ? "border-red-400" : "border-gray-300"}
            ${className}
          `}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {maxLength && (
            <p className="text-sm text-gray-400 ml-auto">
              {currentLength || 0}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
export default Textarea;
