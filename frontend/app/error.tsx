"use client";

import { useTranslation } from "react-i18next";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[2rem] border border-red-700/40 bg-slate-950/95 p-10 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
      <h2 className="text-lg font-semibold text-white">{t("errorTitle")}</h2>
      <p className="mt-4 text-sm text-slate-400">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
