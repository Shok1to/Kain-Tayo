import { requireAdmin } from "@/lib/auth/admin-guard";
import { exportSignups } from "@/lib/admin/signups";
import { parseListParams } from "@/lib/admin/list-params";
import { buildCsv } from "@/lib/admin/csv";
import { TIME_ZONE } from "@/lib/admin/format";
import { isSameOrigin } from "@/lib/security/same-origin";

// Downloads the signups that match the current search and filters as a CSV
// file. Only signed in admins who passed MFA can use it, and each download
// is written to the admin record (who, what, when).
// It answers only a form post (the Download button) sent from this site.
// Browsers and link previews never repeat or preview a post, and another
// website cannot start a download.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return plainText("This download must be started from the admin page.", 403);
  }
  await requireAdmin();

  const form = await request.formData();
  const raw: Record<string, string> = {};
  for (const [key, value] of form) if (typeof value === "string") raw[key] = value;
  const result = await exportSignups(parseListParams(raw));

  if (!result.ok) {
    return plainText("We could not create the file. Please go back and try again in a moment.", 500);
  }

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
  return new Response(buildCsv(result.rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="signups-${today}.csv"`,
      // Personal data: never keep a copy in any cache.
      "Cache-Control": "no-store",
    },
  });
}

function plainText(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
