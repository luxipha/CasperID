import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      inset: {
        "-0.2": "-0.12rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      colors: {
        "light-blue": colors.lightBlue,
        cyan: colors.cyan,
        // Brand Colors
        brand: {
          primary: "#8652E2", // Amethyst Purple
          secondary: "#6DE8EC", // Electric Cyan
          "primary-hover": "#6F3DD1",
          "primary-active": "#5A2BB1",
        },
        // Light Mode Colors
        light: {
          surface: "#F8F9FF", // Ghost White
          "surface-elevated": "#FFFFFF", // Pure White
          "text-primary": "#1A1A2E", // Deep Midnight Blue
          "text-secondary": "#626D85", // Slate Blue-Gray
          "accent": "#00B5BD", // Deepened Cyan
          "alert": "#E63946", // Crisp Red
          disabled: "#E0E0E0",
        },
        // Dark Mode Colors
        dark: {
          surface: "#1A1A2E", // Deep Midnight Blue
          "surface-elevated": "#252545", // Elevated Surface
          "text-primary": "#FFFFFF", // Pure White
          "text-secondary": "#A9ADC1", // Muted Lavender-Gray
          "accent-glow": "#6DE8EC", // Electric Cyan with low opacity for glow
          "alert": "#FF4D4D", // Coral Red
          disabled: "#33334D",
        },
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(6%, -4%, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)",
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(180deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
          "100%": {
            transform: "translateY(-50%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
        drift: "drift 22s linear infinite",
        "drift-slow": "drift 28s linear infinite reverse",
        "pulse-soft": "pulseSoft 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
