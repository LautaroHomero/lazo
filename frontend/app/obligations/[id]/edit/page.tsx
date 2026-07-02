import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateObligationAction } from "@/app/actions/obligations";
import { formatDate, getObligation } from "@/lib/api";
import { type Locale, getTranslations } from "@/lib/i18n";

interface EditObligationPageProps {
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

export default async function EditObligationPage({
  params,
  searchParams,
}: EditObligationPageProps) {
  const cookieStore = cookies();
  if (cookieStore.get("lazo_auth")?.value !== "true") {
    redirect("/auth");
  }

  const locale = (
    asString(searchParams?.lang) === "es" ? "es" : "en"
  ) as Locale;
  const translations = getTranslations(locale);
  const error = asString(searchParams?.error);
  const obligation = await getObligation(params.id).catch(() => null);

  if (!obligation) {
    notFound();
  }

  const initialValues = {
    title: asString(searchParams?.title) || obligation.title,
    description: asString(searchParams?.description) || obligation.description,
    type: asString(searchParams?.type) || obligation.type,
    owner: asString(searchParams?.owner) || obligation.owner,
    due_date: asString(searchParams?.due_date) || obligation.due_date,
    company_tax_id:
      asString(searchParams?.company_tax_id) || obligation.company_tax_id,
    requires_document:
      asString(searchParams?.requires_document) === "1"
        ? true
        : obligation.requires_document,
  };

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
              {translations.editTitle}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {translations.editTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{translations.edit}</p>
          </div>
          <Link
            href={`/obligations/${obligation.id}?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> {translations.back}
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100 shadow-[0_20px_40px_rgba(220,38,38,0.12)]">
            <p className="font-semibold">{translations.error}</p>
            <p className="mt-2 text-sm text-red-100/90">{error}</p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
            <form action={updateObligationAction} className="space-y-5">
              <input type="hidden" name="id" value={obligation.id} />
              <input type="hidden" name="lang" value={locale} />
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">
                  {translations.titleField}
                </span>
                <input
                  name="title"
                  defaultValue={obligation.title}
                  required
                  className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">
                  {translations.descriptionField}
                </span>
                <textarea
                  name="description"
                  defaultValue={obligation.description}
                  required
                  className="min-h-[10rem] w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block text-slate-500">
                    {translations.typeField}
                  </span>
                  <select
                    name="type"
                    defaultValue={initialValues.type}
                    required
                    className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="annual_report">Annual report</option>
                    <option value="franchise_tax">Franchise tax</option>
                    <option value="boi_report">BOI report</option>
                    <option value="registered_agent_renewal">
                      Registered agent renewal
                    </option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block text-slate-500">
                    {translations.ownerField}
                  </span>
                  <input
                    name="owner"
                    defaultValue={initialValues.owner}
                    required
                    className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block text-slate-500">
                    {translations.dueDateField}
                  </span>
                  <input
                    type="date"
                    name="due_date"
                    defaultValue={initialValues.due_date}
                    required
                    className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block text-slate-500">
                    {translations.taxIdField}
                  </span>
                  <input
                    name="company_tax_id"
                    defaultValue={initialValues.company_tax_id}
                    required
                    minLength={4}
                    className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-[1.5rem] border border-slate-700 bg-slate-900/90 px-4 py-4 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="requires_document"
                  defaultChecked={initialValues.requires_document}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                />
                {translations.requiresDocumentField}
              </label>
              <button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                {translations.save}
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
            <h3 className="text-lg font-semibold text-white">
              {translations.quickOverview}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {translations.editHelp}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-400">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {translations.statusField}
                </p>
                <p className="mt-2 font-semibold text-white">
                  {statusLabel(obligation.status, translations)}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {translations.typeField}
                </p>
                <p className="mt-2 font-semibold text-white">
                  {obligation.type}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {translations.due}
                </p>
                <p className="mt-2 font-semibold text-white">
                  {formatDate(obligation.due_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
