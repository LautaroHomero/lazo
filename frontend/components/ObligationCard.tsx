import Link from 'next/link';
import { AlertTriangle, CalendarDays, CheckCircle2, FileText, Pencil } from 'lucide-react';
import DeleteObligationButton from './DeleteObligationButton';
import { formatDate, type Obligation } from '@/lib/api';
import { type Locale, getTranslations } from '@/lib/i18n';

interface ObligationCardProps {
  obligation: Obligation;
  locale: Locale;
  variant?: 'kanban' | 'row';
}

const TYPE_LABELS: Record<string, string> = {
  annual_report: 'Annual report',
  franchise_tax: 'Franchise tax',
  boi_report: 'BOI report',
  registered_agent_renewal: 'Registered agent renewal',
};

export default function ObligationCard({ obligation, locale, variant = 'kanban' }: ObligationCardProps) {
  const translations = getTranslations(locale);
  const typeLabel = TYPE_LABELS[obligation.type] ?? obligation.type;

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border border-slate-800/70 bg-slate-900/80 p-4 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-slate-900 ${
        variant === 'row' ? 'sm:p-5' : ''
      }`}
    >
      <Link href={`/obligations/${obligation.id}?lang=${locale}`} className="absolute inset-0 z-0" aria-label={obligation.title} />

      <div className={`relative z-10 flex items-start justify-between gap-3 ${variant === 'row' ? 'sm:items-center' : ''}`}>
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {translations.owner}: <span className="text-slate-300">{obligation.owner}</span>
          </p>
          <h4 className="mt-1 truncate text-base font-semibold text-white">{obligation.title}</h4>
        </div>
        <div className="pointer-events-auto relative z-20 flex flex-shrink-0 items-center gap-1">
          <Link
            href={`/obligations/${obligation.id}/edit?lang=${locale}`}
            title={translations.edit}
            aria-label={translations.edit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 transition hover:bg-cyan-500 hover:text-slate-950"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <DeleteObligationButton id={obligation.id} lang={locale} confirmText={translations.confirmDelete} />
        </div>
      </div>

      <p className="relative z-10 mt-2 text-[11px] font-mono uppercase tracking-wide text-slate-600">#{obligation.id.slice(0, 8)}</p>

      <div className="relative z-10 mt-3 flex items-center gap-2 text-xs text-slate-400">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(obligation.due_date)}
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap gap-2">
        {obligation.is_overdue ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
            <AlertTriangle className="h-3 w-3" /> {translations.overdue}
          </span>
        ) : null}
        {obligation.requires_document ? (
          obligation.document ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> {translations.documentAttached}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
              <FileText className="h-3 w-3" /> {translations.requiresDocument}
            </span>
          )
        ) : null}
        <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
          {typeLabel}
        </span>
      </div>
    </div>
  );
}
