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
        background: "#0f0f0f",
        sidebar: "#141414",
        card: "#1a1a1a",
        "card-hover": "#222222",
        "card-border": "#2a2a2a",
        purple: {
          DEFAULT: "#6C5CE7",
          hover: "#7c6ef7",
          muted: "rgba(108,92,231,0.15)",
        },
        muted: "#888",
        "muted-dark": "#555",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
