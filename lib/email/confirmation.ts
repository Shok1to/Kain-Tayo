import { PRIVACY_DETAILS as d } from "@/lib/privacy-details";

// The wording of the confirmation email, in one place so it is easy to change.
// Based on the Developer Brief, Appendix A, "Confirmation email".
// This is a transaction message: no marketing, and no copy of the form answers.
// The [bracket] details come from lib/privacy-details.ts.
// Text here is read by the visitor, so do not use dashes or hyphens.

export type ConfirmationEmailInput = {
  firstName: string;
  emailOptIn: boolean;
  privacyUrl: string;
};

export type ConfirmationEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildConfirmationEmail({
  firstName,
  emailOptIn,
  privacyUrl,
}: ConfirmationEmailInput): ConfirmationEmail {
  const subject = `Your signup with ${d.companyName} is confirmed`;

  const lines = {
    greeting: `Hello ${firstName},`,
    thanks: `Thank you for signing up with ${d.companyName}. We have saved the information you submitted.`,
    choice: emailOptIn
      ? `Email updates: You agreed to receive emails from us about ${d.emailTypes}.`
      : "Email updates: You chose not to receive marketing emails.",
    rights: `To see, correct or delete your information, or to change these choices, contact ${d.privacyEmail}.`,
    privacy: "Read our Privacy Policy:",
    sender: `${d.companyName}, ${d.mailingAddress}, ${d.phoneOrWebsite}`,
  };

  const text = [
    lines.greeting,
    "",
    lines.thanks,
    "",
    lines.choice,
    "",
    lines.rights,
    "",
    `${lines.privacy} ${privacyUrl}`,
    "",
    lines.sender,
  ].join("\n");

  const e = escapeHtml;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#171717;background:#ffffff;">
    <p>${e(lines.greeting)}</p>
    <p>${e(lines.thanks)}</p>
    <p>${e(lines.choice)}</p>
    <p>${e(lines.rights)}</p>
    <p>${e(lines.privacy)} <a href="${e(privacyUrl)}" style="color:#1e40af;">${e(privacyUrl)}</a></p>
    <p style="color:#404040;">${e(lines.sender)}</p>
  </body>
</html>`;

  return { subject, text, html };
}
