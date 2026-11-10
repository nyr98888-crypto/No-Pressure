import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#ef4444",
          yellow: "#eab308",
          ink: "#0a0a0a",
        },
      },
      boxShadow: {
        brutal: "8px 8px 0px 0px rgba(239,68,68,1)",
      },
    },
  },
  plugins: [],
};

export default config;
