import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        sidebar: "#0f0f1a",
        card: "#141420",
        "card-border": "#1e1e3a",
        purple: {
          DEFAULT: "#6C5CE7",
          hover: "#7c6ef7",
          muted: "rgba(108,92,231,0.15)",
        },
        muted: "#888",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
