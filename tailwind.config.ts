import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        qg: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          surface2: "var(--surface2)",
          field: "var(--field)",
          line: "var(--line)",
          line2: "var(--line2)",
          ink: "var(--ink)",
          body: "var(--body)",
          muted: "var(--muted)",
          faint: "var(--faint)",
          amber: "var(--amber)",
          up: "var(--up)",
          down: "var(--down)",
        },
      },
      fontFamily: {
        sans: ["var(--sans)"],
        cond: ["var(--cond)"],
        mono: ["var(--mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
