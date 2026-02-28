'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
  ];

  return (
    <>
      {/* Early Development Disclaimer Banner */}
      <div className="w-full bg-cherry-blossom/20 py-2 text-center">
        <p className="text-sm font-medium text-foreground/80">
          ℹ️ Please be patient whilst we work on this, we&apos;re just kids 🤙
        </p>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <svg
              className="h-6 w-6 text-cherry-blossom"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Pen & Paper Games</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground/60 hover:bg-foreground/10 hover:text-foreground focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-foreground/10">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
