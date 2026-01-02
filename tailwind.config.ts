import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f6f3",
        taupe: "#c7b7a3",
        forest: "#0f2f23",
        gold: "#d4b26f",
        ink: "#0d0d0d"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 25px 60px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
