import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { getSignup, type SignupDetail } from "@/lib/admin/signups";
import { emailConsentLabel, formatDateTime, formatPhone, privacyConsentLabel } from "@/lib/admin/format";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { errorClass, linkClass } from "@/components/admin/styles";
import { deleteApplicant, withdrawConsent } from "../actions";

type Params = Promise<{ id: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

// Shown after a change, so the admin knows it worked.
const NOTICES: Record<string, string> = {
  personal: "Personal information saved.",
  business: "Business information saved.",
  privacy: "Privacy consent withdrawal recorded. Email consent was withdrawn too, so this person will not be emailed.",
  email: "Email consent withdrawal recorded. This person will not be emailed.",
};

export default function SignupDetailPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={<p>Loading...</p>}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Detail({ params, searchParams }: { params: Params; searchParams: Search }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const { done } = await searchParams;
  const notice = typeof done === "string" ? NOTICES[done] : undefined;
  const result = await getSignup(id);

  if (result.ok && !result.signup) notFound();

  return (
    <div className="space-y-6">
      <AdminHeader email={admin.email} />
      <Link href="/admin" className={linkClass}>
        Back to all signups
      </Link>
      {notice ? (
        <p role="status" className="rounded-2xl border border-ink bg-mint/40 p-4 text-ink">
          {notice}
        </p>
      ) : null}
      {result.ok && result.signup ? (
        <SignupView signup={result.signup} />
      ) : (
        <p role="alert" className={errorClass}>
          We could not load this signup. Please reload the page in a moment.
        </p>
      )}
    </div>
  );
}

function address(parts: (string | null)[]): string {
  return parts.filter(Boolean).join(", ");
}

function Fields({ items }: { items: [string, string | null | undefined][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[12rem_1fr]">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="font-semibold">{label}</dt>
          <dd className="break-words">{value ? value : <span className="text-ink/75">Not given</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

const sectionClass = "rounded-3xl border-2 border-ink bg-white p-5";

function SignupView({ signup: s }: { signup: SignupDetail }) {
  const name = [s.first_name, s.last_name].filter(Boolean).join(" ");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{name}</h1>
        <Link href={`/admin/signups/${s.id}/edit`} className={linkClass}>
          Edit details
        </Link>
      </div>

      <section aria-labelledby="personal-heading" className={sectionClass}>
        <h2 id="personal-heading" className="mb-4 text-xl font-semibold">
          Personal information
        </h2>
        <Fields
          items={[
            ["First name", s.first_name],
            ["Last name", s.last_name],
            ["Address", address([s.street_number, s.street_name, s.city, s.province, s.postal_code, s.country])],
            ["Phone", formatPhone(s.phone)],
            ["Mobile", formatPhone(s.mobile)],
            ["Email", s.email],
            ["Signed up", formatDateTime(s.created_at)],
            ["Last changed", formatDateTime(s.updated_at)],
          ]}
        />
      </section>

      {s.businesses.map((b, index) => (
        <section key={b.id} aria-labelledby={`business-heading-${b.id}`} className={sectionClass}>
          <h2 id={`business-heading-${b.id}`} className="mb-4 text-xl font-semibold">
            Business information{s.businesses.length > 1 ? ` (${index + 1} of ${s.businesses.length})` : ""}
          </h2>
          <Fields
            items={[
              ["Company name", b.company_name],
              ["Type of business", b.business_type],
              ["Address", address([b.street_number, b.street_name, b.city, b.province, b.postal_code, b.country])],
              ["Phone", formatPhone(b.phone)],
              ["Website", b.website],
              ["Email", b.email],
            ]}
          />
        </section>
      ))}

      {s.consents.map((c, index) => (
        <section key={c.id} aria-labelledby={`consent-heading-${c.id}`} className={sectionClass}>
          <h2 id={`consent-heading-${c.id}`} className="mb-4 text-xl font-semibold">
            Consent record{s.consents.length > 1 ? ` (${index + 1} of ${s.consents.length})` : ""}
          </h2>
          <Fields
            items={[
              ["Privacy consent", privacyConsentLabel(c.privacy_consent, c.privacy_withdrawn_at)],
              ["Email consent", emailConsentLabel(c.email_opt_in, c.email_withdrawn_at)],
              ["Consent date", formatDateTime(c.consented_at)],
              ["Wording version", c.wording_version],
              ["Page address", c.page_url],
              ["Privacy withdrawn", formatDateTime(c.privacy_withdrawn_at)],
              ["Email withdrawn", formatDateTime(c.email_withdrawn_at)],
            ]}
          />
        </section>
      ))}

      <Actions signup={s} name={name} />
    </>
  );
}

function Actions({ signup: s, name }: { signup: SignupDetail; name: string }) {
  const privacyActive = s.consents.some((c) => !c.privacy_withdrawn_at);
  const emailActive = s.consents.some((c) => c.email_opt_in && !c.email_withdrawn_at);

  return (
    <section aria-labelledby="actions-heading" className={sectionClass}>
      <h2 id="actions-heading" className="mb-4 text-xl font-semibold">
        Requests from this person
      </h2>
      <div className="space-y-6">
        {emailActive ? (
          <div className="space-y-2">
            <p>Use this when the person asks to stop receiving emails.</p>
            <ConfirmAction
              action={withdrawConsent}
              hidden={{ id: s.id, kind: "email" }}
              openLabel="Record email consent withdrawal"
              confirmLabel="Yes, record the withdrawal"
              warningTitle="Record email consent withdrawal?"
              warning={<p>From now on, {name} will not be emailed. The original consent record is kept. This cannot be undone here.</p>}
            />
          </div>
        ) : null}

        {privacyActive ? (
          <div className="space-y-2">
            <p>Use this when the person withdraws consent to the privacy notice.</p>
            <ConfirmAction
              action={withdrawConsent}
              hidden={{ id: s.id, kind: "privacy" }}
              openLabel="Record privacy consent withdrawal"
              confirmLabel="Yes, record the withdrawal"
              warningTitle="Record privacy consent withdrawal?"
              warning={
                <p>
                  Email consent will be withdrawn too, so {name} will not be emailed. The record stays until the person
                  asks for it to be deleted. This cannot be undone here.
                </p>
              }
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <p>Use this only when the person asks for their information to be deleted.</p>
          <ConfirmAction
            action={deleteApplicant}
            hidden={{ id: s.id }}
            openLabel="Delete this signup"
            confirmLabel="Yes, delete for good"
            warningTitle="Delete this signup for good?"
            warning={
              <p>
                This deletes {name}, their business information and their consent records. It cannot be undone. The
                admin record keeps only the date, your admin id and the record id, with no personal information.
              </p>
            }
          />
        </div>
      </div>
    </section>
  );
}
