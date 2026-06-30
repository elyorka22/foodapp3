import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
  MapPin,
  Package,
  ScrollText,
  Server,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  TicketPercent,
  Truck,
  UserCog,
  Users,
  Bell,
  CalendarHeart,
} from 'lucide-react';
import { adminI18n as t } from '@/lib/admin-i18n';
import { hasAdminPermission, type AdminPermission } from '@/lib/admin-permissions';

export type AdminNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: AdminPermission;
};

export type AdminNavGroup = {
  id: string;
  title: string;
  items: AdminNavLink[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'management',
    title: t.nav.management,
    items: [{ href: '/admin', label: t.nav.dashboard, icon: LayoutDashboard, permission: 'dashboard' }],
  },
  {
    id: 'orders',
    title: t.nav.orders,
    items: [
      { href: '/admin/orders/all', label: t.nav.allOrders, icon: ShoppingBag, permission: 'orders' },
      { href: '/admin/orders/restaurant', label: t.nav.restaurantOrders, icon: ShoppingBag, permission: 'orders' },
      { href: '/admin/orders/store', label: t.nav.storeOrders, icon: ShoppingBag, permission: 'orders' },
      { href: '/admin/orders/active', label: t.nav.activeOrders, icon: ShoppingBag, permission: 'orders' },
      { href: '/admin/orders/cancelled', label: t.nav.cancelledOrders, icon: ShoppingBag, permission: 'orders' },
    ],
  },
  {
    id: 'restaurants',
    title: t.nav.restaurants,
    items: [
      { href: '/admin/restaurants', label: t.nav.restaurantList, icon: Building2, permission: 'restaurants' },
      {
        href: '/admin/dish-categories',
        label: t.nav.dishCategories,
        icon: Tags,
        permission: 'restaurant.categories',
      },
      {
        href: '/admin/products/restaurant',
        label: t.nav.restaurantMenu,
        icon: Package,
        permission: 'restaurant.menu',
      },
      {
        href: '/admin/restaurants/banners',
        label: t.nav.restaurantBanners,
        icon: ImageIcon,
        permission: 'restaurant.banners',
      },
    ],
  },
  {
    id: 'stores',
    title: t.nav.stores,
    items: [
      { href: '/admin/stores', label: t.nav.storeList, icon: Store, permission: 'stores' },
      {
        href: '/admin/products/store',
        label: t.nav.storeProducts,
        icon: Package,
        permission: 'store.products',
      },
      {
        href: '/admin/stores/banners',
        label: t.nav.storeBanners,
        icon: ImageIcon,
        permission: 'stores',
      },
    ],
  },
  {
    id: 'booking',
    title: t.nav.booking,
    items: [
      {
        href: '/admin/booking-venues',
        label: t.nav.bookingVenues,
        icon: CalendarHeart,
        permission: 'booking',
      },
    ],
  },
  {
    id: 'banners',
    title: t.nav.banners,
    items: [
      { href: '/admin/banners/home', label: t.banners.homeGridTitle, icon: ImageIcon, permission: 'banners' },
      { href: '/admin/banners/promo', label: t.banners.promoTitle, icon: ImageIcon, permission: 'banners' },
      { href: '/admin/banners/hero', label: t.banners.heroTitle, icon: ImageIcon, permission: 'banners' },
    ],
  },
  {
    id: 'promotions',
    title: t.nav.promotions,
    items: [
      { href: '/admin/promo-codes', label: t.nav.promoCodes, icon: TicketPercent, permission: 'promotions' },
      { href: '/admin/notifications/push', label: t.nav.pushNotifications, icon: Bell, permission: 'notifications' },
    ],
  },
  {
    id: 'couriers',
    title: t.nav.couriers,
    items: [{ href: '/admin/couriers', label: t.nav.courierList, icon: Truck, permission: 'couriers' }],
  },
  {
    id: 'users',
    title: t.nav.users,
    items: [
      { href: '/admin/customers', label: t.nav.customers, icon: Users, permission: 'customers' },
      { href: '/admin/users', label: t.nav.staff, icon: UserCog, permission: 'staff' },
    ],
  },
  {
    id: 'reports',
    title: t.nav.reports,
    items: [
      { href: '/admin/analytics', label: t.nav.orderStats, icon: LineChart, permission: 'reports' },
      { href: '/admin', label: t.nav.analytics, icon: BarChart3, permission: 'dashboard' },
    ],
  },
  {
    id: 'settings',
    title: t.nav.settings,
    items: [
      { href: '/admin/cities', label: t.nav.cities, icon: MapPin, permission: 'settings' },
      { href: '/admin/settings', label: t.nav.siteSettings, icon: Settings, permission: 'settings' },
      { href: '/admin/settings/telegram', label: t.nav.telegramSettings, icon: Settings, permission: 'settings' },
    ],
  },
  {
    id: 'system',
    title: t.nav.system,
    items: [
      { href: '/admin/audit', label: t.nav.audit, icon: ScrollText, permission: 'audit' },
      { href: '/admin/system', label: t.nav.systemHealth, icon: Server, permission: 'system' },
    ],
  },
];

