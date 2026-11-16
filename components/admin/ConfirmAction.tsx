"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { EditState } from "@/lib/admin/edit";
import { dangerButtonClass, errorClass, secondaryButtonClass } from "./styles";

type Props = {
  action: (state: EditState, formData: FormData) => Promise<EditState>;
  hidden: Record<string, string>;
  openLabel: string;
  confirmLabel: string;
  warningTitle: string;
  warning: React.ReactNode;
};

// A button that asks first. The first click only shows a warning; nothing
// changes until the admin presses the second, clearly named button.
export default function ConfirmAction({ action, hidden, openLabel, confirmLabel, warningTitle, warning }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Move keyboard and screen reader focus to the warning when it opens.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function cancel() {
    setOpen(false);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  if (!open) {
    return (
      <button ref={openButtonRef} type="button" onClick={() => setOpen(true)} className={secondaryButtonClass}>
        {openLabel}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="region"
      aria-label={warningTitle}
      className="space-y-3 rounded-2xl border-2 border-red-700 bg-red-50 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
    >
      <p className="font-semibold text-red-800">{warningTitle}</p>
      <div className="text-ink">{warning}</div>

      {state.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-wrap gap-3">
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" disabled={pending} className={dangerButtonClass}>
          {pending ? "Please wait..." : confirmLabel}
        </button>
        <button type="button" onClick={cancel} disabled={pending} className={secondaryButtonClass}>
          Cancel
        </button>
      </form>
    </div>
  );
}
