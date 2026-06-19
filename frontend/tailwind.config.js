/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ochre: {
          50: '#FDF5F0',
          100: '#F9E8DC',
          200: '#F2D0B5',
          300: '#E8B088',
          400: '#D4A373',
          500: '#C8553D',
          600: '#A8432F',
          700: '#873424',
          800: '#6B281C',
          900: '#4A1C13',
        },
        sage: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#2D6A4F',
          600: '#245840',
          700: '#1B4332',
          800: '#143326',
          900: '#0D2419',
        },
        cream: {
          50: '#FDFCF8',
          100: '#F9F5EB',
          200: '#F2E8CF',
          300: '#E8D9AD',
          400: '#D4A373',
          500: '#BC8A5F',
        },
        ink: {
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#3D3D3D',
        },
      },
      fontFamily: {
        display: ['"ZCOOL XiaoWei"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
