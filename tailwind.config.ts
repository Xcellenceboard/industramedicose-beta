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
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#0B2545",
          50: "#F0F5FA",
          100: "#DCE8F4",
          200: "#BAD3EA",
          300: "#8DB6DC",
          400: "#5491C7",
          500: "#3172B0",
          600: "#215891",
          700: "#174372",
          800: "#0B2545",
          900: "#071930",
          950: "#040F1E",
        },
        teal: {
          DEFAULT: "#13A89E",
          50: "#E6F7F5",
          100: "#CEF2EE",
          200: "#A3E6DF",
          300: "#6FD3C9",
          400: "#3BBEB2",
          500: "#13A89E",
          600: "#0E8880",
          700: "#0C6C66",
          800: "#0A5551",
          900: "#084643",
        },
        mint: {
          DEFAULT: "#E6F7F5",
          50: "#F5FCFB",
          100: "#E6F7F5",
          200: "#C7F0EA",
          300: "#A1E4DA",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          50: "#FFF1F1",
          100: "#FFE2E2",
          200: "#FFC5C5",
          500: "#FF6B6B",
          600: "#EB4E4E",
          700: "#C93232",
        },
        amber: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        green: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
        },
        ai: {
          DEFAULT: "#8B5CF6",
          50: "#F5F3FF",
          100: "#EDE9FE",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        border: "var(--border)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hindi: ["var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(11, 37, 69, 0.06), 0 2px 6px -1px rgba(11, 37, 69, 0.04)",
        "soft-lg": "0 10px 30px -4px rgba(11, 37, 69, 0.08), 0 4px 10px -2px rgba(11, 37, 69, 0.05)",
        "teal-glow": "0 0 25px -4px rgba(19, 168, 158, 0.35)",
        "coral-glow": "0 0 25px -4px rgba(255, 107, 107, 0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
