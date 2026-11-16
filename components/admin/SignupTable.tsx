import Link from "next/link";
import type { SignupListRow } from "@/lib/admin/signups";
import { PAGE_SIZE, listHref, type ListParams } from "@/lib/admin/list-params";
import { emailConsentLabel, formatDateTime, formatPhone, privacyConsentLabel } from "@/lib/admin/format";

const linkClass =
  "font-medium text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

type Props = { rows: SignupListRow[]; total: number; params: ListParams };

export default function SignupTable({ rows, total, params }: Props) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (params.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(params.page * PAGE_SIZE, total);
  const summary =
    total === 0 ? "No signups match." : `Showing ${first} to ${last} of ${total} signups.`;

  return (
    <div className="space-y-4">
      <p role="status">{summary}</p>

      {rows.length > 0 ? (
        // The table can scroll sideways on small screens. It can take keyboard
        // focus so keyboard users can scroll it with the arrow keys.
        <div
          className="overflow-x-auto rounded-3xl border-2 border-ink bg-white focus-visible:outline-2 focus-visible:outline-ink"
          tabIndex={0}
          role="region"
          aria-label="Signups table"
        >
          <table className="w-full min-w-[56rem] text-left text-sm">
            <caption className="sr-only">
              Signups. Select a name to open the full record. {summary}
            </caption>
            <thead className="bg-lime/30">
              <tr>
                {["Name", "Company", "Email", "Mobile", "Signed up", "Privacy consent", "Email consent"].map(
                  (heading) => (
                    <th key={heading} scope="col" className="px-3 py-3 font-semibold">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ink/30">
                  <th scope="row" className="px-3 py-2 font-normal">
                    <Link href={`/admin/signups/${row.id}`} className={`${linkClass} inline-flex min-h-11 items-center`}>
                      {row.full_name}
                    </Link>
                  </th>
                  <td className="px-3 py-2">{row.company_name}</td>
                  <td className="px-3 py-2 break-all">{row.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatPhone(row.mobile)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                  <td className="px-3 py-2">
                    {privacyConsentLabel(row.privacy_consent, row.privacy_withdrawn_at)}
                  </td>
                  <td className="px-3 py-2">
                    {emailConsentLabel(row.email_opt_in, row.email_withdrawn_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {pages > 1 ? (
        <nav aria-label="Pages" className="flex flex-wrap items-center gap-4">
          {params.page > 1 ? (
            <Link
              href={listHref(params, { page: params.page - 1 })}
              className={`${linkClass} inline-flex min-h-11 items-center`}
            >
              Previous page
            </Link>
          ) : null}
          <span>
            Page {Math.min(params.page, pages)} of {pages}
          </span>
          {params.page < pages ? (
            <Link
              href={listHref(params, { page: params.page + 1 })}
              className={`${linkClass} inline-flex min-h-11 items-center`}
            >
              Next page
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
