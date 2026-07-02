'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Plus, LogIn, LogOut, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';
import { type Locale, getTranslations } from '@/lib/i18n';

interface AppShellProps {
  children: ReactNode;
  breadcrumb: string;
}

export default function AppShell({ children, breadcrumb }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'es' || urlLang === 'en') {
      setLocale(urlLang);
    }
    setIsLoggedIn(document.cookie.includes('lazo_auth=true'));
  }, [pathname]);

  const translations = getTranslations(locale);

  const navItems = [
    { href: `/dashboard?lang=${locale}`, icon: LayoutDashboard, label: translations.dashboard, match: '/dashboard' },
    { href: `/obligations/new?lang=${locale}`, icon: Plus, label: translations.newObligation, match: '/obligations/new' },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex gap-4 rounded-[2rem] border border-slate-800/70 bg-slate-950/70 p-3 shadow-[0_40px_140px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:gap-6 sm:p-4 lg:p-5">
        <aside className="flex w-16 flex-shrink-0 flex-col items-center justify-between rounded-[1.75rem] border border-slate-800/60 bg-slate-900/60 py-5 sm:w-20">
          <div className="flex flex-col items-center gap-6">
            <Link
              href={`/dashboard?lang=${locale}`}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-slate-950 shadow-lg"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <nav className="flex flex-col items-center gap-3">
              {navItems.map((item) => {
                const active = pathname?.startsWith(item.match);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                      active ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col items-center gap-3">
            <LanguageDropdown />
            {isLoggedIn ? (
              <Link
                href="/logout"
                title="Logout"
                aria-label="Logout"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/auth"
                title="Login"
                aria-label="Login"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 rounded-[1.75rem] border border-slate-800/60 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.forward()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Forward"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <p className="text-sm font-medium text-slate-300">Lazo / {breadcrumb}</p>
          </header>

          <main className="mt-5 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
