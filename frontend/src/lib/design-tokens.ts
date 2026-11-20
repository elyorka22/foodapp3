/** FoodApp mono foundation — white / gray / black (HEX only). */
export const colors = {
  primary: '#18181B',
  primaryHover: '#27272A',
  primaryDark: '#09090B',
  primarySoft: '#F4F4F5',
  surface: '#FFFFFF',
  background: '#F5F5F7',
  border: '#E8E8EC',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  overlay: 'rgba(24, 24, 27, 0.5)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha75: 'rgba(255, 255, 255, 0.75)',
} as const;

export const shadows = {
  card: '0 2px 16px rgba(0, 0, 0, 0.06)',
  cardElevated: '0 4px 24px rgba(0, 0, 0, 0.1)',
  sheet: '0 -12px 48px rgba(0, 0, 0, 0.15)',
  sheetSoft: '0 -8px 40px rgba(0, 0, 0, 0.12)',
  button: '0 4px 12px rgba(0, 0, 0, 0.18)',
  nav: '0 -1px 0 rgba(0, 0, 0, 0.06)',
} as const;
