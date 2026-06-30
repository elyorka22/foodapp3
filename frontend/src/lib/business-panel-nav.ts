import { businessPanelI18n } from '@/lib/business-panel-i18n';

export function businessPanelNav(base: '/restaurant' | '/business') {
  const t = businessPanelI18n.nav;
  return [
    { href: `${base}/dashboard`, label: t.dashboard },
    { href: base, label: t.orders },
    { href: `${base}/schedule`, label: t.schedule },
    { href: `${base}/telegram`, label: t.telegram },
  ];
}
