'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Obligation } from '@/lib/api';
import { type Locale } from '@/lib/i18n';

interface CalendarProps {
  obligations: Obligation[];
  locale: Locale;
}

function getMonthCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/**
 * Purely informational month calendar: it lets you page between months to
 * see which days have obligations due, but it never filters or mutates
 * anything (no click-to-select, no drag, no editing of due dates here).
 */
export default function Calendar({ obligations, locale }: CalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const countByDay = new Map<string, number>();
  obligations.forEach((obligation) => {
    const key = new Date(obligation.due_date).toDateString();
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  });

  const cells = getMonthCells(viewDate.getFullYear(), viewDate.getMonth());
  const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
    const reference = new Date(2023, 0, index + 1); // Jan 1 2023 was a Sunday
    return reference.toLocaleDateString(locale, { weekday: 'short' });
  });

  const goToPreviousMonth = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToCurrentMonth = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goToCurrentMonth}
          title="Back to current month"
          className="text-sm font-semibold capitalize text-white transition hover:text-cyan-300"
        >
          {monthLabel}
        </button>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-slate-500">
        {weekdayLabels.map((label, index) => (
          <div key={`${label}-${index}`}>{label}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-9" />;
          }
          const key = date.toDateString();
          const count = countByDay.get(key) ?? 0;
          const isToday = key === today.toDateString();
          return (
            <div key={key} className="flex h-9 flex-col items-center justify-center gap-0.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday ? 'bg-cyan-500 font-semibold text-slate-950' : 'text-slate-300'
                }`}
              >
                {date.getDate()}
              </span>
              <span className={`h-1 w-1 rounded-full ${count > 0 ? 'bg-amber-400' : 'bg-transparent'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
