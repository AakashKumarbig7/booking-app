import type { Config } from "tailwindcss"
const config: Config = {
  darkMode: ["class", "html"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
      
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border_color: "rgba(0, 0, 0, 0.1)",
        button_orange: "rgba(255, 165, 0, 0.1)",
        bgborder_color: '#CBCBCB'
       
        // primary: {
        //   50: "#f0f9ff",
        //   100: "#e0f2fe",
        //   200: "#bae6fd",
        //   300: "#7dd3fc",
        //   400: "#38bdf8",
        //   500: "#0ea5e9",
        //   600: "#0284c7",
        //   700: "#0369a1",
        //   800: "#075985",
        //   900: "#0c4a6e",
        // },
        // secondary: {
        //   50: "#f8fafc",
        //   100: "#f1f5f9",
        //   200: "#e2e8f0",
        //   300: "#cbd5e1",
        //   400: "#94a3b8",
        //   500: "#64748b",
        //   600: "#475569",
        //   700: "#334155",
        //   800: "#1e293b",
        //   900: "#0f172a",
        // },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
    
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
