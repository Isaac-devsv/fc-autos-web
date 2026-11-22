/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html', './js/**/*.js', '!./node_modules/**'],
  theme: {
    extend: {
      // Colores de FC Autos
      colors: {
        rojo: '#FF1627',
        hueso: '#EDEBE6',
        plata: '#BFC3C7',
        asfalto: '#16181B',
        negro: '#000000',
        noche: '#050505',
      },
      fontFamily: {
        archivo: ['Archivo', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        sitio: '1440px',
      },
    },
  },
  plugins: [],
};
