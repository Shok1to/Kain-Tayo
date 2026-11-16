import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { fakeSupabase } from "@/lib/auth/test-helpers";

const mocks = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/lib/supabase/server", () => ({ createSessionClient: async () => mocks.client }));

import { POST } from "./route";

describe("sign out", () => {
  it("ends the session, clears the inactivity cookie and opens the login page", async () => {
    const client = fakeSupabase({ userId: "user-1", isAdmin: true });
    mocks.client = client;

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/logout", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      })
    );

    expect(client.auth.signOut).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login");
    expect(response.headers.get("set-cookie")).toContain("admin_last_active=;");
  });

  it("ignores a sign out posted from another website", async () => {
    const client = fakeSupabase({ userId: "user-1", isAdmin: true });
    mocks.client = client;

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/logout", {
        method: "POST",
        headers: { origin: "https://bad.example" },
      })
    );

    expect(response.status).toBe(403);
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });
});
