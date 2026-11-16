"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type FormState } from "@/app/admin/actions";
import { buttonClass, errorClass, inputClass } from "./styles";

const initialState: FormState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const timedOut = useSearchParams().get("reason") === "timeout";

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {timedOut && !state.error ? (
        <p role="status" className="rounded-2xl border-2 border-ink bg-white p-4">
          You were signed out after 30 minutes without activity. Please sign in again.
        </p>
      ) : null}

      <div>
        <label htmlFor="admin-email" className="font-medium">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="font-medium">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
