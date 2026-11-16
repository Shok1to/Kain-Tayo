import { describe, expect, it } from "vitest";
import { PRIVACY_ERROR, signupSchema, type SignupInput } from "./signup";

// Tests for the Brief, section 6 (validation) and section 10 (test checklist).
// Fake data only.

const emptyAddress = { streetNumber: "", streetName: "", city: "", province: "", postalCode: "", country: "Canada" };

function requiredOnly(): SignupInput {
  return {
    personal: { firstName: "Test", lastName: "Person", ...emptyAddress, phone: "", mobile: "416 555 0100", email: "test@example.com" },
    business: { companyName: "N/A", businessType: "Other", ...emptyAddress, phone: "", website: "", email: "" },
    consent: { privacyConsent: true, emailOptIn: false },
  };
}

function everyField(): SignupInput {
  return {
    personal: {
      firstName: "Zoë", lastName: "O'Test",
      streetNumber: "100", streetName: "Test Street", city: "Toronto", province: "Ontario", postalCode: "m5v 2t6", country: "Canada",
      phone: "(416) 555-0101", mobile: "+1 416 555 0100", email: "Test@Example.com",
    },
    business: {
      companyName: "Test Company", businessType: "Corporation",
      streetNumber: "200", streetName: "Test Avenue", city: "Ottawa", province: "Ontario", postalCode: "K1A0B1", country: "Canada",
      phone: "613-555-0102", website: "www.example.com", email: "office@example.com",
    },
    consent: { privacyConsent: true, emailOptIn: true },
  };
}

// The message for one field, or undefined when the field is fine.
function errorFor(input: SignupInput, path: string): string | undefined {
  const result = signupSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path.join(".") === path)?.message;
}

describe("a sign up with only the required fields", () => {
  it("is accepted, with Company Name N/A and Business Type Other", () => {
    const result = signupSchema.safeParse(requiredOnly());
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.business).toMatchObject({ companyName: "N/A", businessType: "Other" });
    expect(result.data.personal).not.toHaveProperty("middleName");
    expect(result.data.personal).not.toHaveProperty("email2");
    expect(result.data.consent.emailOptIn).toBe(false);
  });
});

describe("a sign up with every field filled", () => {
  it("is accepted and tidied the way the Brief says", () => {
    const result = signupSchema.safeParse(everyField());
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.personal).toMatchObject({
      firstName: "Zoë",
      lastName: "O'Test",
      email: "test@example.com",
      mobile: "+14165550100",
      phone: "+14165550101",
      postalCode: "M5V 2T6",
    });
    expect(result.data.business).toMatchObject({
      phone: "+16135550102",
      postalCode: "K1A 0B1",
      website: "https://www.example.com",
    });
  });
});

describe("each required field blocks the sign up when empty", () => {
  const cases: [string, (input: SignupInput) => void, string][] = [
    ["personal.firstName", (i) => (i.personal.firstName = ""), "Please enter your first name"],
    ["personal.lastName", (i) => (i.personal.lastName = ""), "Please enter your last name"],
    ["personal.mobile", (i) => (i.personal.mobile = ""), "Please enter a 10 digit phone number, for example 416 555 0100"],
    ["personal.email", (i) => (i.personal.email = ""), "Please enter a valid email address, for example name@example.com"],
    ["personal.country", (i) => (i.personal.country = ""), "Please enter a country"],
    ["business.companyName", (i) => (i.business.companyName = ""), "Please enter your company name, or N/A if you have none"],
    ["business.businessType", (i) => ((i.business as { businessType: string }).businessType = ""), "Please choose a type of business"],
    ["consent.privacyConsent", (i) => (i.consent.privacyConsent = false), PRIVACY_ERROR],
  ];

  for (const [path, makeEmpty, message] of cases) {
    it(`${path} shows a plain message`, () => {
      const input = requiredOnly();
      makeEmpty(input);
      expect(errorFor(input, path)).toBe(message);
    });
  }
});

describe("bad values are refused", () => {
  it("refuses bad email addresses", () => {
    for (const email of ["test", "test@", "@example.com", "test @example.com"]) {
      const input = requiredOnly();
      input.personal.email = email;
      expect(errorFor(input, "personal.email"), email).toBeDefined();
    }
  });

  it("refuses an email longer than 254 characters", () => {
    const input = requiredOnly();
    input.personal.email = `${"a".repeat(250)}@example.com`;
    expect(errorFor(input, "personal.email")).toBe("That email address is too long");
  });

  it("refuses phone numbers that are not 10 digits", () => {
    for (const mobile of ["416 555 010", "416 555 01000", "phone", "2 416 555 0100"]) {
      const input = requiredOnly();
      input.personal.mobile = mobile;
      expect(errorFor(input, "personal.mobile"), mobile).toBeDefined();
    }
  });

  it("refuses postal codes that are not Canadian", () => {
    for (const postalCode of ["12345", "M5V", "5MV 2T6", "M5V-2T6X"]) {
      const input = requiredOnly();
      input.personal.postalCode = postalCode;
      expect(errorFor(input, "personal.postalCode"), postalCode).toBe("Please enter a postal code like A1A 1A1");
    }
  });

  it("refuses a province that is not one of the 13", () => {
    const input = requiredOnly();
    input.personal.province = "Atlantis";
    expect(errorFor(input, "personal.province")).toBe("Please choose a province or territory from the list");
  });

  it("refuses names with numbers or symbols, and names over 50 characters", () => {
    const input = requiredOnly();
    input.personal.firstName = "Test1";
    expect(errorFor(input, "personal.firstName")).toBe("Please use letters, spaces, hyphens and apostrophes only");
    input.personal.firstName = "T".repeat(51);
    expect(errorFor(input, "personal.firstName")).toBe("Please use 50 characters or fewer");
  });

  it("refuses a business type that is not one of the four", () => {
    const input = requiredOnly();
    (input.business as { businessType: string }).businessType = "Charity";
    expect(errorFor(input, "business.businessType")).toBe("Please choose a type of business");
  });

  it("refuses a website that is not a real address", () => {
    const input = requiredOnly();
    input.business.website = "not a site";
    expect(errorFor(input, "business.website")).toBe("Please enter a valid website address, for example www.example.com");
  });
});

describe("consent", () => {
  it("never needs the email box: unticked is accepted and saved as no", () => {
    const result = signupSchema.safeParse(requiredOnly());
    expect(result.success && result.data.consent.emailOptIn).toBe(false);
  });

  it("refuses a privacy box sent as anything other than true", () => {
    const input = requiredOnly();
    (input.consent as { privacyConsent: unknown }).privacyConsent = "true";
    expect(signupSchema.safeParse(input).success).toBe(false);
  });
});

describe("the Address box", () => {
  it("takes a full address of up to 100 characters", () => {
    const input = requiredOnly();
    input.personal.streetNumber = "1".repeat(100);
    expect(signupSchema.safeParse(input).success).toBe(true);
  });

  it("refuses more than 100 characters, in plain words", () => {
    const input = requiredOnly();
    input.personal.streetNumber = "1".repeat(101);
    const result = signupSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("Please use 100 characters or fewer");
  });
});
