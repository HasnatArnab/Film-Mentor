const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: {
          DEFAULT: "#f0ede6",
          secondary: "#9a9287",
          muted: "#605a50",
        },
        gold: {
          DEFAULT: "#c4a44a",
          dim: "rgba(196,164,74,0.08)",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          accent: "rgba(196,164,74,0.08)",
        },
        bg: {
          DEFAULT: "#0a0a0a",
          card: "rgba(255,255,255,0.03)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        reveal: "reveal 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
