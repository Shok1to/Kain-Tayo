// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEffect } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PRIVACY_ERROR } from "@/lib/validation/signup";

// The sign up form on its own, in a pretend browser (jsdom).
// The server action and Cloudflare are replaced with fakes; nothing is saved.
const mocks = vi.hoisted(() => ({ submitSignup: vi.fn() }));

vi.mock("@/app/actions/signup", () => ({ submitSignup: mocks.submitSignup }));
vi.mock("./TurnstileWidget", () => ({
  // Pretend the security check finished straight away.
  default: function FakeTurnstile({ onToken }: { onToken: (token: string) => void }) {
    useEffect(() => onToken("test-token"), [onToken]);
    return null;
  },
}));

import SignupForm from "./SignupForm";

beforeEach(() => {
  mocks.submitSignup.mockReset().mockResolvedValue({ ok: true, emailSent: true });
});
afterEach(cleanup);

const box = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement;
const privacyBox = () => box(/^I agree that/);
const emailBox = () => box(/^Yes, I would like to receive emails/);

function type(label: RegExp, value: string) {
  fireEvent.change(box(label), { target: { value } });
}

function fillRequired() {
  type(/^First name/, "Test");
  type(/^Last name/, "Person");
  type(/^Mobile number/, "416 555 0100");
  type(/^Email address/, "test@example.com");
  type(/^Company name/, "N/A");
  fireEvent.change(screen.getByLabelText(/^Type of business/), { target: { value: "Other" } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
}

describe("sign up form", () => {
  it("starts with both consent boxes unticked", () => {
    render(<SignupForm />);
    expect(privacyBox().checked).toBe(false);
    expect(emailBox().checked).toBe(false);
  });

  it("keeps the two consent boxes separate, with the sender line under the email box", () => {
    render(<SignupForm />);
    expect(privacyBox()).not.toBe(emailBox());
    expect(emailBox().getAttribute("aria-describedby")).toBe("consent-sender-line");
    expect(document.getElementById("consent-sender-line")?.textContent).toMatch(/withdraw your consent at any time/);
  });

  it("links how we use your information under the email box, in a new tab, without changing the box", () => {
    render(<SignupForm />);
    const line = document.getElementById("consent-sender-line");
    const link = line?.querySelector("a");
    expect(link?.textContent).toBe("how we use your information");
    expect(link?.getAttribute("href")).toBe("/signup/how-we-use-your-information");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toContain("noopener");
    expect(emailBox().checked).toBe(false);
  });

  it("marks required fields for screen readers", () => {
    render(<SignupForm />);
    for (const label of [/^First name/, /^Last name/, /^Mobile number/, /^Email address/, /^Company name/, /^I agree that/]) {
      expect(box(label).getAttribute("aria-required"), String(label)).toBe("true");
    }
    expect(screen.queryByLabelText(/^Middle name/)).toBeNull();
    expect(screen.queryByLabelText(/^Second email/)).toBeNull();
    expect(emailBox().getAttribute("aria-required")).toBeNull();
  });

  it("shows plain errors next to each empty required field and sends nothing", async () => {
    render(<SignupForm />);
    submit();

    expect(await screen.findByText("Please enter your first name")).toBeTruthy();
    const firstName = box(/^First name/);
    expect(firstName.getAttribute("aria-invalid")).toBe("true");
    expect(firstName.getAttribute("aria-describedby")).toContain("personal-firstName-error");
    expect(document.getElementById("personal-firstName-error")?.textContent).toBe("Please enter your first name");
    expect(screen.getByText(PRIVACY_ERROR)).toBeTruthy();
    expect(mocks.submitSignup).not.toHaveBeenCalled();
  });

  it("blocks a sign up without privacy consent and keeps what was typed", async () => {
    render(<SignupForm />);
    fillRequired();
    fireEvent.click(emailBox());
    submit();

    expect(await screen.findByText(PRIVACY_ERROR)).toBeTruthy();
    expect(privacyBox().getAttribute("aria-describedby")).toBe("consent-privacy-error");
    expect(mocks.submitSignup).not.toHaveBeenCalled();
    expect(box(/^First name/).value).toBe("Test");
    expect(box(/^Email address/).value).toBe("test@example.com");
    expect(emailBox().checked).toBe(true);
  });

  it("signs up with the email box unticked, and shows the thank you message", async () => {
    render(<SignupForm />);
    fillRequired();
    fireEvent.click(privacyBox());
    submit();

    expect(await screen.findByRole("status")).toBeTruthy();
    expect(screen.getByText("Thank you for signing up")).toBeTruthy();
    expect(screen.getByText(/We have sent a confirmation email/)).toBeTruthy();
    expect(mocks.submitSignup).toHaveBeenCalledOnce();
    const [input, security] = mocks.submitSignup.mock.calls[0];
    expect(input.consent).toEqual({ privacyConsent: true, emailOptIn: false });
    expect(security.turnstileToken).toBe("test-token");
  });

  it("shows a clear message for a duplicate email and keeps the answers", async () => {
    mocks.submitSignup.mockResolvedValue({ ok: false, reason: "duplicate" });
    render(<SignupForm />);
    fillRequired();
    fireEvent.click(privacyBox());
    submit();

    const alert = await screen.findByText(/If you have already signed up, you do not need to do it again/);
    expect(alert.getAttribute("role")).toBe("alert");
    await waitFor(() => expect(box(/^First name/).value).toBe("Test"));
  });
});
