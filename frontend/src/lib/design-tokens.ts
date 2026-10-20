/** FoodApp Tomato Fresh palette — HEX/rgba only (no OKLCH, color-mix, or opacity modifiers). */
export const colors = {
  primary: '#E11D48',
  primaryHover: '#BE123C',
  primaryDark: '#9F1239',
  primarySoft: '#FFF1F2',
  surface: '#FFFFFF',
  background: '#FFF8F7',
  border: '#F1E7E6',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  overlay: 'rgba(28, 25, 23, 0.5)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha75: 'rgba(255, 255, 255, 0.75)',
} as const;

export const shadows = {
  card: '0 2px 16px rgba(28, 25, 23, 0.06)',
  cardElevated: '0 4px 24px rgba(28, 25, 23, 0.1)',
  sheet: '0 -12px 48px rgba(28, 25, 23, 0.15)',
  sheetSoft: '0 -8px 40px rgba(28, 25, 23, 0.12)',
  button: '0 4px 14px rgba(225, 29, 72, 0.28)',
  nav: '0 -1px 0 rgba(28, 25, 23, 0.06)',
} as const;
