'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingCart,
  CreditCard,
  Tag,
  AlertCircle,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/inventory', label: 'Inventory', icon: AlertCircle },
  { href: '/dashboard/offers', label: 'Special Offers', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-green-900 text-white border-r border-green-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Farm Admin</h1>
        <p className="text-green-200 text-sm mt-1">Dashboard</p>
      </div>

      <nav className="px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
