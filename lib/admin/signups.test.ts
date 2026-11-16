import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseListParams } from "./list-params";

// A fake query builder that records every call, so tests can check which
// filters were sent. Nothing here reaches a real database.
function fakeQuery(result: { data: unknown; count?: number; error: unknown }) {
  const calls: [string, ...unknown[]][] = [];
  const builder: Record<string, unknown> = {};
  for (const name of ["select", "insert", "or", "eq", "gte", "lt", "order", "range", "maybeSingle"]) {
    builder[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return { builder, calls };
}

const mocks = vi.hoisted(() => ({
  order: [] as string[],
  requireAdmin: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/auth/admin-guard", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => {
    mocks.order.push("secret key client");
    return { from: mocks.from };
  },
}));

import { exportSignups, getSignup, listSignups } from "./signups";

const fakeRow = {
  id: "11111111-1111-4111-8111-111111111111",
  full_name: "Test Person",
  email: "test@example.com",
  mobile: "+14165550100",
};

beforeEach(() => {
  mocks.order.length = 0;
  mocks.requireAdmin.mockReset().mockImplementation(async () => {
    mocks.order.push("admin check");
    return { id: "admin-1", email: "admin@example.com" };
  });
});

describe("listSignups", () => {
  it("checks the admin before using the secret key", async () => {
    const { builder } = fakeQuery({ data: [fakeRow], count: 1, error: null });
    mocks.from.mockReturnValue(builder);
    await listSignups(parseListParams({}));
    expect(mocks.order).toEqual(["admin check", "secret key client"]);
  });

  it("never uses the secret key when the admin check fails", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("redirect to /admin/login"));
    await expect(listSignups(parseListParams({}))).rejects.toThrow();
    expect(mocks.order).not.toContain("secret key client");
  });

  it("sends search, filters, sort and page 2 to the database", async () => {
    const { builder, calls } = fakeQuery({ data: [fakeRow], count: 30, error: null });
    mocks.from.mockReturnValue(builder);

    const result = await listSignups(
      parseListParams({
        q: "Test",
        province: "Ontario",
        businessType: "Other",
        emailConsent: "no",
        from: "2026-11-01",
        to: "2026-11-15",
        sort: "oldest",
        page: "2",
      })
    );

    expect(result).toEqual({ ok: true, rows: [fakeRow], total: 30 });
    expect(mocks.from).toHaveBeenCalledWith("admin_signup_list");
    expect(calls).toContainEqual([
      "or",
      "full_name.ilike.%Test%,email.ilike.%Test%,company_name.ilike.%Test%",
    ]);
    expect(calls).toContainEqual(["eq", "province", "Ontario"]);
    expect(calls).toContainEqual(["eq", "business_type", "Other"]);
    expect(calls).toContainEqual(["eq", "email_consent_active", false]);
    expect(calls).toContainEqual(["gte", "created_at", "2026-11-01T04:00:00.000Z"]);
    expect(calls).toContainEqual(["lt", "created_at", "2026-11-16T05:00:00.000Z"]);
    expect(calls).toContainEqual(["order", "created_at", { ascending: true }]);
    expect(calls).toContainEqual(["range", 25, 49]);
  });

  it("logs only a code, never personal data, when the database fails", async () => {
    const { builder } = fakeQuery({ data: null, error: { code: "42501", message: "test@example.com" } });
    mocks.from.mockReturnValue(builder);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await listSignups(parseListParams({ q: "test@example.com" }))).toEqual({ ok: false });
    expect(JSON.stringify(log.mock.calls)).not.toContain("example.com");
    log.mockRestore();
  });
});

describe("getSignup", () => {
  it("returns nothing for an address that is not a real id, without asking the database", async () => {
    mocks.from.mockReset();
    expect(await getSignup("not-an-id")).toEqual({ ok: true, signup: null });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.order).toEqual(["admin check"]);
  });

  it("loads one signup with its businesses and consents", async () => {
    const { builder, calls } = fakeQuery({ data: { ...fakeRow, businesses: [], consents: [] }, error: null });
    mocks.from.mockReturnValue(builder);
    const result = await getSignup(fakeRow.id);
    expect(result).toMatchObject({ ok: true, signup: { email: "test@example.com" } });
    expect(calls).toContainEqual(["select", "*, businesses(*), consents(*)"]);
    expect(calls).toContainEqual(["eq", "id", fakeRow.id]);
  });
});

describe("exportSignups", () => {
  it("writes who exported BEFORE reading any signups, with no personal data", async () => {
    const tables: string[] = [];
    const log = fakeQuery({ data: null, error: null });
    const list = fakeQuery({ data: [fakeRow], error: null });
    mocks.from.mockReset().mockImplementation((table: string) => {
      tables.push(table);
      return table === "admin_actions" ? log.builder : list.builder;
    });

    const result = await exportSignups(parseListParams({ q: "Test" }));
    expect(result).toEqual({ ok: true, rows: [fakeRow] });
    expect(tables).toEqual(["admin_actions", "admin_signup_list"]);
    expect(log.calls).toEqual([["insert", { admin_id: "admin-1", action: "export_csv", record_id: null }]]);
    expect(list.calls).toContainEqual(["range", 0, 999]);
  });

  it("exports nothing when the record of the export cannot be written", async () => {
    const tables: string[] = [];
    mocks.from.mockReset().mockImplementation((table: string) => {
      tables.push(table);
      return fakeQuery({ data: null, error: { code: "42501" } }).builder;
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await exportSignups(parseListParams({}))).toEqual({ ok: false });
    expect(tables).toEqual(["admin_actions"]);
    vi.mocked(console.error).mockRestore();
  });

  it("never uses the secret key when the admin check fails", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("redirect to /admin/login"));
    await expect(exportSignups(parseListParams({}))).rejects.toThrow();
    expect(mocks.order).not.toContain("secret key client");
  });
});
