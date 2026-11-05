import type { ComponentProps, ReactNode } from "react";

// Shared form field styles. Errors are linked with aria-describedby so screen
// readers announce them with the field.

export const inputClass =
  "w-full min-h-12 rounded-xl border-[3px] border-ink/80 bg-white px-4 py-3 text-base font-medium transition focus:border-teal focus:shadow-[var(--shadow-pop)] focus:outline-none aria-invalid:border-pink-deep";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label} {required ? <span className="text-pink-deep" aria-hidden>*</span> : <span className="text-sm font-normal text-ink-soft">(optional)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="mb-2 text-sm text-ink-soft">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-pink-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, { hint, error }: { hint?: unknown; error?: unknown }) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

export function Input(props: ComponentProps<"input">) {
  return <input className={inputClass} {...props} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea className={`${inputClass} min-h-28`} {...props} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select className={inputClass} {...props} />;
}
