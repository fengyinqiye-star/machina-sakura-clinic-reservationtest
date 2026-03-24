import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: "#FDF8F5",
          100: "#FEF0ED",
          200: "#FDDDD6",
          300: "#F8BBD0",
          400: "#F4A7B9",
          500: "#D4879A",
          600: "#B5687C",
          700: "#964A5E",
          800: "#773340",
          900: "#5A1E2B",
        },
        wgreen: {
          50: "#F4F8EC",
          100: "#E8F0D8",
          200: "#D1E1B1",
          300: "#A8C86E",
          400: "#7BA23F",
          500: "#628232",
          600: "#4A6126",
          700: "#314119",
          800: "#19200D",
        },
        warm: {
          white: "#FDF8F5",
          cream: "#FAF3EE",
        },
        accent: {
          gold: "#C8A96E",
        },
      },
      fontFamily: {
        serif: ["var(--font-noto-serif-jp)", "serif"],
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
