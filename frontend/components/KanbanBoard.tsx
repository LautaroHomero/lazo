import ObligationCard from './ObligationCard';
import { type Obligation } from '@/lib/api';
import { type Locale, getTranslations } from '@/lib/i18n';

interface KanbanBoardProps {
  dashboard: Record<string, Obligation[]>;
  locale: Locale;
}

export default function KanbanBoard({ dashboard, locale }: KanbanBoardProps) {
  const translations = getTranslations(locale);

  const columns = [
    { key: 'pending', label: translations.pending, dot: 'bg-sky-400' },
    { key: 'in_progress', label: translations.inProgress, dot: 'bg-amber-400' },
    { key: 'submitted', label: translations.submitted, dot: 'bg-violet-400' },
    { key: 'done', label: translations.done, dot: 'bg-emerald-400' },
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => {
        const items = (dashboard[column.key] ?? []).slice().sort((a, b) => a.due_date.localeCompare(b.due_date));
        return (
          <div key={column.key} className="min-w-0 rounded-[1.75rem] border border-slate-800/60 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-200">
              <span className={`h-2 w-2 rounded-full ${column.dot}`} />
              {column.label}
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-600">
                  {translations.noObligations}
                </div>
              ) : (
                items.map((item) => <ObligationCard key={item.id} obligation={item} locale={locale} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
