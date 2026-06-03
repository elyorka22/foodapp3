import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
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
  AlertTriangle,
} from 'lucide-react';
import { adminI18n as t } from '@/lib/admin-i18n';

export type AdminNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
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
    items: [{ href: '/admin', label: t.nav.dashboard, icon: LayoutDashboard }],
  },
  {
    id: 'orders',
    title: t.nav.orders,
    items: [
      { href: '/admin/orders/restaurant', label: t.nav.restaurantOrders, icon: ShoppingBag },
      { href: '/admin/orders/store', label: t.nav.storeOrders, icon: ShoppingBag },
      { href: '/admin/orders/active', label: t.nav.activeOrders, icon: ShoppingBag },
      { href: '/admin/orders/cancelled', label: t.nav.cancelledOrders, icon: ShoppingBag },
    ],
  },
  {
    id: 'restaurants',
    title: t.nav.restaurants,
    items: [
      { href: '/admin/restaurants', label: t.nav.restaurantList, icon: Building2 },
      { href: '/admin/restaurants/categories', label: t.nav.restaurantCategories, icon: Tags },
      { href: '/admin/restaurants/banners', label: t.nav.restaurantBanners, icon: ImageIcon },
    ],
  },
  {
    id: 'stores',
    title: t.nav.stores,
    items: [
      { href: '/admin/stores', label: t.nav.storeList, icon: Store },
      { href: '/admin/stores/categories', label: t.nav.storeCategories, icon: Tags },
      { href: '/admin/stores/types', label: t.nav.storeTypes, icon: Tags },
      { href: '/admin/stores/banners', label: t.nav.storeBanners, icon: ImageIcon },
    ],
  },
  {
    id: 'products',
    title: t.nav.products,
    items: [
      { href: '/admin/products/restaurant', label: 'Restoran mahsulotlari', icon: Package },
      { href: '/admin/products/store', label: "Do'kon mahsulotlari", icon: Package },
    ],
  },
  {
    id: 'couriers',
    title: t.nav.couriers,
    items: [
      { href: '/admin/couriers', label: t.nav.courierList, icon: Truck },
      { href: '/admin/orders/active', label: t.nav.courierOrders, icon: ShoppingBag },
    ],
  },
  {
    id: 'users',
    title: t.nav.users,
    items: [
      { href: '/admin/customers', label: t.nav.customers, icon: Users },
      { href: '/admin/users', label: t.nav.staff, icon: UserCog },
    ],
  },
  {
    id: 'marketing',
    title: t.nav.marketing,
    items: [
      { href: '/admin/banners', label: t.nav.banners, icon: ImageIcon },
      { href: '/admin/promo-codes', label: t.nav.promoCodes, icon: TicketPercent },
    ],
  },
  {
    id: 'reports',
    title: t.nav.reports,
    items: [
      { href: '/admin', label: t.nav.analytics, icon: BarChart3 },
      { href: '/admin/analytics', label: t.nav.orderStats, icon: LineChart },
    ],
  },
  {
    id: 'settings',
    title: t.nav.settings,
    items: [{ href: '/admin/settings', label: t.nav.siteSettings, icon: Settings }],
  },
  {
    id: 'system',
    title: t.nav.system,
    items: [
      { href: '/admin/audit', label: t.nav.audit, icon: ScrollText },
      { href: '/admin/system', label: t.nav.systemHealth, icon: Server },
    ],
  },
];

/** Legacy paths → new paths */
export const ADMIN_LEGACY_REDIRECTS: Record<string, string> = {
  '/admin/businesses': '/admin/stores',
  '/admin/categories': '/admin/restaurants/categories',
  '/admin/business-types': '/admin/stores/types',
  '/admin/products': '/admin/products/restaurant',
  '/admin/orders': '/admin/orders/restaurant',
};
