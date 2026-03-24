"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border
            bg-white text-gray-800
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-sakura-300 focus:border-sakura-400
            transition-colors duration-200
            min-h-[44px]
            ${error ? "border-red-400" : "border-gray-300"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
