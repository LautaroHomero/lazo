import type { Metadata } from 'next';
import './globals.css';
import I18nProvider from '@/components/I18nProvider';

export const metadata: Metadata = {
  title: 'Lazo Compliance',
  description: 'Manage compliance obligations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
