import { Suspense } from "react";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth/admin-guard";
import MfaForm from "@/components/admin/MfaForm";
import SignOutButton from "@/components/admin/SignOutButton";

export default function AdminMfaPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Check it is you</h1>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <MfaStep />
      </Suspense>
    </div>
  );
}

async function MfaStep() {
  const check = await checkAdmin();
  if (check.stage === "signed-out" || check.stage === "not-admin") redirect("/admin/login");
  if (check.stage === "ok") redirect("/admin");

  const { data: factors } = await check.supabase.auth.mfa.listFactors();
  const verified = (factors?.all ?? []).find(
    (f) => f.factor_type === "totp" && f.status === "verified"
  );

  return (
    <>
      {verified ? <MfaForm mode="verify" factorId={verified.id} /> : <MfaForm mode="enroll" />}
      <div className="mt-6">
        <SignOutButton />
      </div>
    </>
  );
}
