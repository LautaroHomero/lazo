import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  changeStatusAction,
  attachDocumentAction,
} from "@/app/actions/obligations";
import DeleteObligationButton from "@/components/DeleteObligationButton";
import { getObligation, type Obligation } from "@/lib/api";
import { type Locale, getTranslations } from "@/lib/i18n";

interface DetailPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function statusLabel(
  status: string,
  translations: ReturnType<typeof getTranslations>,
) {
  const map: Record<string, string> = {
    pending: translations.pending,
    in_progress: translations.inProgress,
    submitted: translations.submitted,
    done: translations.done,
  };
  return map[status] || status;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CA");
}

export default async function ObligationDetailPage({
  params,
  searchParams,
}: DetailPageProps) {
  const cookieStore = cookies();
  if (cookieStore.get("lazo_auth")?.value !== "true") {
    redirect("/auth");
  }

  const locale = (
    asString(searchParams?.lang) === "es" ? "es" : "en"
  ) as Locale;
  const translations = getTranslations(locale);
  const obligation = await getObligation(params.id).catch(() => null);

  if (!obligation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
              {translations.details}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {translations.detailsTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {translations.detailHelp}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm">
              {obligation.is_overdue ? (
                <span className="inline-flex h-9 items-center rounded-full bg-rose-500 px-3 text-xs uppercase text-white">
                  {translations.overdue}
                </span>
              ) : (
                <span className="inline-flex h-9 items-center rounded-full bg-slate-800 px-3 text-xs uppercase text-slate-300">
                  {statusLabel(obligation.status, translations)}
                </span>
              )}
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Version {obligation.version}
              </span>
            </div>
            <Link
              href={`/dashboard?lang=${locale}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900/90 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> {translations.back}
            </Link>
            <Link
              href={`/obligations/${obligation.id}/edit?lang=${locale}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              <Pencil className="h-4 w-4" /> {translations.edit}
            </Link>
            <DeleteObligationButton
              id={obligation.id}
              lang={locale}
              confirmText={translations.confirmDelete}
              label={translations.delete}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-rose-500/15 px-4 text-sm font-semibold text-rose-300 transition hover:bg-rose-500 hover:text-white"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/90 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {translations.owner}
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {obligation.owner}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/90 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {translations.dueDate}
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {formatDate(obligation.due_date)}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/90 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {translations.type}
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {obligation.type}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                {translations.history}
              </h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {obligation.audit_events.length} events
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {obligation.audit_events.length === 0 ? (
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">
                  {translations.noHistory}
                </div>
              ) : (
                obligation.audit_events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[1.75rem] border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-white">
                        {statusLabel(event.from_status, translations)} →{" "}
                        {statusLabel(event.to_status, translations)}
                      </p>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        {formatDate(event.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <h3 className="text-lg font-semibold text-white">
              {translations.attachDocument}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {translations.attachDocumentHelp}
            </p>
            <form
              action={attachDocumentAction}
              encType="multipart/form-data"
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="id" value={obligation.id} />
              <input type="hidden" name="lang" value={locale} />
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">
                  {translations.documentName}
                </span>
                <input
                  type="text"
                  name="file_name"
                  className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Optional filename"
                />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">
                  {translations.uploadFile}
                </span>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.txt"
                  required
                  className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                {translations.attachDocument}
              </button>
            </form>
            <div className="mt-5 rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
              {obligation.document ? (
                <div className="space-y-2">
                  <p>{`${translations.documentAttached}: ${obligation.document.file_name}`}</p>
                  <a
                    href={obligation.document.storage_path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 underline"
                  >
                    {translations.viewDocument}
                  </a>
                </div>
              ) : (
                translations.noDocument
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                {translations.availableTransitions}
              </h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Actions
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {obligation.available_transitions.map((transition) => (
                <form key={transition} action={changeStatusAction}>
                  <input type="hidden" name="id" value={obligation.id} />
                  <input type="hidden" name="status" value={transition} />
                  <input type="hidden" name="lang" value={locale} />
                  <button className="w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                    {statusLabel(transition, translations)}
                  </button>
                </form>
              ))}
              <form action={changeStatusAction}>
                <input type="hidden" name="id" value={obligation.id} />
                <input type="hidden" name="status" value="submitted" />
                <input type="hidden" name="lang" value={locale} />
                <button
                  disabled={!obligation.can_submit}
                  className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700/40 disabled:text-slate-400"
                >
                  {translations.submit}
                </button>
              </form>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
