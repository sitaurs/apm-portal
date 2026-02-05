'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mainNavigation } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  Send,
} from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-apm">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/logo.png"
              alt="APM Portal Logo"
              width={56}
              height={56}
              className="w-14 h-14 object-contain"
              priority
            />
            <div className="hidden sm:block">
              <span className="font-bold text-primary text-lg">APM Portal</span>
              <span className="text-text-muted text-xs block -mt-1">Polinema</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname.startsWith(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-text-main hover:text-primary hover:bg-gray-50'
                  )}
                >
                  {item.name}
                  {'submenu' in item && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown Submenu */}
                {'submenu' in item && item.submenu && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-xl shadow-dropdown border border-gray-100 py-2 min-w-[200px]">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-text-main hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Toggle (Mobile/Tablet) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Search (Desktop) */}
            <div className="hidden lg:block relative w-64">
              <SearchInput
                placeholder="Cari lomba, prestasi, expo..."
                className="text-sm"
              />
            </div>

            {/* Submit Button */}
            <Link href="/submit" className="hidden sm:block">
              <Button variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
                Submit Prestasi
              </Button>
            </Link>



            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 animate-slide-down">
            <SearchInput
              placeholder="Cari lomba, prestasi, expo..."
              className="w-full"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-down">
          <nav className="container-apm py-4 space-y-1">
            {mainNavigation.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname.startsWith(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-text-main hover:bg-gray-50'
                  )}
                >
                  {item.name}
                  {'submenu' in item && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        openSubmenu === item.name && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {/* Mobile Submenu */}
                {'submenu' in item && item.submenu && openSubmenu === item.name && (
                  <div className="ml-4 mt-1 space-y-1 animate-slide-down">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-text-muted hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Actions */}
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              <Link href="/submit" className="block">
                <Button variant="primary" fullWidth leftIcon={<Send className="w-4 h-4" />}>
                  Submit Prestasi
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
