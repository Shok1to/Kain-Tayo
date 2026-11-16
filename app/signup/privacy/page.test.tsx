import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./page";

describe("Privacy policy page", () => {
  const html = renderToStaticMarkup(<PrivacyPage />);

  it("renders with exactly one main heading", () => {
    const headings = html.match(/<h1[\s>]/g) ?? [];
    expect(headings).toHaveLength(1);
    expect(html).toContain("Privacy Policy</h1>");
  });

  it("links back to the sign up form", () => {
    expect(html).toContain('href="/signup"');
    expect(html).toContain("Back to the sign up form");
  });
});