/** Manager menu: single entry per section where possible */
const MANAGER_NAV_ORDER: { groupId: string; hrefs: string[] }[] = [
  { groupId: 'management', hrefs: ['/admin'] },
  { groupId: 'orders', hrefs: ['/admin/orders/all'] },
  {
    groupId: 'restaurants',
    hrefs: [
      '/admin/restaurants',
      '/admin/restaurants/categories',
      '/admin/products/restaurant',
    ],
  },
  {
    groupId: 'stores',
    hrefs: ['/admin/stores', '/admin/products/store'],
  },
  { groupId: 'banners', hrefs: ['/admin/banners/home', '/admin/banners/promo', '/admin/banners/hero'] },
  { groupId: 'promotions', hrefs: ['/admin/promo-codes', '/admin/notifications/push'] },
  { groupId: 'couriers', hrefs: ['/admin/couriers'] },
  { groupId: 'users', hrefs: ['/admin/customers', '/admin/users'] },
  { groupId: 'reports', hrefs: ['/admin/analytics'] },
];

export function getAdminNavForRole(role: string | undefined | null): AdminNavGroup[] {
  if (role === 'SUPER_ADMIN') {
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAdminPermission(role, item.permission)),
    })).filter((group) => group.items.length > 0);
  }

  if (role !== 'MANAGER') return [];

  const hrefSet = new Map<string, AdminNavLink>();
  for (const { hrefs } of MANAGER_NAV_ORDER) {
    for (const href of hrefs) {
      for (const group of ADMIN_NAV_GROUPS) {
        const item = group.items.find((i) => i.href === href);
        if (item && hasAdminPermission(role, item.permission)) {
          hrefSet.set(href, item);
        }
      }
    }
  }

  return MANAGER_NAV_ORDER.map(({ groupId }) => {
    const template = ADMIN_NAV_GROUPS.find((g) => g.id === groupId);
    if (!template) return null;
    const items = MANAGER_NAV_ORDER.find((m) => m.groupId === groupId)!
      .hrefs.map((href) => hrefSet.get(href))
      .filter((i): i is AdminNavLink => !!i);
    if (!items.length) return null;
    return { ...template, items };
  }).filter((g): g is AdminNavGroup => g !== null);
}

/** Legacy paths → new paths */
export const ADMIN_LEGACY_REDIRECTS: Record<string, string> = {
  '/admin/businesses': '/admin/stores',
  '/admin/categories': '/admin/restaurants/categories',
  '/admin/business-types': '/admin/stores/types',
  '/admin/products': '/admin/products/restaurant',
  '/admin/orders': '/admin/orders/all',
  '/admin/banners': '/admin/banners/home',
  '/manager': '/admin',
};
