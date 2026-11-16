import { BUSINESS_TYPES, PROVINCES } from "@/lib/validation/signup";

// Reads the admin list's search, filters, sort and page from the address bar.
// Anything unexpected is ignored, so a strange address can never break the
// query or reach the database as raw text.

export const PAGE_SIZE = 25;

export type ListParams = {
  q: string;
  province: (typeof PROVINCES)[number] | "";
  businessType: (typeof BUSINESS_TYPES)[number] | "";
  emailConsent: "yes" | "no" | "";
  from: string;
  to: string;
  sort: "newest" | "oldest";
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | "" {
  return (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value: string): string {
  return datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ? value : "";
}

// Keep only letters, numbers, spaces and the few signs found in names,
// emails and company names. Characters with a special meaning in database
// filters, such as commas, brackets and % are removed.
export function cleanSearch(value: string): string {
  return value
    .replace(/[^\p{L}\p{M}\p{N} @.'’&-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export function parseListParams(raw: RawParams): ListParams {
  const page = Number.parseInt(first(raw.page), 10);
  return {
    q: cleanSearch(first(raw.q)),
    province: oneOf(first(raw.province), PROVINCES),
    businessType: oneOf(first(raw.businessType), BUSINESS_TYPES),
    emailConsent: oneOf(first(raw.emailConsent), ["yes", "no"] as const),
    from: validDate(first(raw.from)),
    to: validDate(first(raw.to)),
    sort: first(raw.sort) === "oldest" ? "oldest" : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Builds a list address with the same filters, for links like "Next page".
export function listHref(params: ListParams, changes: Partial<ListParams> = {}): string {
  const merged = { ...params, ...changes };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (key === "page" && value === 1) continue;
    if (key === "sort" && value === "newest") continue;
    if (value !== "" && value !== undefined) query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `/admin?${text}` : "/admin";
}

// The CSV download form: the same search and filters, without the page number.
export function exportFields(params: ListParams): [string, string][] {
  const query = listHref(params, { page: 1 }).split("?")[1] ?? "";
  return [...new URLSearchParams(query)];
}
