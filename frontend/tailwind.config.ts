import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          hover: '#EA580C',
          dark: '#C2410C',
          soft: '#FFF4EB',
        },
        surface: '#FFFFFF',
        background: '#F8F8F8',
        border: '#EAEAEA',
        foreground: {
          DEFAULT: '#1A1A1A',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
        brand: {
          50: '#FFF4EB',
          100: '#FFE8D6',
          200: '#FFD0AD',
          500: '#FF6B00',
          600: '#EA580C',
          700: '#C2410C',
          950: '#431407',
        },
      },
      boxShadow: {
        card: '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-brand': '0 4px 24px rgba(234, 88, 12, 0.12)',
        sheet: '0 -12px 48px rgba(0, 0, 0, 0.15)',
        'sheet-soft': '0 -8px 40px rgba(0, 0, 0, 0.12)',
        'button-primary': '0 4px 12px rgba(234, 88, 12, 0.25)',
      },
      backgroundImage: {
        'hero-primary': 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
        'hero-staff': 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
