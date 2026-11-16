import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), exportSignups: vi.fn() }));

vi.mock("@/lib/auth/admin-guard", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/admin/signups", () => ({ exportSignups: mocks.exportSignups }));

import { POST } from "./route";

function post(fields: Record<string, string>, origin: string | null = "http://localhost:3000") {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  return new Request("http://localhost:3000/admin/export", {
    method: "POST",
    headers,
    body: new URLSearchParams(fields),
  });
}

beforeEach(() => {
  mocks.requireAdmin.mockReset().mockResolvedValue({ id: "admin-1", email: "admin@example.com" });
  mocks.exportSignups.mockReset();
});

describe("CSV download", () => {
  it("sends a CSV file that is never cached, using the filters from the form", async () => {
    mocks.exportSignups.mockResolvedValue({ ok: true, rows: [] });
    const response = await POST(post({ q: "Test", province: "Ontario" }));

    expect(mocks.exportSignups).toHaveBeenCalledWith(expect.objectContaining({ q: "Test", province: "Ontario" }));
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toMatch(/^attachment; filename="signups-\d{4}-\d{2}-\d{2}\.csv"$/);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toContain('"Name","Email"');
  });

  it("sends a plain message and no data when the export fails", async () => {
    mocks.exportSignups.mockResolvedValue({ ok: false });
    const response = await POST(post({}));
    expect(response.status).toBe(500);
    expect(await response.text()).toMatch(/could not create the file/);
  });

  it("does nothing for someone who is not a signed in admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("redirect to /admin/login"));
    await expect(POST(post({}))).rejects.toThrow();
    expect(mocks.exportSignups).not.toHaveBeenCalled();
  });

  it("refuses a download started from another website, before any check or record", async () => {
    for (const origin of ["https://bad.example", null]) {
      const response = await POST(post({}, origin));
      expect(response.status).toBe(403);
    }
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
    expect(mocks.exportSignups).not.toHaveBeenCalled();
  });
});
