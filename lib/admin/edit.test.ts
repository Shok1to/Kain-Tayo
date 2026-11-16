import { describe, expect, it } from "vitest";
import { PERSONAL_FIELDS, fieldErrors, personalSchema, personalToRow, readFields } from "./edit";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const valid = {
  firstName: "Test",
  lastName: "Person",
  streetNumber: "",
  streetName: "",
  city: "",
  province: "Ontario",
  postalCode: "m5v 2t6",
  country: "Canada",
  phone: "",
  mobile: "416 555 0100",
  email: "TEST@example.com",
};

describe("admin edit helpers", () => {
  it("reads only the expected boxes from a form", () => {
    const values = readFields(form({ firstName: "Test", role: "owner" }), PERSONAL_FIELDS);
    expect(values.firstName).toBe("Test");
    expect(values.lastName).toBe("");
    expect(values).not.toHaveProperty("role");
  });

  it("uses the public form rules and gives a plain message per box", () => {
    const parsed = personalSchema.safeParse({ ...valid, email: "not an email", mobile: "123" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = fieldErrors(parsed.error);
    expect(errors.email).toBe("Please enter a valid email address, for example name@example.com");
    expect(errors.mobile).toMatch(/10 digit phone number/);
  });

  it("tidies values the same way as signup, and saves empty boxes as not given", () => {
    const parsed = personalSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const row = personalToRow(parsed.data);
    expect(row).toMatchObject({
      first_name: "Test",
      mobile: "+14165550100",
      email: "test@example.com",
      postal_code: "M5V 2T6",
      phone: null,
    });
    expect(row).not.toHaveProperty("middle_name");
    expect(row).not.toHaveProperty("email_2");
  });
});
