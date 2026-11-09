import type { LucideIcon } from 'lucide-react';
import {
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

export type AdminNavBusinessType = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  menuMode?: string | null;
};

function storeTypeGroup(bt: AdminNavBusinessType): AdminNavGroup {
  const base = `/admin/stores/type/${encodeURIComponent(bt.slug)}`;
  return {
    id: `store-type-${bt.slug}`,
    title: bt.name,
    items: [
      { href: base, label: t.nav.restaurantList, icon: Store, permission: 'stores' },
      {
        href: `${base}/categories`,
        label: t.nav.storeCategories,
        icon: Tags,
        permission: 'store.categories',
      },
      {
        href: `${base}/products`,
        label: t.nav.storeProducts,
        icon: Package,
        permission: 'store.products',
      },
      {
        href: `${base}/banners`,
        label: t.nav.storeBanners,
        icon: ImageIcon,
        permission: 'stores',
      },
      {
        href: `${base}/orders`,
        label: t.nav.storeOrders,
        icon: ShoppingBag,
        permission: 'orders',
      },
    ],
  };
}

function isMarketplaceType(bt: AdminNavBusinessType): boolean {
  if (bt.isActive === false) return false;
  if (bt.slug === 'restaurant') return false;
  if (bt.menuMode === 'GLOBAL_DISH') return false;
  return true;
}

/** Static groups (store types injected between restaurants and orders). */
function staticGroups(): AdminNavGroup[] {
  return [
    {
      id: 'management',
      title: t.nav.management,
      items: [
        { href: '/admin', label: t.nav.dashboard, icon: LayoutDashboard, permission: 'dashboard' },
      ],
    },
    {
      id: 'restaurants',
      title: t.nav.restaurants,
      items: [
        {
          href: '/admin/restaurants',
          label: t.nav.restaurantList,
          icon: Building2,
          permission: 'restaurants',
        },
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
        {
          href: '/admin/orders/restaurant',
          label: t.nav.restaurantOrders,
          icon: ShoppingBag,
          permission: 'orders',
        },
      ],
    },
    {
      id: 'orders',
      title: t.nav.opsOrders,
      items: [
        { href: '/admin/orders/all', label: t.nav.allOrders, icon: ShoppingBag, permission: 'orders' },
        {
          href: '/admin/orders/active',
          label: t.nav.activeOrders,
          icon: ShoppingBag,
          permission: 'orders',
        },
        {
          href: '/admin/orders/cancelled',
          label: t.nav.cancelledOrders,
          icon: ShoppingBag,
          permission: 'orders',
        },
      ],
    },
    {
      id: 'couriers',
      title: t.nav.couriers,
      items: [{ href: '/admin/couriers', label: t.nav.courierList, icon: Truck, permission: 'couriers' }],
    },
    {
      id: 'marketing',
      title: t.nav.marketing,
      items: [
        {
          href: '/admin/banners/home',
          label: t.banners.homeGridTitle,
          icon: ImageIcon,
          permission: 'banners',
        },
        {
          href: '/admin/promo-codes',
          label: t.nav.promoCodes,
          icon: TicketPercent,
          permission: 'promotions',
        },
        {
          href: '/admin/notifications/push',
          label: t.nav.pushNotifications,
          icon: Bell,
          permission: 'notifications',
        },
        {
          href: '/admin/booking-venues',
          label: t.nav.bookingVenues,
          icon: CalendarHeart,
          permission: 'booking',
        },
      ],
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
      id: 'settings',
      title: t.nav.settings,
      items: [
        {
          href: '/admin/settings',
          label: t.nav.siteSettings,
          icon: Settings,
          permission: 'settings',
        },
        {
          href: '/admin/stores/types',
          label: t.nav.storeTypes,
          icon: Tags,
          permission: 'stores',
        },
        { href: '/admin/cities', label: t.nav.cities, icon: MapPin, permission: 'settings' },
        {
          href: '/admin/delivery-zones',
          label: t.nav.deliveryZones,
          icon: MapPin,
          permission: 'settings',
        },
        {
          href: '/admin/analytics',
          label: t.nav.orderStats,
          icon: LineChart,
          permission: 'reports',
        },
        { href: '/admin/audit', label: t.nav.audit, icon: ScrollText, permission: 'audit' },
        {
          href: '/admin/system',
          label: t.nav.systemHealth,
          icon: Server,
          permission: 'system',
        },
      ],
    },
  ];
}

/** Build full nav: Dashboard → Restoranlar → each store type → ops… */
export function buildAdminNavGroups(
  businessTypes: AdminNavBusinessType[] = [],
): AdminNavGroup[] {
  const groups = staticGroups();
  const restaurantIdx = groups.findIndex((g) => g.id === 'restaurants');
  const typeGroups = [...businessTypes]
    .filter(isMarketplaceType)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
    .map(storeTypeGroup);

  const insertAt = restaurantIdx >= 0 ? restaurantIdx + 1 : 1;
  return [...groups.slice(0, insertAt), ...typeGroups, ...groups.slice(insertAt)];
}

/** @deprecated Prefer buildAdminNavGroups(types) */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = buildAdminNavGroups();

const MANAGER_STATIC_HREFS: { groupId: string; hrefs: string[] }[] = [
  { groupId: 'management', hrefs: ['/admin'] },
  {
    groupId: 'restaurants',
    hrefs: [
      '/admin/restaurants',
      '/admin/dish-categories',
      '/admin/products/restaurant',
      '/admin/orders/restaurant',
    ],
  },
  { groupId: 'orders', hrefs: ['/admin/orders/all', '/admin/orders/active'] },
  { groupId: 'couriers', hrefs: ['/admin/couriers'] },
  {
    groupId: 'marketing',
    hrefs: ['/admin/banners/home', '/admin/promo-codes', '/admin/notifications/push'],
  },
  { groupId: 'users', hrefs: ['/admin/customers', '/admin/users'] },
  { groupId: 'settings', hrefs: ['/admin/analytics'] },
];

export function getAdminNavForRole(
  role: string | undefined | null,
  businessTypes: AdminNavBusinessType[] = [],
): AdminNavGroup[] {
  const allGroups = buildAdminNavGroups(businessTypes);

  if (role === 'SUPER_ADMIN') {
    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasAdminPermission(role, item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }

  if (role !== 'MANAGER') return [];

  const allowed = new Set(
    MANAGER_STATIC_HREFS.flatMap((m) => m.hrefs).concat(
      businessTypes.filter(isMarketplaceType).flatMap((bt) => {
        const base = `/admin/stores/type/${encodeURIComponent(bt.slug)}`;
        return [base, `${base}/categories`, `${base}/products`, `${base}/orders`];
      }),
    ),
  );

  return allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          allowed.has(item.href) && hasAdminPermission(role, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

/** Legacy paths → new paths */
export const ADMIN_LEGACY_REDIRECTS: Record<string, string> = {
  '/admin/businesses': '/admin/stores',
  '/admin/categories': '/admin/restaurants/categories',
  '/admin/business-types': '/admin/stores/types',
  '/admin/products': '/admin/products/restaurant',
  '/admin/products/store': '/admin/stores',
  '/admin/orders': '/admin/orders/all',
  '/admin/orders/store': '/admin/orders/all',
  '/admin/stores/categories': '/admin/stores',
  '/admin/stores/banners': '/admin/stores',
  '/admin/banners': '/admin/banners/home',
  '/manager': '/admin',
};
