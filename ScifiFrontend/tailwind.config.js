/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(230 25% 8%)",
        foreground: "hsl(210 40% 98%)",
        card: { DEFAULT: "hsl(230 28% 12%)", foreground: "hsl(210 40% 98%)" },
        primary: { DEFAULT: "hsl(187 85% 48%)", foreground: "hsl(230 25% 8%)" },
        secondary: { DEFAULT: "hsl(280 60% 45%)", foreground: "hsl(210 40% 98%)" },
        accent: { DEFAULT: "hsl(45 95% 55%)", foreground: "hsl(230 25% 8%)" },
        muted: { DEFAULT: "hsl(230 20% 18%)", foreground: "hsl(215 20% 65%)" },
        destructive: { DEFAULT: "hsl(0 75% 55%)", foreground: "hsl(210 40% 98%)" },
        border: "hsl(230 25% 22%)",
        ring: "hsl(187 85% 48%)",
        cyan: "hsl(187 85% 48%)",
        magenta: "hsl(280 60% 55%)",
        amber: "hsl(45 95% 55%)",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Orbitron", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px hsl(187 85% 48% / 0.3)",
        "glow-magenta": "0 0 20px hsl(280 60% 55% / 0.3)",
        "glow-amber": "0 0 20px hsl(45 95% 55% / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
