"use client";

import { useActionState } from "react";
import type { EditState, FormValues } from "@/lib/admin/edit";
import { errorClass, inputClass, smallButtonClass } from "./styles";

export type FieldConfig = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url";
  options?: readonly string[];
};

type Props = {
  formId: string;
  title: string;
  action: (state: EditState, formData: FormData) => Promise<EditState>;
  hidden: Record<string, string>;
  fields: FieldConfig[];
  initial: FormValues;
};

// One edit form. The server checks everything again with the shared rules
// and sends back a plain message for each box that needs fixing.
export default function EditForm({ formId, title, action, hidden, fields, initial }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initial;
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate aria-labelledby={`${formId}-title`} className="space-y-4">
      <h2 id={`${formId}-title`} className="text-xl font-semibold">
        {title}
      </h2>

      {state.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}

      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `${formId}-${field.name}`;
          const error = errors[field.name];
          const value = values[field.name] ?? "";
          const common = {
            id,
            name: field.name,
            defaultValue: value,
            "aria-required": field.required ? true : undefined,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? `${id}-error` : undefined,
            className: inputClass,
          };
          // Keep a saved value that is not on the list (for example a
          // region outside Canada), so opening the form never loses it.
          const options =
            field.options && value && !field.options.includes(value)
              ? [value, ...field.options]
              : field.options;

          return (
            <div key={field.name}>
              <label htmlFor={id} className="font-medium">
                {field.label}
                {field.required ? <span className="text-red-700"> (required)</span> : null}
              </label>
              {options ? (
                <select {...common}>
                  <option value="">Choose one</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...common} type={field.type ?? "text"} autoComplete="off" />
              )}
              {error ? (
                <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button type="submit" disabled={pending} className={smallButtonClass}>
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
