import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedirectError } from "@/lib/auth/test-helpers";

const mocks = vi.hoisted(() => ({
  order: [] as string[],
  requireAdmin: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/navigation", async () => ({
  redirect: (await import("@/lib/auth/test-helpers")).fakeRedirect,
}));
vi.mock("@/lib/auth/admin-guard", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => {
    mocks.order.push("secret key client");
    return { rpc: mocks.rpc };
  },
}));

import { deleteApplicant, updateApplicant, updateBusiness, withdrawConsent } from "./actions";

const ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const person = {
  id: ID,
  firstName: "Test",
  lastName: "Person",
  country: "Canada",
  mobile: "416 555 0100",
  email: "test@example.com",
};

beforeEach(() => {
  mocks.order.length = 0;
  mocks.requireAdmin.mockReset().mockImplementation(async () => {
    mocks.order.push("admin check");
    return { id: "admin-1", email: "admin@example.com" };
  });
  mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
});

async function redirectOf(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(RedirectError);
  return (error as RedirectError).to;
}

describe("edit a person", () => {
  it("checks the admin first, then saves with the admin id and returns to the record", async () => {
    expect(await redirectOf(updateApplicant({}, form(person)))).toBe(`/admin/signups/${ID}?done=personal`);
    expect(mocks.order).toEqual(["admin check", "secret key client"]);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_update_applicant", {
      p_admin: "admin-1",
      p_id: ID,
      p_data: expect.objectContaining({ first_name: "Test", mobile: "+14165550100" }),
    });
  });

  it("never reaches the database when the admin check fails", async () => {
    mocks.requireAdmin.mockRejectedValue(new RedirectError("/admin/login"));
    await expect(updateApplicant({}, form(person))).rejects.toThrow();
    expect(mocks.order).not.toContain("secret key client");
  });

  it("shows plain messages for bad values and saves nothing", async () => {
    const state = await updateApplicant({}, form({ ...person, email: "nope", lastName: "" }));
    expect(state.error).toBe("Please check the boxes marked below.");
    expect(state.fieldErrors?.email).toMatch(/valid email address/);
    expect(state.fieldErrors?.lastName).toBe("Please enter your last name");
    expect(state.values?.email).toBe("nope");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("explains when the email belongs to another signup, without logging it", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "23505", message: "test@example.com" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await updateApplicant({}, form(person));
    expect(state.fieldErrors?.email).toBe("Another signup already uses this email address.");
    expect(JSON.stringify(log.mock.calls)).not.toContain("example.com");
    log.mockRestore();
  });

  it("refuses an id that is not real", async () => {
    const state = await updateApplicant({}, form({ ...person, id: "abc" }));
    expect(state.error).toMatch(/no longer exists/);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("edit a business", () => {
  it("saves the business for this person only", async () => {
    const data = form({ id: ID, businessId: BUSINESS_ID, companyName: "Test Company", businessType: "Other", country: "Canada" });
    expect(await redirectOf(updateBusiness({}, data))).toBe(`/admin/signups/${ID}?done=business`);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_update_business", {
      p_admin: "admin-1",
      p_applicant: ID,
      p_id: BUSINESS_ID,
      p_data: expect.objectContaining({ company_name: "Test Company", business_type: "Other" }),
    });
  });

  it("refuses a business type that is not on the list", async () => {
    const data = form({ id: ID, businessId: BUSINESS_ID, companyName: "Test Company", businessType: "Pirate", country: "Canada" });
    const state = await updateBusiness({}, data);
    expect(state.fieldErrors?.businessType).toBe("Please choose a type of business");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("withdraw consent", () => {
  it("records an email withdrawal", async () => {
    expect(await redirectOf(withdrawConsent({}, form({ id: ID, kind: "email" })))).toBe(`/admin/signups/${ID}?done=email`);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_withdraw_consent", { p_admin: "admin-1", p_id: ID, p_kind: "email" });
  });

  it("refuses an unknown kind of consent", async () => {
    const state = await withdrawConsent({}, form({ id: ID, kind: "everything" }));
    expect(state.error).toBeDefined();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("delete a person", () => {
  it("checks the admin first, deletes, and returns to the list", async () => {
    expect(await redirectOf(deleteApplicant({}, form({ id: ID })))).toBe("/admin?done=deleted");
    expect(mocks.order).toEqual(["admin check", "secret key client"]);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_delete_applicant", { p_admin: "admin-1", p_id: ID });
  });

  it("says so when the record is already gone", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    const state = await deleteApplicant({}, form({ id: ID }));
    expect(state.error).toMatch(/no longer exists/);
  });
});
