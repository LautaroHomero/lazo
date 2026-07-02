import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Table2,
  KanbanSquare,
} from "lucide-react";
import { getDashboard, type Obligation } from "@/lib/api";
import { type Locale, getTranslations } from "@/lib/i18n";
import Calendar from "@/components/Calendar";
import KanbanBoard from "@/components/KanbanBoard";
import ObligationCard from "@/components/ObligationCard";

interface DashboardPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const PAGE_SIZE = 4;

type ViewMode = "table" | "kanban" | "calendar";

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function sortObligations(obligations: Obligation[]) {
  return [...obligations].sort((left, right) =>
    left.due_date.localeCompare(right.due_date),
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const cookieStore = cookies();
  if (cookieStore.get("lazo_auth")?.value !== "true") {
    redirect("/auth");
  }

  const locale = (
    asString(searchParams?.lang) === "es" ? "es" : "en"
  ) as Locale;
  const translations = getTranslations(locale);
  const statusFilter = asString(searchParams?.status);
  const query = asString(searchParams?.search).trim().toLowerCase();
  const requestedView = asString(searchParams?.view);
  const view: ViewMode =
    requestedView === "table" || requestedView === "calendar"
      ? requestedView
      : "kanban";
  const requestedPage = Number.parseInt(asString(searchParams?.page), 10);

  let dashboard: Record<string, Obligation[]> = {};
  let dashboardError = false;
  try {
    dashboard = await getDashboard();
  } catch (err) {
    dashboard = {};
    dashboardError = true;
  }

  const allObligations = Object.values(dashboard).flat();

  const matchesQuery = (obligation: Obligation) =>
    !query ||
    obligation.title.toLowerCase().includes(query) ||
    obligation.owner.toLowerCase().includes(query) ||
    obligation.description.toLowerCase().includes(query);

  const filtered = allObligations.filter((obligation) => {
    const matchesStatus = !statusFilter || obligation.status === statusFilter;
    return matchesStatus && matchesQuery(obligation);
  });

  const sorted = sortObligations(filtered);
  const kanbanDashboard: Record<string, Obligation[]> = {};
  Object.entries(dashboard).forEach(([status, items]) => {
    kanbanDashboard[status] = items.filter(matchesQuery);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number.isNaN(requestedPage) ? 1 : requestedPage),
    totalPages,
  );
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total = allObligations.length;
  const overdue = allObligations.filter((item) => item.is_overdue).length;
  const upcoming = allObligations.filter(
    (item) =>
      !item.is_overdue &&
      new Date(item.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ).length;

  const viewUrl = (nextView: ViewMode) => {
    const params = new URLSearchParams();
    params.set("lang", locale);
    if (statusFilter) params.set("status", statusFilter);
    if (query) params.set("search", query);
    params.set("view", nextView);
    return `/dashboard?${params.toString()}`;
  };

  const pageUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("lang", locale);
    if (statusFilter) params.set("status", statusFilter);
    if (query) params.set("search", query);
    params.set("view", "table");
    params.set("page", String(nextPage));
    return `/dashboard?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {dashboardError ? (
        <section className="rounded-[1.75rem] border border-rose-600/30 bg-rose-900/20 p-6 text-sm text-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{translations.errorTitle}</p>
              <p className="mt-1 text-xs text-rose-200">
                {translations.errorCannotReachApi}
              </p>
            </div>
            <a
              href="/dashboard?lang=en"
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
            >
              {translations.tryAgain}
            </a>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            {translations.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {translations.description}
          </p>
        </div>
        <Link
          href={`/obligations/new?lang=${locale}`}
          className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> {translations.newObligation}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: translations.total, value: total, accent: "text-white" },
          {
            label: translations.pending,
            value: dashboard.pending?.length ?? 0,
            accent: "text-sky-300",
          },
          {
            label: translations.inProgress,
            value: dashboard.in_progress?.length ?? 0,
            accent: "text-amber-300",
          },
          {
            label: translations.submitted,
            value: dashboard.submitted?.length ?? 0,
            accent: "text-violet-300",
          },
          {
            label: translations.done,
            value: dashboard.done?.length ?? 0,
            accent: "text-emerald-300",
          },
          {
            label: translations.overdueCount,
            value: overdue,
            accent: "text-rose-400",
          },
          {
            label: translations.upcomingCount,
            value: upcoming,
            accent: "text-amber-300",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-2.5 text-sm"
          >
            <span className={`text-lg font-semibold ${item.accent}`}>
              {item.value}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-800/60 bg-slate-900/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-full border border-slate-800 bg-slate-950/60 p-1 text-sm">
          <Link
            href={viewUrl("table")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition ${
              view === "table"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Table2 className="h-4 w-4" /> {translations.tableView}
          </Link>
          <Link
            href={viewUrl("kanban")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition ${
              view === "kanban"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <KanbanSquare className="h-4 w-4" /> {translations.kanbanView}
          </Link>
          <Link
            href={viewUrl("calendar")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition ${
              view === "calendar"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> {translations.calendarView}
          </Link>
        </div>

        {view !== "calendar" ? (
          <form
            action="/dashboard"
            method="get"
            className="flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="view" value={view} />
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                name="search"
                defaultValue={query}
                placeholder={translations.search}
                className="w-full rounded-full border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">{translations.allStatuses}</option>
              <option value="pending">{translations.pending}</option>
              <option value="in_progress">{translations.inProgress}</option>
              <option value="submitted">{translations.submitted}</option>
              <option value="done">{translations.done}</option>
            </select>
            <button
              type="submit"
              className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {translations.search}
            </button>
          </form>
        ) : null}
      </div>

      {view === "table" ? (
        <div className="space-y-4">
          <div className="grid gap-3">
            {paginated.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-900/90 p-10 text-center text-slate-500">
                {translations.noObligations}
              </div>
            ) : (
              paginated.map((obligation) => (
                <ObligationCard
                  key={obligation.id}
                  obligation={obligation}
                  locale={locale}
                  variant="row"
                />
              ))
            )}
          </div>

          {sorted.length > PAGE_SIZE ? (
            <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-800/60 bg-slate-900/60 px-4 py-3">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page <= 1}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  page <= 1
                    ? "pointer-events-none text-slate-600"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />{" "}
                {translations.paginationPrev}
              </Link>
              <span className="text-sm text-slate-400">
                {translations.pageLabel} {page} {translations.ofLabel}{" "}
                {totalPages}
              </span>
              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page >= totalPages}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  page >= totalPages
                    ? "pointer-events-none text-slate-600"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {translations.paginationNext}{" "}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard dashboard={kanbanDashboard} locale={locale} />
      ) : (
        <div className="mx-auto max-w-2xl">
          <Calendar obligations={allObligations} locale={locale} />
        </div>
      )}
    </div>
  );
}
