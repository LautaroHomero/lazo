"use client";

import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { deleteObligationAction } from "@/app/actions/obligations";

interface DeleteObligationButtonProps {
  id: string;
  lang: string;
  confirmText: string;
  className?: string;
  label?: ReactNode;
}

export default function DeleteObligationButton({
  id,
  lang,
  confirmText,
  className,
  label,
}: DeleteObligationButtonProps) {
  return (
    <form
      action={deleteObligationAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="lang" value={lang} />
      <button
        type="submit"
        title="Delete"
        aria-label="Delete"
        onClick={(event) => event.stopPropagation()}
        className={
          className ??
          "flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 transition hover:bg-rose-500 hover:text-white"
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}
