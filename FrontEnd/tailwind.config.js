/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        beige: "#FFF5E0",
        "beige-opacity": "rgba(255, 245, 224, 0.27)",
        mint: "#8DECB4",
        "cold-blue": "#263238",
        "greeny":"#92e3a9",
        "greeny-green":"#def6e5"
      },
      screens: {
        xs: "480px",
        "3xl": "1650px",
        "4xl": "2200px",
      },
    },
  },
  plugins: [],
};
