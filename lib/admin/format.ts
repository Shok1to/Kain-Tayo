// Small helpers to show saved values in a friendly way on admin pages.
// All dates are shown in Toronto time.

export const TIME_ZONE = "America/Toronto";

const dateTimeFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, dateStyle: "medium" });

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFormat.format(new Date(iso)) : "";
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormat.format(new Date(iso)) : "";
}

// +14165550100 becomes 416 555 0100.
export function formatPhone(value: string | null | undefined): string {
  const match = value?.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : (value ?? "");
}

export function privacyConsentLabel(given: boolean | null, withdrawnAt: string | null): string {
  if (withdrawnAt) return `Withdrawn ${formatDate(withdrawnAt)}`;
  return given ? "Given" : "Not recorded";
}

export function emailConsentLabel(optIn: boolean | null, withdrawnAt: string | null): string {
  if (withdrawnAt) return `Withdrawn ${formatDate(withdrawnAt)}`;
  return optIn ? "Yes" : "No";
}

// The time at which a calendar day starts in Toronto, as a UTC timestamp.
// For example 2026-11-15 starts at 2026-11-15T05:00:00.000Z.
export function torontoDayStart(day: string): string {
  const utcMidnight = new Date(`${day}T00:00:00Z`);
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(utcMidnight)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = offset?.match(/GMT([+-])(\d{2}):(\d{2})/);
  const minutes = match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
  return new Date(utcMidnight.getTime() - minutes * 60_000).toISOString();
}

// The day after, for an "up to and including" date filter.
export function nextDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
