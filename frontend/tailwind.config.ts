import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#8B9130",
          light: "#A4AC3A",
          dark: "#6E7227",
          muted: "rgba(139, 145, 48, 0.12)",
          border: "rgba(139, 145, 48, 0.28)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      spacing: {
        "88": "22rem",
        "104": "26rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
