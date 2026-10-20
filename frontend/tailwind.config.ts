import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#E11D48',
          hover: '#BE123C',
          dark: '#9F1239',
          soft: '#FFF1F2',
        },
        surface: '#FFFFFF',
        background: '#FFF8F7',
        border: '#F1E7E6',
        foreground: {
          DEFAULT: '#1C1917',
          muted: '#78716C',
          subtle: '#A8A29E',
        },
        brand: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          400: '#FB7185',
          500: '#E11D48',
          600: '#BE123C',
          700: '#9F1239',
          950: '#4C0519',
        },
      },
      boxShadow: {
        card: '0 2px 16px rgba(28, 25, 23, 0.06)',
        'card-brand': '0 4px 24px rgba(225, 29, 72, 0.12)',
        sheet: '0 -12px 48px rgba(28, 25, 23, 0.15)',
        'sheet-soft': '0 -8px 40px rgba(28, 25, 23, 0.12)',
        'button-primary': '0 4px 14px rgba(225, 29, 72, 0.28)',
      },
      backgroundImage: {
        'hero-primary': 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
        'hero-staff': 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
