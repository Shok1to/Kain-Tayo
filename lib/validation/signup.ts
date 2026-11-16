import { z } from "zod";

// Every checking rule for the signup form lives in this one file.
// The browser uses it for quick feedback, and the server uses it again,
// because the server check is the one that counts.

export const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
] as const;

export const BUSINESS_TYPES = [
  "Sole Proprietor",
  "Partnership",
  "Corporation",
  "Other",
] as const;

export const PRIVACY_ERROR = "Please agree to the privacy notice to sign up";

// ---------- small building blocks ----------

// An optional field: empty text becomes "not given", anything else must pass the rules.
function optional<O>(rules: z.ZodType<O, string>) {
  return z
    .string()
    .optional()
    .transform((value) => (value && value.trim() !== "" ? value : undefined))
    .pipe(rules.optional());
}

// Names: letters, spaces, hyphens, apostrophes and accented characters, up to 50.
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} '’-]*$/u;

function nameRules(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Please enter your ${label}`)
    .max(50, `Please use 50 characters or fewer`)
    .refine(
      (value) => value === "" || namePattern.test(value),
      "Please use letters, spaces, hyphens and apostrophes only"
    );
}

// Phone numbers: accept spaces, dashes and brackets, then save as +1 and 10 digits.
function cleanPhone(value: string) {
  const digits = value.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  const tenDigits = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^\d{10}$/.test(tenDigits) ? `+1${tenDigits}` : value;
}

function phoneRules() {
  return z
    .string()
    .trim()
    .transform(cleanPhone)
    .pipe(
      z
        .string()
        .regex(/^\+1\d{10}$/, "Please enter a 10 digit phone number, for example 416 555 0100")
    );
}

// Email: saved in lower case, valid format, up to 254 characters.
function emailRules() {
  return z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email address is too long")
    .email("Please enter a valid email address, for example name@example.com");
}

// Postal code: letter digit letter, digit letter digit. Saved in capitals as A1A 1A1.
const postalPattern = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/;

function postalRules() {
  return z
    .string()
    .trim()
    .toUpperCase()
    .regex(postalPattern, "Please enter a postal code like A1A 1A1")
    .transform((value) => value.replace(/^(.{3}) ?(.{3})$/, "$1 $2"));
}

// Website: add https:// if missing, then check it looks like a real address.
function websiteRules() {
  return z
    .string()
    .trim()
    .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.hostname.includes(".") && !/\s/.test(value);
      } catch {
        return false;
      }
    }, "Please enter a valid website address, for example www.example.com");
}

// ---------- address (used for both the personal and the business address) ----------

function addressFields() {
  return {
    streetNumber: optional(z.string().trim().max(100, "Please use 100 characters or fewer")),
    streetName: optional(z.string().trim().max(100, "Please use 100 characters or fewer")),
    city: optional(z.string().trim().max(100, "Please use 100 characters or fewer")),
    province: optional(z.string().trim().max(100, "Please use 100 characters or fewer")),
    postalCode: optional(z.string().trim().max(20, "Please use 20 characters or fewer")),
    country: z.string().trim().min(1, "Please enter a country").max(100).default("Canada"),
  };
}

// When the country is Canada, the province must come from the list and the
// postal code must be a Canadian one. For other countries these checks relax.
function checkCanadianAddress(
  value: { country: string; province?: string; postalCode?: string },
  ctx: z.RefinementCtx
) {
  if (value.country.trim().toLowerCase() !== "canada") return;

  if (value.province && !(PROVINCES as readonly string[]).includes(value.province)) {
    ctx.addIssue({
      code: "custom",
      path: ["province"],
      message: "Please choose a province or territory from the list",
    });
  }
  if (value.postalCode) {
    const result = postalRules().safeParse(value.postalCode);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: result.error.issues[0].message,
      });
    }
  }
}

// After checking, tidy the postal code so it is always saved in capitals,
// and as A1A 1A1 when it has the Canadian shape.
function tidyAddress<T extends { postalCode?: string }>(value: T): T {
  if (!value.postalCode) return value;
  const upper = value.postalCode.trim().toUpperCase();
  const tidy = postalPattern.test(upper) ? upper.replace(/^(.{3}) ?(.{3})$/, "$1 $2") : upper;
  return { ...value, postalCode: tidy };
}

// ---------- the whole form ----------

export const signupSchema = z.object({
  personal: z
    .object({
      firstName: nameRules("first name"),
      lastName: nameRules("last name"),
      ...addressFields(),
      phone: optional(phoneRules()),
      mobile: phoneRules(),
      email: emailRules(),
    })
    .superRefine(checkCanadianAddress)
    .transform(tidyAddress),

  business: z
    .object({
      companyName: z
        .string()
        .trim()
        .min(1, "Please enter your company name, or N/A if you have none")
        .max(200, "Please use 200 characters or fewer"),
      businessType: z.enum(BUSINESS_TYPES, {
        message: "Please choose a type of business",
      }),
      ...addressFields(),
      phone: optional(phoneRules()),
      website: optional(websiteRules()),
      email: optional(emailRules()),
    })
    .superRefine(checkCanadianAddress)
    .transform(tidyAddress),

  consent: z.object({
    // Required. Starts unticked.
    privacyConsent: z.boolean().refine((value) => value === true, PRIVACY_ERROR),
    // Optional. Starts unticked. Never blocks a signup.
    emailOptIn: z.boolean(),
  }),
});

export type SignupInput = z.input<typeof signupSchema>;
export type SignupData = z.output<typeof signupSchema>;
