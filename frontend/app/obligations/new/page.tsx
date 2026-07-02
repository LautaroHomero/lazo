import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createObligationAction } from "@/app/actions/obligations";
import { type Locale, getTranslations } from "@/lib/i18n";

interface NewObligationPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default function NewObligationPage({
  searchParams,
}: NewObligationPageProps) {
  const cookieStore = cookies();
  if (cookieStore.get("lazo_auth")?.value !== "true") {
    redirect("/auth");
  }

  const locale = (
    asString(searchParams?.lang) === "es" ? "es" : "en"
  ) as Locale;
  const translations = getTranslations(locale);
  const error = asString(searchParams?.error);
  const initialValues = {
    title: asString(searchParams?.title),
    description: asString(searchParams?.description),
    type: asString(searchParams?.type) || "annual_report",
    owner: asString(searchParams?.owner),
    due_date: asString(searchParams?.due_date),
    company_tax_id: asString(searchParams?.company_tax_id),
    requires_document: asString(searchParams?.requires_document) === "1",
  };

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
              {translations.quickAction}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {translations.createTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{translations.create}</p>
          </div>
          <Link
            href={`/dashboard?lang=${locale}`}
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
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                {translations.formDetails}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {translations.fillObligationHelp}
              </p>
            </div>

            <form action={createObligationAction} className="space-y-5">
              <input type="hidden" name="lang" value={locale} />
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">
                  {translations.titleField}
                </span>
                <input
                  name="title"
                  defaultValue={initialValues.title}
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
                  defaultValue={initialValues.description}
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

          <div className="space-y-6 rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  {translations.helpLabel}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {translations.tipsForFastSetup}
                </h3>
              </div>
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase text-slate-300">
                New
              </span>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>• {translations.tipOwnerDate}</li>
              <li>• {translations.tipCalendar}</li>
              <li>• {translations.tipDocuments}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
