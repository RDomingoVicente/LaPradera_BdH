/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tu paleta personalizada
        background: "#F3F2ED", // Color Piedra/Crema
        primary: "#2F4228",    // Verde Logo
        secondary: "#D9A038",  // Mostaza Sillas
        surface: "#FFFFFF",    // Blanco puro para tarjetas
        text: "#1A1A1A",       // Gris oscuro lectura
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}