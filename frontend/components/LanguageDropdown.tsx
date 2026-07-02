'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import i18n from '@/lib/i18next';
import { type Locale } from '@/lib/i18n';

export default function LanguageDropdown() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>((i18n.language as Locale) || 'en');

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const urlLang = params.get('lang') as Locale;
    if (urlLang && urlLang !== currentLocale) {
      i18n.changeLanguage(urlLang);
      setCurrentLocale(urlLang);
    }
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  const switchTo = async (l: Locale) => {
    if (l === currentLocale) {
      setOpen(false);
      return;
    }

    await i18n.changeLanguage(l);
    setCurrentLocale(l);
    setOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', l);

    router.push(url.pathname + url.search);
  };

  const flag = currentLocale === 'en' ? '🇺🇸' : '🇪🇸';

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label={t('language')}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/60 text-sm shadow-sm transition hover:scale-105"
      >
        <span className="text-lg">{flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-800 bg-slate-900 p-2 shadow-lg">
          <button
            onClick={() => switchTo('en')}
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-800"
          >
            <span>🇺🇸</span>
            <span>{t('english')}</span>
          </button>

          <button
            onClick={() => switchTo('es')}
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-800"
          >
            <span>🇪🇸</span>
            <span>{t('spanish')}</span>
          </button>
        </div>
      )}
    </div>
  );
}