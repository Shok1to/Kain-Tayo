import "server-only";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAGE_SIZE, type ListParams } from "./list-params";
import { nextDay, torontoDayStart } from "./format";
import { isUuid } from "./edit";

// Reads signups for the admin area. Every function here FIRST confirms the
// person is a signed in admin who passed MFA, and only then uses the secret
// key client. Results go only to admin pages rendered on the server.
// Errors are logged as a code only, never with personal data.

export type SignupListRow = {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  province: string | null;
  created_at: string;
  company_name: string | null;
  business_type: string | null;
  privacy_consent: boolean | null;
  privacy_withdrawn_at: string | null;
  email_opt_in: boolean | null;
  email_withdrawn_at: string | null;
};

export type SignupListResult =
  | { ok: true; rows: SignupListRow[]; total: number }
  | { ok: false };

const LIST_COLUMNS =
  "id, full_name, email, mobile, province, created_at, company_name, business_type, privacy_consent, privacy_withdrawn_at, email_opt_in, email_withdrawn_at";

// The search and filters, shared by the list and the CSV export so both
// always show exactly the same signups.
function listQuery(count: boolean) {
  return createAdminClient()
    .from("admin_signup_list")
    .select(LIST_COLUMNS, count ? { count: "exact" } : undefined);
}

function withFilters(query: ReturnType<typeof listQuery>, params: ListParams) {
  let q = query;
  if (params.q) {
    // cleanSearch has already removed commas, brackets and % signs.
    const pattern = `%${params.q}%`;
    q = q.or(`full_name.ilike.${pattern},email.ilike.${pattern},company_name.ilike.${pattern}`);
  }
  if (params.province) q = q.eq("province", params.province);
  if (params.businessType) q = q.eq("business_type", params.businessType);
  if (params.emailConsent) q = q.eq("email_consent_active", params.emailConsent === "yes");
  if (params.from) q = q.gte("created_at", torontoDayStart(params.from));
  if (params.to) q = q.lt("created_at", torontoDayStart(nextDay(params.to)));
  return q;
}

export async function listSignups(params: ListParams): Promise<SignupListResult> {
  await requireAdmin();
  const query = withFilters(listQuery(true), params);

  const start = (params.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("created_at", { ascending: params.sort === "oldest" })
    .order("id")
    .range(start, start + PAGE_SIZE - 1);

  if (error) {
    console.error("Admin list failed, code:", error.code);
    return { ok: false };
  }
  return { ok: true, rows: (data ?? []) as SignupListRow[], total: count ?? 0 };
}

// The database sends at most 1000 rows per request, so the export reads in batches.
const EXPORT_BATCH = 1000;
// A safety limit, far above what this site expects.
const EXPORT_MAX = 50000;

export type ExportResult = { ok: true; rows: SignupListRow[] } | { ok: false };

// Every signup that matches the current search and filters, for the CSV file.
// Writes an "export_csv" entry to the admin record BEFORE reading any data;
// if that entry cannot be written, nothing is exported.
export async function exportSignups(params: ListParams): Promise<ExportResult> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error: logError } = await supabase
    .from("admin_actions")
    .insert({ admin_id: admin.id, action: "export_csv", record_id: null });
  if (logError) {
    console.error("Admin export record failed, code:", logError.code);
    return { ok: false };
  }

  const rows: SignupListRow[] = [];
  for (let start = 0; start < EXPORT_MAX; start += EXPORT_BATCH) {
    const { data, error } = await withFilters(listQuery(false), params)
      .order("created_at", { ascending: params.sort === "oldest" })
      .order("id")
      .range(start, start + EXPORT_BATCH - 1);

    if (error) {
      console.error("Admin export failed, code:", error.code);
      return { ok: false };
    }
    const batch = (data ?? []) as SignupListRow[];
    rows.push(...batch);
    if (batch.length < EXPORT_BATCH) break;
  }
  return { ok: true, rows };
}

export type SignupDetail = {
  id: string;
  first_name: string;
  last_name: string;
  street_number: string | null;
  street_name: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  mobile: string;
  email: string;
  created_at: string;
  updated_at: string;
  businesses: {
    id: string;
    company_name: string;
    business_type: string;
    street_number: string | null;
    street_name: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string;
    phone: string | null;
    website: string | null;
    email: string | null;
  }[];
  consents: {
    id: string;
    privacy_consent: boolean;
    email_opt_in: boolean;
    consented_at: string;
    wording_version: string;
    page_url: string;
    privacy_withdrawn_at: string | null;
    email_withdrawn_at: string | null;
  }[];
};

export type SignupDetailResult = { ok: true; signup: SignupDetail | null } | { ok: false };

export async function getSignup(id: string): Promise<SignupDetailResult> {
  await requireAdmin();
  if (!isUuid(id)) return { ok: true, signup: null };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicants")
    .select("*, businesses(*), consents(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Admin detail failed, code:", error.code);
    return { ok: false };
  }
  return { ok: true, signup: (data as SignupDetail | null) ?? null };
}
