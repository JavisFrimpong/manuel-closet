/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          50:  '#fdf4ef',
          100: '#fae5d4',
          200: '#f5c9a5',
          300: '#efa46d',
          400: '#e87d3c',
          500: '#e25d1b',
          600: '#d44712',
          700: '#af3312',
          800: '#8c2a16',
          900: '#722614',
          950: '#3e1007',
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#252525',
          600: '#303030',
          500: '#3d3d3d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
