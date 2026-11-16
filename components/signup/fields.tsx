import type { UseFormRegisterReturn } from "react-hook-form";

// Small reusable pieces: a text box and a drop down, each with a label,
// an optional hint and an error message that screen readers announce.

const inputClass =
  "mt-1 block min-h-11 w-full rounded-2xl border-2 border-ink bg-white px-3 py-2 text-base text-ink focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink aria-[invalid=true]:border-red-700";

type BaseProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

function Label({ id, label, required }: Pick<BaseProps, "id" | "label" | "required">) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-ink">
      {label}
      {required ? (
        <span aria-hidden="true" className="text-red-700">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}

function Message({ id, hint, error }: Pick<BaseProps, "id" | "hint" | "error">) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink/75">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </>
  );
}

function describedBy({ id, hint, error }: Pick<BaseProps, "id" | "hint" | "error">) {
  const ids = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function TextField(
  props: BaseProps & {
    type?: "text" | "email" | "tel" | "url";
    autoComplete?: string;
    inputMode?: "text" | "email" | "tel" | "url" | "numeric";
  }
) {
  const { id, label, required, hint, error, registration, type = "text", autoComplete, inputMode } = props;
  return (
    <div>
      <Label id={id} label={label} required={required} />
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, hint, error })}
        className={inputClass}
        {...registration}
      />
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField(
  props: BaseProps & { options: readonly string[]; placeholder: string; autoComplete?: string }
) {
  const { id, label, required, hint, error, registration, options, placeholder, autoComplete } = props;
  return (
    <div>
      <Label id={id} label={label} required={required} />
      <select
        id={id}
        autoComplete={autoComplete}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, hint, error })}
        className={inputClass}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}
