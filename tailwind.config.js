/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f6f1e7',
        ink: '#1f2937',
        bronze: '#9a6b31',
        olive: '#50614b',
        roseclay: '#d9b9a0',
        cream: '#fffdf8',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"Noto Naskh Arabic"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px rgba(36, 27, 20, 0.10)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(154,107,49,0.20), transparent 36%), radial-gradient(circle at 20% 20%, rgba(217,185,160,0.34), transparent 26%)',
      },
    },
  },
  plugins: [],
};
