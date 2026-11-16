"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { startMfaEnrollment, verifyMfa, type EnrollResult, type FormState } from "@/app/admin/actions";
import { buttonClass, errorClass, inputClass } from "./styles";

const initialState: FormState = { error: null };

type Props =
  // An authenticator app is already set up: just ask for the code.
  | { mode: "verify"; factorId: string }
  // First time: set up an authenticator app, then ask for the code.
  | { mode: "enroll" };

export default function MfaForm(props: Props) {
  const [enrollment, setEnrollment] = useState<EnrollResult | null>(null);
  const [starting, startTransition] = useTransition();

  const factorId =
    props.mode === "verify" ? props.factorId : enrollment?.ok ? enrollment.factorId : null;

  function beginSetup() {
    startTransition(async () => setEnrollment(await startMfaEnrollment()));
  }

  return (
    <div className="mt-6 space-y-4">
      {props.mode === "enroll" && !enrollment?.ok ? (
        <>
          <p>
            For extra safety, the admin area needs an authenticator app, such as Google
            Authenticator, Microsoft Authenticator or 1Password. You set it up once.
          </p>
          {enrollment && !enrollment.ok ? (
            <p role="alert" className={errorClass}>
              {enrollment.error}
            </p>
          ) : null}
          <button type="button" onClick={beginSetup} disabled={starting} className={buttonClass}>
            {starting ? "Starting..." : "Set up authenticator app"}
          </button>
        </>
      ) : null}

      {enrollment?.ok ? (
        <ol className="list-decimal space-y-3 pl-6">
          <li>Open your authenticator app and choose to add an account.</li>
          <li>
            Scan this QR code:
            <Image
              src={enrollment.qrCode}
              alt="QR code to scan with your authenticator app"
              width={200}
              height={200}
              unoptimized
              className="mt-2 rounded-2xl border-2 border-ink bg-white p-2"
            />
          </li>
          <li>
            If you cannot scan it, type this setup key into the app instead:
            <code className="mt-2 block break-all rounded-2xl bg-white p-3 font-mono text-base">
              {enrollment.secret}
            </code>
          </li>
          <li>Enter the 6 digit code the app shows below.</li>
        </ol>
      ) : null}

      {factorId ? <CodeForm factorId={factorId} /> : null}
    </div>
  );
}

function CodeForm({ factorId }: { factorId: string }) {
  const [state, formAction, pending] = useActionState(verifyMfa, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="factorId" value={factorId} />
      <div>
        <label htmlFor="mfa-code" className="font-medium">
          6 digit code from your authenticator app
        </label>
        <input
          id="mfa-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
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
        {pending ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}
