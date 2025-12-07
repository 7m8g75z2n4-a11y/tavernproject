"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";

type ActionResult = { text?: string; error?: string };

type Props = {
  label: string;
  description?: string;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  hiddenFields?: Record<string, string | undefined | null>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-60 font-semibold text-xs"
    >
      {pending ? "Thinking..." : label}
    </button>
  );
}

export function AiActionForm({ label, description, action, hiddenFields }: Props) {
  const [state, formAction] = useFormState<ActionResult, FormData>(action, {});
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{label}</div>
        <button
          type="button"
          className="text-[11px] underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>
      {description && <div className="opacity-80">{description}</div>}
      {expanded && (
        <form action={formAction} className="space-y-2">
          {hiddenFields &&
            Object.entries(hiddenFields)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)}
          <SubmitButton label={label} />
        </form>
      )}
      {state?.error && <div className="text-red-300 text-[11px]">Error: {state.error}</div>}
      {state?.text && (
        <div className="border border-amber-800/40 rounded-md p-2 bg-amber-950/40 whitespace-pre-wrap leading-relaxed">
          {state.text}
        </div>
      )}
    </div>
  );
}
