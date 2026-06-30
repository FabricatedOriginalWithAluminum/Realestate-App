import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        newgen: {
          green: "#8dcb39",
          blue: "#253550",
          darkblue: "#1a2538",
          grey: "#bdc2ca",
          black: "#282828"
        }
      },
      boxShadow: {
        premium: "0 24px 80px rgba(37, 53, 80, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
