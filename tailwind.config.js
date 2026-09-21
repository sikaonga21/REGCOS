/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary blue (replaces navy)
        primary: {
          DEFAULT: '#063B82',
          light: '#0d4fa8',
          dark: '#022B61',
        },
        // Secondary yellow (replaces gold)
        secondary: {
          DEFAULT: '#FFD400',
          hover: '#e6bf00',
        },
        // Accent red
        accent: {
          DEFAULT: '#D71920',
          hover: '#b81118',
        },
        // Backgrounds
        bg: {
          DEFAULT: '#FFFFFF',
          light: '#F3F5F8',
        },
        // Body text
        body: '#374151',

        // Legacy aliases so older Tailwind classes still resolve
        navy: {
          DEFAULT: '#063B82',
          light: '#0d4fa8',
          lighter: '#3a6abf',
        },
        gold: {
          DEFAULT: '#FFD400',
          hover: '#e6bf00',
        },
        cream: {
          DEFAULT: '#F3F5F8',
          dark: '#e4e8ef',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
