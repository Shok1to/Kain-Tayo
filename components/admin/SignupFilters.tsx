import Link from "next/link";
import { BUSINESS_TYPES, PROVINCES } from "@/lib/validation/signup";
import type { ListParams } from "@/lib/admin/list-params";
import { inputClass } from "./styles";

// Search and filters for the admin list. A plain GET form: the choices go in
// the address bar, so the page can be reloaded or bookmarked.
export default function SignupFilters({ params }: { params: ListParams }) {
  return (
    <form method="get" action="/admin" role="search" aria-label="Search and filter signups">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="filter-q" className="font-medium">
            Search name, email or company
          </label>
          <input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={params.q}
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="filter-province" className="font-medium">
            Province or territory
          </label>
          <select id="filter-province" name="province" defaultValue={params.province} className={inputClass}>
            <option value="">Any</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-type" className="font-medium">
            Type of business
          </label>
          <select id="filter-type" name="businessType" defaultValue={params.businessType} className={inputClass}>
            <option value="">Any</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-email" className="font-medium">
            Email consent
          </label>
          <select id="filter-email" name="emailConsent" defaultValue={params.emailConsent} className={inputClass}>
            <option value="">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No or withdrawn</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-from" className="font-medium">
            Signed up from
          </label>
          <input id="filter-from" name="from" type="date" defaultValue={params.from} className={inputClass} />
        </div>

        <div>
          <label htmlFor="filter-to" className="font-medium">
            Signed up to
          </label>
          <input id="filter-to" name="to" type="date" defaultValue={params.to} className={inputClass} />
        </div>

        <div>
          <label htmlFor="filter-sort" className="font-medium">
            Sort by date
          </label>
          <select id="filter-sort" name="sort" defaultValue={params.sort} className={inputClass}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="min-h-11 rounded-full bg-ink px-6 py-2 font-semibold text-lime hover:bg-ink/85 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
        >
          Apply
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center font-medium text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Clear all
        </Link>
      </div>
    </form>
  );
}
