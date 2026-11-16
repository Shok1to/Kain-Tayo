import { describe, expect, it } from "vitest";
import { buildConfirmationEmail } from "./confirmation";

const privacyUrl = "https://example.com/privacy";

describe("confirmation email wording", () => {
  it("says the person agreed to emails when they ticked the box", () => {
    const email = buildConfirmationEmail({ firstName: "Test", emailOptIn: true, privacyUrl });
    expect(email.text).toContain("You agreed to receive emails from us");
    expect(email.text).not.toContain("You chose not to");
  });

  it("says the person chose no marketing emails when they did not tick the box", () => {
    const email = buildConfirmationEmail({ firstName: "Test", emailOptIn: false, privacyUrl });
    expect(email.text).toContain("You chose not to receive marketing emails.");
    expect(email.text).not.toContain("You agreed");
  });

  it("links to the privacy policy and names the privacy contact and sender", () => {
    const email = buildConfirmationEmail({ firstName: "Test", emailOptIn: false, privacyUrl });
    expect(email.text).toContain(privacyUrl);
    expect(email.html).toContain(`href="${privacyUrl}"`);
    expect(email.text).toContain("[privacy email]");
    expect(email.text).toContain("[Company Name], [mailing address]");
  });

  it("makes the first name safe inside the HTML", () => {
    const email = buildConfirmationEmail({ firstName: "<b>Test</b>", emailOptIn: false, privacyUrl });
    expect(email.html).toContain("&lt;b&gt;Test&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Test</b>");
  });

  it("uses no dashes or hyphens in the text a visitor reads", () => {
    const email = buildConfirmationEmail({ firstName: "Test", emailOptIn: true, privacyUrl });
    const visible = `${email.subject}\n${email.text}`.replace(privacyUrl, "");
    expect(visible).not.toMatch(/[-–—]/);
  });
});
