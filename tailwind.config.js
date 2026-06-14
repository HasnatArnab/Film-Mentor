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
        zodiac: {
          bg: "#0f0d0a",
          fg: "#d4c9b8",
          muted: "#8a7f72",
          accent: "#b8a88a",
          gold: "#d4a853",
          shadow: "#1a1713",
          card: "#1a1713",
          border: "#2a251f",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
