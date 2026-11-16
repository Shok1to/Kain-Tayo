import type { z } from "zod";
import { signupSchema } from "@/lib/validation/signup";

// Helpers for the admin edit forms. The rules are the SAME ones the public
// form uses (lib/validation/signup.ts); nothing is checked differently here.

export const personalSchema = signupSchema.shape.personal;
export const businessSchema = signupSchema.shape.business;

export const PERSONAL_FIELDS = [
  "firstName", "lastName",
  "streetNumber", "streetName", "city", "province", "postalCode", "country",
  "phone", "mobile", "email",
] as const;

export const BUSINESS_FIELDS = [
  "companyName", "businessType",
  "streetNumber", "streetName", "city", "province", "postalCode", "country",
  "phone", "website", "email",
] as const;

export type FormValues = Record<string, string>;

// What an edit form shows after the server has checked it.
export type EditState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: FormValues;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

// Reads only the expected boxes from a submitted form, as plain text.
export function readFields(formData: FormData, fields: readonly string[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

// The first error message for each box, keyed by the box name.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

// Empty optional boxes are saved as "not given" (null), so an admin can clear them.
const orNull = (value: string | undefined) => value ?? null;

export function personalToRow(p: z.output<typeof personalSchema>) {
  return {
    first_name: p.firstName,
    last_name: p.lastName,
    street_number: orNull(p.streetNumber),
    street_name: orNull(p.streetName),
    city: orNull(p.city),
    province: orNull(p.province),
    postal_code: orNull(p.postalCode),
    country: p.country,
    phone: orNull(p.phone),
    mobile: p.mobile,
    email: p.email,
  };
}

export function businessToRow(b: z.output<typeof businessSchema>) {
  return {
    company_name: b.companyName,
    business_type: b.businessType,
    street_number: orNull(b.streetNumber),
    street_name: orNull(b.streetName),
    city: orNull(b.city),
    province: orNull(b.province),
    postal_code: orNull(b.postalCode),
    country: b.country,
    phone: orNull(b.phone),
    website: orNull(b.website),
    email: orNull(b.email),
  };
}
