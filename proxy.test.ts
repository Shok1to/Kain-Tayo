import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { IDLE_COOKIE, IDLE_LIMIT_MS } from "@/lib/auth/idle";

const mocks = vi.hoisted(() => ({
  claims: null as object | null,
  signOut: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getClaims: async () => ({ data: mocks.claims ? { claims: mocks.claims } : null }),
      signOut: mocks.signOut,
    },
  }),
}));

import { proxy } from "./proxy";

function request(path: string, lastActive?: number) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (lastActive !== undefined) req.cookies.set(IDLE_COOKIE, String(lastActive));
  return req;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
  mocks.claims = null;
  mocks.signOut.mockReset();
});

describe("admin proxy", () => {
  it("sends someone who is not signed in to the login page", async () => {
    const response = await proxy(request("/admin"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login");
  });

  it("lets someone who is not signed in see the login page", async () => {
    const response = await proxy(request("/admin/login"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("lets the sign out address through even when the login has ended", async () => {
    const response = await proxy(request("/admin/logout"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("signs out an admin after 30 minutes without activity", async () => {
    mocks.claims = { sub: "user-1" };
    const response = await proxy(request("/admin", Date.now() - IDLE_LIMIT_MS - 1000));
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?reason=timeout"
    );
  });

  it("lets an active admin through and updates the activity time", async () => {
    mocks.claims = { sub: "user-1" };
    const response = await proxy(request("/admin", Date.now() - 60_000));
    expect(response.headers.get("location")).toBeNull();
    expect(response.cookies.get(IDLE_COOKIE)?.value).toMatch(/^\d+$/);
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
