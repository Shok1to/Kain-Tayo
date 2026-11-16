import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SignupInput } from "@/lib/validation/signup";

// Fake stand ins, so no test ever reaches the real database or Cloudflare.
const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  rpc: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}));
vi.mock("@/lib/email/send-confirmation", () => ({
  sendConfirmationEmail: mocks.sendEmail,
}));

import { submitSignup } from "./signup";

// Fake data only.
const validInput: SignupInput = {
  personal: {
    firstName: "Test",
    lastName: "Person",
    streetNumber: "",
    streetName: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    phone: "",
    mobile: "416 555 0100",
    email: "test@example.com",
  },
  business: {
    companyName: "N/A",
    businessType: "Other",
    streetNumber: "",
    streetName: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    phone: "",
    website: "",
    email: "",
  },
  consent: { privacyConsent: true, emailOptIn: false },
};

// What Cloudflare answers. Changed per test.
function cloudflareSays(body: object) {
  // A fresh answer each time, because an answer can only be read once.
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(body)));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Each test uses its own address, so the rate limit counts never mix.
let addressCounter = 0;
function newVisitor() {
  addressCounter += 1;
  mocks.headers.mockResolvedValue(
    new Headers({ "x-forwarded-for": `198.51.100.${addressCounter}`, referer: "http://localhost:3000/signup" })
  );
}

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  mocks.rpc.mockReset().mockResolvedValue({ error: null });
  mocks.sendEmail.mockReset().mockResolvedValue(true);
  newVisitor();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("submitSignup spam protection", () => {
  it("saves a normal sign up when the Turnstile token is good", async () => {
    const fetchMock = cloudflareSays({ success: true, action: "signup" });
    const result = await submitSignup(validInput, { honeypot: "", turnstileToken: "good" });
    expect(result).toEqual({ ok: true, emailSent: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("pretends success but saves nothing when the honeypot is filled", async () => {
    const fetchMock = cloudflareSays({ success: true, action: "signup" });
    const result = await submitSignup(validInput, { honeypot: "bot text", turnstileToken: "good" });
    expect(result).toEqual({ ok: true, emailSent: true });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a bad Turnstile token and saves nothing", async () => {
    cloudflareSays({ success: false, "error-codes": ["invalid-input-response"] });
    const result = await submitSignup(validInput, { turnstileToken: "bad" });
    expect(result).toEqual({ ok: false, reason: "verification" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("refuses a token made for a different action", async () => {
    cloudflareSays({ success: true, action: "something-else" });
    const result = await submitSignup(validInput, { turnstileToken: "good" });
    expect(result).toEqual({ ok: false, reason: "verification" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("refuses a missing token without asking Cloudflare", async () => {
    const fetchMock = cloudflareSays({ success: true, action: "signup" });
    const result = await submitSignup(validInput, {});
    expect(result).toEqual({ ok: false, reason: "verification" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses when Cloudflare cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitSignup(validInput, { turnstileToken: "good" });
    expect(result).toEqual({ ok: false, reason: "verification" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("stops the 6th try from the same address within 10 minutes", async () => {
    cloudflareSays({ success: true, action: "signup" });
    for (let i = 0; i < 5; i++) {
      const result = await submitSignup(validInput, { turnstileToken: "good" });
      expect(result).toEqual({ ok: true, emailSent: true });
    }
    const sixth = await submitSignup(validInput, { turnstileToken: "good" });
    expect(sixth).toEqual({ ok: false, reason: "rate_limited" });
    expect(mocks.rpc).toHaveBeenCalledTimes(5);
  });
});

describe("submitSignup confirmation email", () => {
  beforeEach(() => {
    cloudflareSays({ success: true, action: "signup" });
  });

  it("sends the email only after the signup is saved", async () => {
    const order: string[] = [];
    mocks.rpc.mockImplementation(async () => {
      order.push("save");
      return { error: null };
    });
    mocks.sendEmail.mockImplementation(async () => {
      order.push("email");
      return true;
    });

    await submitSignup(validInput, { turnstileToken: "good" });
    expect(order).toEqual(["save", "email"]);
    expect(mocks.sendEmail).toHaveBeenCalledWith({
      to: "test@example.com",
      firstName: "Test",
      emailOptIn: false,
    });
  });

  it("still counts the signup as saved when the email fails", async () => {
    mocks.sendEmail.mockResolvedValue(false);
    const result = await submitSignup(validInput, { turnstileToken: "good" });
    expect(result).toEqual({ ok: true, emailSent: false });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("sends no email when the save fails", async () => {
    mocks.rpc.mockResolvedValue({ error: { code: "XX000" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitSignup(validInput, { turnstileToken: "good" });
    expect(result).toEqual({ ok: false, reason: "error" });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("sends no email for a duplicate signup", async () => {
    mocks.rpc.mockResolvedValue({ error: { code: "23505" } });
    const result = await submitSignup(validInput, { turnstileToken: "good" });
    expect(result).toEqual({ ok: false, reason: "duplicate" });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("sends no email when the honeypot is filled", async () => {
    await submitSignup(validInput, { honeypot: "bot text", turnstileToken: "good" });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});

describe("submitSignup consent (checked on the server)", () => {
  beforeEach(() => {
    cloudflareSays({ success: true, action: "signup" });
  });

  it("refuses a sign up without privacy consent and saves nothing", async () => {
    const input = { ...validInput, consent: { privacyConsent: false, emailOptIn: true } };
    expect(await submitSignup(input, { turnstileToken: "good" })).toEqual({ ok: false, reason: "invalid" });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("saves a sign up with the email box unticked as email_opt_in no, with wording version and page", async () => {
    expect(await submitSignup(validInput, { turnstileToken: "good" })).toEqual({ ok: true, emailSent: true });
    expect(mocks.rpc).toHaveBeenCalledWith(
      "create_signup",
      expect.objectContaining({
        p_consent: {
          privacy_consent: true,
          email_opt_in: false,
          wording_version: expect.any(String),
          page_url: "http://localhost:3000/signup",
        },
      })
    );
  });

  it("saves a ticked email box as email_opt_in yes", async () => {
    const input = { ...validInput, consent: { privacyConsent: true, emailOptIn: true } };
    await submitSignup(input, { turnstileToken: "good" });
    expect(mocks.rpc.mock.calls[0][1].p_consent.email_opt_in).toBe(true);
  });

  it("refuses a duplicate primary email with its own reason, so the form can say so clearly", async () => {
    mocks.rpc.mockResolvedValue({ error: { code: "23505" } });
    expect(await submitSignup(validInput, { turnstileToken: "good" })).toEqual({ ok: false, reason: "duplicate" });
  });
});

describe("submitSignup security fixes", () => {
  it("refuses a token that names no action when real keys are used", async () => {
    cloudflareSays({ success: true });
    expect(await submitSignup(validInput, { turnstileToken: "good" })).toEqual({ ok: false, reason: "verification" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("accepts a token with no action only with Cloudflare's test secret key", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA");
    cloudflareSays({ success: true });
    expect(await submitSignup(validInput, { turnstileToken: "good" })).toEqual({ ok: true, emailSent: true });
  });

  it("saves the site's own form address as the consent page, not the browser's", async () => {
    vi.stubEnv("SITE_URL", "https://signup.example.com");
    mocks.headers.mockResolvedValue(
      new Headers({ "x-forwarded-for": "198.51.100.250", referer: "https://bad.example/fake" })
    );
    cloudflareSays({ success: true, action: "signup" });
    await submitSignup(validInput, { turnstileToken: "good" });
    expect(mocks.rpc.mock.calls[0][1].p_consent.page_url).toBe("https://signup.example.com/signup");
  });
});
