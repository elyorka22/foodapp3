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
          DEFAULT: '#18181B',
          hover: '#27272A',
          dark: '#09090B',
          soft: '#F4F4F5',
        },
        surface: '#FFFFFF',
        background: '#F7F8FA',
        border: '#EAEAEA',
        foreground: {
          DEFAULT: '#1A1A1A',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
        brand: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          400: '#A1A1AA',
          500: '#18181B',
          600: '#27272A',
          700: '#3F3F46',
          950: '#09090B',
        },
      },
      boxShadow: {
        card: '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-brand': '0 4px 24px rgba(0, 0, 0, 0.1)',
        sheet: '0 -12px 48px rgba(0, 0, 0, 0.15)',
        'sheet-soft': '0 -8px 40px rgba(0, 0, 0, 0.12)',
        'button-primary': '0 4px 12px rgba(0, 0, 0, 0.18)',
      },
      backgroundImage: {
        'hero-primary': 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
        'hero-staff': 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
