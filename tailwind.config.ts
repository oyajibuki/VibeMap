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
        "vm-bg": "#0a0f1e",
        "vm-surface": "#0f172a",
        "vm-card": "#1e293b",
        "vm-border": "#1e3a5f",
        "vm-blue": "#3b82f6",
        "vm-cyan": "#06b6d4",
        "vm-purple": "#8b5cf6",
        "vm-green": "#10b981",
        "vm-yellow": "#f59e0b",
        "vm-red": "#ef4444",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59,130,246,0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(59,130,246,0.7), 0 0 40px rgba(59,130,246,0.3)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
