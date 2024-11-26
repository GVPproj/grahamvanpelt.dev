import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Sfizia", ...defaultTheme.fontFamily.sans],
        sans: ["Wotfard", ...defaultTheme.fontFamily.sans],
      },
      textColor: {
        skin: {
          base: "var(--colour-text-base)",
          muted: "var(--colour-text-muted)",
          accent: "var(--colour-accent)",
          highlight: "var(--colour-highlight)",
        },
      },
      backgroundColor: {
        skin: {
          fill: "var(--colour-fill)",
          "fill-muted": "var(--colour-fill-muted)",
          accent: "var(--colour-accent)",
          highlight: "var(--colour-highlight)",
        },
      },
      stroke: {
        skin: {
          base: "var(--colour-text-base)",
          accent: "var(--colour-accent)",
          highlight: "var(--colour-highlight)",
        },
      },
      borderColor: {
        skin: {
          base: "var(--colour-text-base)",
          accent: "var(--colour-accent)",
          highlight: "var(--colour-highlight)",
          muted: "var(--colour-text-muted)",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
