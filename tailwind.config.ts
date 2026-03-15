// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // CRÍTICO: "class" hace que dark: variantes se activen con la clase .dark en <html>
  // next-themes inyecta esta clase automáticamente al cambiar el tema
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "sans-serif"],
      },
    },
  },

  plugins: [],
};

export default config;