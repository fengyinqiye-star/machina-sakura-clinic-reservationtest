"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border
            bg-white text-gray-800
            focus:outline-none focus:ring-2 focus:ring-sakura-300 focus:border-sakura-400
            transition-colors duration-200
            min-h-[44px]
            ${error ? "border-red-400" : "border-gray-300"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
