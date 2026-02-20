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
        "primary-dark": "#0A1628",
        "primary-navy": "#132038",
        "accent-gold": "#D4A843",
        "accent-gold-hover": "#C49A3A",
        "text-secondary": "#9CA3AF",
        success: "#22C55E",
        "surface-card": "#1A2A44",
        "border-card": "#2A3A54",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
