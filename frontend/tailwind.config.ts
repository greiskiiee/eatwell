import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        chimge: {
          bg: "#FAF6EE",
          paper: "#FFFFFF",
          ink: "#221C16",
          "ink-2": "#5A4A3D",
          "ink-3": "#8E7C6A",
          line: "#E8DFCE",
          "line-2": "#F1E9D7",
          primary: "#C5532A",
          "primary-dk": "#A8401C",
          "primary-soft": "#FBE6D9",
          sage: "#5C7A52",
          "sage-soft": "#E4ECDD",
          warn: "#B23A2A",
          "warn-soft": "#FBE0DB",
          gold: "#C58A2A",
          "gold-soft": "#F8E8C8",
        },
      },
      screens: { tablet: "600px" },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        sheetUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 180ms ease-out",
        "sheet-up": "sheetUp 280ms cubic-bezier(0.2,0.9,0.3,1)",
        "modal-in": "fadeIn 220ms ease-out",
      },
      boxShadow: {
        modal:
          "0 40px 80px -20px rgba(50,30,15,0.45), 0 0 0 1px rgba(0,0,0,0.06)",
        sheet: "0 -20px 40px -10px rgba(50,30,15,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
