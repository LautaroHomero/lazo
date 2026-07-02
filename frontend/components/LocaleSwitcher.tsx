import Link from 'next/link';
import { type Locale, getTranslations } from '@/lib/i18n';

interface LocaleSwitcherProps {
  locale: Locale;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LocaleSwitcher({ locale, pathname, searchParams }: LocaleSwitcherProps) {
  const translations = getTranslations(locale);
  const nextLocale: Locale = locale === 'en' ? 'es' : 'en';

  const params = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  params.set('lang', nextLocale);

  return (
    <Link
      href={`${pathname}?${params.toString()}`}
      className="rounded border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
    >
      {translations.language}: {locale === 'en' ? translations.spanish : translations.english}
    </Link>
  );
}
