import {
  Gauge,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  Image as ImageIcon,
  Users
} from 'lucide-react';

export const adminNavIconMap = {
  gauge: Gauge,
  orders: ShoppingCart,
  products: Package,
  banners: ImageIcon,
  promoCodes: Ticket,
  users: Users,
  settings: Settings
};

export type AdminNavIconKey = keyof typeof adminNavIconMap;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIconKey;
};

export const adminNavItems: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'gauge' },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
  { href: '/admin/products', label: 'Products', icon: 'products' },
  { href: '/admin/banners', label: 'Banners', icon: 'banners' },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: 'promoCodes' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' }
];
