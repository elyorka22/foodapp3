/** Fixed FoodApp palette — HEX/rgba only (no OKLCH, color-mix, or opacity modifiers). */
export const colors = {
  primary: '#FF6B00',
  primaryHover: '#EA580C',
  primaryDark: '#C2410C',
  primarySoft: '#FFF4EB',
  surface: '#FFFFFF',
  background: '#F8F8F8',
  border: '#EAEAEA',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  overlay: 'rgba(26, 26, 26, 0.5)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',
  whiteAlpha90: 'rgba(255, 255, 255, 0.9)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha75: 'rgba(255, 255, 255, 0.75)',
} as const;

export const shadows = {
  card: '0 2px 16px rgba(0, 0, 0, 0.06)',
  cardElevated: '0 4px 24px rgba(234, 88, 12, 0.12)',
  sheet: '0 -12px 48px rgba(0, 0, 0, 0.15)',
  sheetSoft: '0 -8px 40px rgba(0, 0, 0, 0.12)',
  button: '0 4px 12px rgba(234, 88, 12, 0.25)',
  nav: '0 -1px 0 rgba(0, 0, 0, 0.06)',
} as const;
