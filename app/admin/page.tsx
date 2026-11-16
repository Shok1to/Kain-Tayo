import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { listSignups } from "@/lib/admin/signups";
import { exportFields, parseListParams } from "@/lib/admin/list-params";
import AdminHeader from "@/components/admin/AdminHeader";
import SignupFilters from "@/components/admin/SignupFilters";
import SignupTable from "@/components/admin/SignupTable";
import { errorClass, secondaryButtonClass } from "@/components/admin/styles";

export default function AdminHomePage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<p>Loading...</p>}>
        <AdminList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminList({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const admin = await requireAdmin();
  const raw = await searchParams;
  const params = parseListParams(raw);
  const result = await listSignups(params);

  return (
    <div className="space-y-6">
      <AdminHeader email={admin.email} />
      <h1 className="text-3xl font-bold">Signups</h1>
      {raw.done === "deleted" ? (
        <p role="status" className="rounded-2xl border border-ink bg-mint/40 p-4 text-ink">
          The signup was deleted.
        </p>
      ) : null}
      <SignupFilters params={params} />
      {result.ok ? (
        <>
          {result.total > 0 ? (
            <div className="rounded-2xl border-2 border-ink bg-white p-4">
              <form method="post" action="/admin/export">
                {exportFields(params).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <button type="submit" className={secondaryButtonClass}>
                  Download these {result.total} signups as CSV
                </button>
              </form>
              <p className="mt-2 text-sm text-ink/75">
                The file contains personal information. Keep it somewhere safe, do not email it, and delete it when
                you no longer need it.
              </p>
            </div>
          ) : null}
          <SignupTable rows={result.rows} total={result.total} params={params} />
        </>
      ) : (
        <p role="alert" className={errorClass}>
          We could not load the signups. Please reload the page in a moment.
        </p>
      )}
    </div>
  );
}
