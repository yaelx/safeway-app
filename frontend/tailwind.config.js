/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#080808", // Deepest background
          dark: "#101010", // Card background
          slate: "#1a1a1a", // Input background
          border: "#333333", // Borders
          blue: "#4dabf5", // Primary blue
          hover: "#2563eb", // Button hover
        },
      },
    },
  },
  plugins: [],
};
