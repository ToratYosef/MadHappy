import {
  Ban,
  Gauge,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  Image as ImageIcon,
  Star,
  Users
} from 'lucide-react';

export const adminNavIconMap = {
  cancelOrders: Ban,
  gauge: Gauge,
  orders: ShoppingCart,
  products: Package,
  banners: ImageIcon,
  featured: Star,
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
  { href: '/admin/cancel-orders', label: 'Cancel Orders', icon: 'cancelOrders' },
  { href: '/admin/products', label: 'Products', icon: 'products' },
  { href: '/admin/banners', label: 'Banners', icon: 'banners' },
  { href: '/admin/featured', label: 'Featured', icon: 'featured' },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: 'promoCodes' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' }
];
