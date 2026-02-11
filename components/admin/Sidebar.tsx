'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Lomba',
    href: '/admin/lomba',
    icon: Trophy,
  },
  {
    label: 'Expo',
    href: '/admin/expo',
    icon: Calendar,
  },
  {
    label: 'Expo Settings',
    href: '/admin/expo/settings',
    icon: Settings,
  },
  {
    label: 'Prestasi',
    href: '/admin/prestasi',
    icon: Award,
  },
  {
    label: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    // Direct navigation to logout endpoint - server will clear cookies and redirect
    window.location.href = '/api/admin/logout';
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0B4F94] to-[#083d73] text-white transition-all duration-300 z-40 flex flex-col shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-blue-400/20 px-4">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/logo/logo.png"
                alt="APM Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow-lg"
              />
              <span className="font-bold text-xl">Admin Portal</span>
            </Link>
          ) : (
            <Link href="/admin">
              <Image
                src="/logo/logo.png"
                alt="APM Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow-lg"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-[#0B4F94] shadow-lg'
                        : 'text-blue-50 hover:bg-blue-600/40'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#0B4F94]' : 'text-white'}`} />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-blue-400/20">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white hover:text-red-300 ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="p-3 border-t border-blue-400/20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content from going under sidebar */}
      <div className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}
