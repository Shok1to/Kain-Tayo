import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase } from "@/lib/auth/test-helpers";

const mocks = vi.hoisted(() => ({
  client: null as unknown,
  eq: vi.fn(),
  update: vi.fn(),
  headers: vi.fn(),
  cookieSet: vi.fn(),
}));

vi.mock("next/navigation", async () => ({
  redirect: (await import("@/lib/auth/test-helpers")).fakeRedirect,
}));
vi.mock("next/headers", () => ({
  headers: mocks.headers,
  cookies: async () => ({ set: mocks.cookieSet, delete: vi.fn() }),
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/lib/supabase/server",() => ({ createSessionClient: async () => mocks.client }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ update: mocks.update }) }),
}));

import { signIn, verifyMfa } from "./actions";

const NEUTRAL = "Email or password is incorrect.";

function loginForm(email: string, password = "test password") {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  return form;
}

function codeForm(code: string, factorId = "factor-1") {
  const form = new FormData();
  form.set("code", code);
  form.set("factorId", factorId);
  return form;
}

// Each test uses its own address and email, so the try limits never mix.
let counter = 0;
let email = "";
beforeEach(() => {
  counter += 1;
  email = `test${counter}@example.com`;
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": `192.0.2.${counter}` }));
  mocks.cookieSet.mockReset();
  mocks.eq.mockReset().mockResolvedValue({ error: null });
  mocks.update.mockReset().mockReturnValue({ eq: mocks.eq });
});

describe("admin sign in", () => {
  it("gives the neutral message for a wrong email or password", async () => {
    mocks.client = fakeSupabase({ signInError: true });
    await expect(signIn({ error: null }, loginForm(email))).resolves.toEqual({ error: NEUTRAL });
  });

  it("signs out and gives the same neutral message to someone not in admin_users", async () => {
    const client = fakeSupabase({ userId: "user-1", isAdmin: false });
    mocks.client = client;
    await expect(signIn({ error: null }, loginForm(email))).resolves.toEqual({ error: NEUTRAL });
    expect(client.auth.signOut).toHaveBeenCalledOnce();
  });

  it("sends an admin on to the MFA step", async () => {
    mocks.client = fakeSupabase({ userId: "user-1", isAdmin: true });
    await expect(signIn({ error: null }, loginForm(email))).rejects.toMatchObject({
      to: "/admin/mfa",
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "admin_last_active",
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });

  it("stops the 6th try within 15 minutes", async () => {
    const client = fakeSupabase({ signInError: true });
    mocks.client = client;
    for (let i = 0; i < 5; i++) await signIn({ error: null }, loginForm(email));
    const sixth = await signIn({ error: null }, loginForm(email));
    expect(sixth.error).toContain("Too many tries");
    expect(client.auth.signInWithPassword).toHaveBeenCalledTimes(5);
  });
});

describe("MFA code check", () => {
  const factors = [{ id: "factor-1", factor_type: "totp", status: "verified" }];

  it("asks for 6 digits when the code is the wrong shape", async () => {
    mocks.client = fakeSupabase({ userId: "user-1", isAdmin: true, factors });
    const result = await verifyMfa({ error: null }, codeForm("12ab"));
    expect(result.error).toContain("6 digit code");
  });

  it("refuses a code for a factor that is not this person's", async () => {
    const client = fakeSupabase({ userId: "user-1", isAdmin: true, factors });
    mocks.client = client;
    const result = await verifyMfa({ error: null }, codeForm("123456", "someone-else"));
    expect(result.error).toContain("did not work");
    expect(client.auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
  });

  it("refuses a wrong code", async () => {
    mocks.client = fakeSupabase({ userId: "user-2", isAdmin: true, factors, verifyError: true });
    const result = await verifyMfa({ error: null }, codeForm("123456"));
    expect(result.error).toContain("did not work");
  });

  it("lets the admin in after a correct code", async () => {
    mocks.client = fakeSupabase({ userId: "user-3", isAdmin: true, factors });
    await expect(verifyMfa({ error: null }, codeForm("123456"))).rejects.toMatchObject({
      to: "/admin",
    });
  });

  it("saves the last sign in time only after a correct code", async () => {
    mocks.client = fakeSupabase({ userId: "user-4", isAdmin: true, factors });
    await expect(verifyMfa({ error: null }, codeForm("123456"))).rejects.toMatchObject({
      to: "/admin",
    });
    expect(mocks.update).toHaveBeenCalledWith({ last_login_at: expect.any(String) });
    expect(mocks.eq).toHaveBeenCalledWith("id", "user-4");
  });

  it("does not save a sign in time after a wrong code", async () => {
    mocks.client = fakeSupabase({ userId: "user-5", isAdmin: true, factors, verifyError: true });
    await verifyMfa({ error: null }, codeForm("123456"));
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("still lets the admin in if saving the time fails", async () => {
    mocks.eq.mockResolvedValue({ error: { code: "42501" } });
    mocks.client = fakeSupabase({ userId: "user-6", isAdmin: true, factors });
    await expect(verifyMfa({ error: null }, codeForm("123456"))).rejects.toMatchObject({
      to: "/admin",
    });
  });

  it("sends someone who is not signed in back to the login page", async () => {
    mocks.client = fakeSupabase({ userId: null });
    await expect(verifyMfa({ error: null }, codeForm("123456"))).rejects.toMatchObject({
      to: "/admin/login",
    });
  });
});
