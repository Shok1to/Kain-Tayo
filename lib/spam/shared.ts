// Spam protection names used by both the form (browser) and the server.
// Nothing secret belongs in this file.

// The honeypot is a hidden form box that real people never see or reach.
// Bots tend to fill in every box, so any text in it means "probably a bot".
// A plain looking name, so bots are tempted to fill it in.
export const HONEYPOT_FIELD = "fax_number";

export function isHoneypotFilled(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim() !== "";
}

// The name the form gives the Turnstile check. The server makes sure it matches.
export const TURNSTILE_ACTION = "signup";
