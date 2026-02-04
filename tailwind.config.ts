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
        // Apple-inspired color palette
        primary: {
          DEFAULT: "#007AFF",
          50: "#E5F2FF",
          100: "#CCE5FF",
          200: "#99CCFF",
          300: "#66B2FF",
          400: "#3399FF",
          500: "#007AFF",
          600: "#0066CC",
          700: "#004D99",
          800: "#003366",
          900: "#001A33",
        },
        success: {
          DEFAULT: "#34C759",
          light: "#E8F9ED",
        },
        warning: {
          DEFAULT: "#FF9500",
          light: "#FFF4E5",
        },
        danger: {
          DEFAULT: "#FF3B30",
          light: "#FFEBE9",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          150: "#EBEDF0",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0, 0, 0, 0.08)",
        "apple": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "apple-md": "0 4px 12px rgba(0, 0, 0, 0.1)",
        "apple-lg": "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        "apple": "12px",
        "apple-lg": "16px",
        "apple-xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
