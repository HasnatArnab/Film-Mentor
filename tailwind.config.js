/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0a",
          secondary: "#111111",
          card: "rgba(17, 17, 17, 0.7)",
        },
        text: {
          primary: "#f0ede6",
          secondary: "#a09888",
          muted: "#6b6558",
        },
        gold: {
          DEFAULT: "#c4a44a",
          dim: "rgba(196, 164, 74, 0.15)",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          accent: "rgba(196, 164, 74, 0.2)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-delayed": "fadeIn 0.5s ease-out 0.3s forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
