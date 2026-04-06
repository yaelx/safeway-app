/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "var(--brand-black)",
          dark: "var(--brand-dark)",
          slate: "var(--brand-slate)",
          border: "var(--brand-border)",
          blue: "var(--brand-blue)",
          hover: "var(--brand-hover)",
          textMain: "var(--text-main)",
          textMuted: "var(--text-muted)",
        },
      },
      // Adding a custom blur for the "Cool UI" glassmorphism
      backdropBlur: {
        xs: "2px",
      },
      // Standardizing your z-index so the Burger Menu stays on top
      zIndex: {
        map: "0",
        overlay: "1000",
        menu: "2000",
      },
    },
  },
  plugins: [],
};
