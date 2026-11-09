// Turns the values from date and time boxes into the friendly wording the
// site shows, like "Saturday, Nov 14", "2 PM" and "Wednesday, Nov 11 at 8 PM".
// Written by hand (not with toLocaleDateString) so the output is always the
// same in every browser and never contains a dash.

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-11-14" becomes "Saturday, Nov 14"
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  // UTC on purpose, so the time zone of the computer can never shift the day.
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[weekday]}, ${MONTHS[m - 1]} ${d}`;
}

// "14:00" becomes "2 PM" and "14:30" becomes "2:30 PM"
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

// "2026-11-11T20:00" becomes "Wednesday, Nov 11 at 8 PM"
export function formatCutoff(dateTime: string): string {
  const [date, time] = dateTime.split("T");
  return `${formatDay(date)} at ${formatTime(time)}`;
}

// 48 hours before a pickup, as text. For a pickup on "Saturday, Nov 14" with
// the slot "2 PM to 4 PM" this gives "Nov 12 at 2 PM". Returns null if the
// text cannot be read. Only the month and day are shown, so the year does
// not matter.
export function advanceReleaseTime(
  pickupDate: string,
  pickupSlot: string,
): string | null {
  const day = pickupDate.match(/([A-Za-z]{3}) (\d{1,2})$/);
  const slot = pickupSlot.match(/^(\d{1,2})(?::(\d{2}))? (AM|PM)/);
  if (!day || !slot) return null;
  const month = MONTHS.indexOf(day[1]);
  if (month < 0) return null;

  let hour = Number(slot[1]) % 12;
  if (slot[3] === "PM") hour += 12;
  const minute = Number(slot[2] ?? 0);

  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  const when = new Date(
    Date.UTC(2028, month, Number(day[2]), hour, minute) - FORTY_EIGHT_HOURS,
  );
  const hh = String(when.getUTCHours()).padStart(2, "0");
  const mm = String(when.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS[when.getUTCMonth()]} ${when.getUTCDate()} at ${formatTime(`${hh}:${mm}`)}`;
}
