import { describe, expect, it, vi } from "vitest";
import { fakeSupabase } from "./test-helpers";

const mocks = vi.hoisted(() => ({ client: null as unknown }));

vi.mock("next/navigation", async () => ({ redirect: (await import("./test-helpers")).fakeRedirect }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/lib/supabase/server",() => ({ createSessionClient: async () => mocks.client }));

import { requireAdmin } from "./admin-guard";

function useClient(client: ReturnType<typeof fakeSupabase>) {
  mocks.client = client;
  return client;
}

describe("requireAdmin (server check on every admin page)", () => {
  it("sends someone who is not signed in to the login page", async () => {
    useClient(fakeSupabase({ userId: null }));
    await expect(requireAdmin()).rejects.toMatchObject({ to: "/admin/login" });
  });

  it("signs out and refuses someone signed in who is not in admin_users", async () => {
    const client = useClient(fakeSupabase({ userId: "user-1", isAdmin: false }));
    await expect(requireAdmin()).rejects.toMatchObject({ to: "/admin/login" });
    expect(client.auth.signOut).toHaveBeenCalledOnce();
  });

  it("sends an admin who has not passed MFA to the MFA page", async () => {
    useClient(fakeSupabase({ userId: "user-1", isAdmin: true, aal: "aal1" }));
    await expect(requireAdmin()).rejects.toMatchObject({ to: "/admin/mfa" });
  });

  it("lets in an admin who has passed MFA", async () => {
    useClient(fakeSupabase({ userId: "user-1", isAdmin: true, aal: "aal2" }));
    await expect(requireAdmin()).resolves.toEqual({ id: "user-1", email: "test@example.com" });
  });
});
