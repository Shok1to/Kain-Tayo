"use client";

import { useState, type BaseSyntheticEvent } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  PROVINCES,
  BUSINESS_TYPES,
  type SignupInput,
  type SignupData,
} from "@/lib/validation/signup";
import { CONSENT_TEXT } from "@/lib/consent";
import { submitSignup } from "@/app/actions/signup";
import { HONEYPOT_FIELD } from "@/lib/spam/shared";
import { SelectField, TextField } from "./fields";
import TurnstileWidget from "./TurnstileWidget";

// Everything starts empty. Both consent boxes start unticked.
const defaultValues: SignupInput = {
  personal: {
    firstName: "",
    lastName: "",
    streetNumber: "",
    streetName: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    phone: "",
    mobile: "",
    email: "",
  },
  business: {
    companyName: "",
    // The drop down starts on its "Choose" line, which is an empty value.
    businessType: "" as unknown as SignupInput["business"]["businessType"],
    streetNumber: "",
    streetName: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    phone: "",
    website: "",
    email: "",
  },
  consent: {
    privacyConsent: false,
    emailOptIn: false,
  },
};

type AddressProps = {
  section: "personal" | "business";
  register: UseFormRegister<SignupInput>;
  errors: FieldErrors<SignupInput>;
};

// The address boxes are the same in both parts of the form.
// "Address" is saved in streetNumber and "Address line 2" in streetName.
function AddressFields({ section, register, errors }: AddressProps) {
  const e = errors[section];
  const autocomplete = section === "personal" ? "" : "section-business ";
  return (
    <>
      <TextField
        id={`${section}-streetNumber`}
        label="Address"
        autoComplete={`${autocomplete}address-line1`}
        registration={register(`${section}.streetNumber`)}
        error={e?.streetNumber?.message}
      />
      <TextField
        id={`${section}-streetName`}
        label="Address line 2 (optional)"
        autoComplete={`${autocomplete}address-line2`}
        registration={register(`${section}.streetName`)}
        error={e?.streetName?.message}
      />
      <TextField
        id={`${section}-city`}
        label="City"
        autoComplete={`${autocomplete}address-level2`}
        registration={register(`${section}.city`)}
        error={e?.city?.message}
      />
      <SelectField
        id={`${section}-province`}
        label="Province or territory"
        placeholder="Choose"
        options={PROVINCES}
        autoComplete={`${autocomplete}address-level1`}
        registration={register(`${section}.province`)}
        error={e?.province?.message}
      />
      <TextField
        id={`${section}-postalCode`}
        label="Postal code"
        hint="For example, A1A 1A1"
        autoComplete={`${autocomplete}postal-code`}
        registration={register(`${section}.postalCode`)}
        error={e?.postalCode?.message}
      />
      <TextField
        id={`${section}-country`}
        label="Country"
        autoComplete={`${autocomplete}country-name`}
        registration={register(`${section}.country`)}
        error={e?.country?.message}
      />
    </>
  );
}

// Reads the hidden honeypot box from the form that was just submitted.
function readHoneypot(event?: BaseSyntheticEvent): string | undefined {
  const form = event?.target;
  if (!(form instanceof HTMLFormElement)) return undefined;
  const value = new FormData(form).get(HONEYPOT_FIELD);
  return typeof value === "string" ? value : undefined;
}

const sectionClass ="rounded-3xl border-2 border-ink bg-white p-5 sm:p-6";
const legendClass = "font-display px-1 text-3xl text-ink";
const gridClass = "mt-4 grid gap-4 sm:grid-cols-2";

export default function SignupForm() {
  // After a successful signup: whether the confirmation email really went out.
  const [submitted, setSubmitted] = useState<{ emailSent: boolean } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput, unknown, SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues,
    mode: "onBlur",
  });

  // The browser has already checked the answers. Now send them to the server,
  // which checks them again and saves them.
  async function onValid(_data: SignupData, event?: BaseSyntheticEvent) {
    setProblem(null);
    if (!turnstileToken) {
      setProblem("Please wait for the security check above the Submit button to finish, then press Submit again.");
      return;
    }
    const result = await submitSignup(getValues(), {
      honeypot: readHoneypot(event),
      turnstileToken,
    });
    if (result.ok) {
      setSubmitted({ emailSent: result.emailSent });
      return;
    }
    // Each security token works only once, so get a fresh one for the next try.
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);

    if (result.reason === "verification") {
      setProblem("We could not complete the security check. Please wait a moment and press Submit again.");
    } else if (result.reason === "rate_limited") {
      setProblem("There have been too many tries from your connection. Please wait 10 minutes and try again.");
    } else if (result.reason === "duplicate") {
      setProblem(
        "We could not complete your sign up. If you have already signed up, you do not need to do it again."
      );
    } else if (result.reason === "invalid") {
      setProblem("Some of your answers need another look. Please check the form and try again.");
    } else {
      setProblem("Something went wrong on our side. Your answers were not saved. Please try again in a few minutes.");
    }
  }

  if (submitted) {
    return (
      <div role="status" className={sectionClass}>
        <h2 className="font-display text-4xl">Thank you for signing up</h2>
        <p className="mt-2 text-ink">
          We have received your information.
        </p>
        {submitted.emailSent ? (
          <p className="mt-2 text-ink">
            We have sent a confirmation email to the address you gave us.
          </p>
        ) : null}
      </div>
    );
  }

  const personal = errors.personal;
  const business = errors.business;
  const consent = errors.consent;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-6">
      <p className="text-sm text-ink">
        Fields marked <span className="font-semibold text-red-700">*</span> are required.
      </p>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>Personal information</legend>
        <div className={gridClass}>
          <TextField
            id="personal-firstName"
            label="First name"
            required
            autoComplete="given-name"
            registration={register("personal.firstName")}
            error={personal?.firstName?.message}
          />
          <TextField
            id="personal-lastName"
            label="Last name"
            required
            autoComplete="family-name"
            registration={register("personal.lastName")}
            error={personal?.lastName?.message}
          />
          <AddressFields section="personal" register={register} errors={errors} />
          <TextField
            id="personal-phone"
            label="Phone number"
            hint="Home or landline"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            registration={register("personal.phone")}
            error={personal?.phone?.message}
          />
          <TextField
            id="personal-mobile"
            label="Mobile number"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            registration={register("personal.mobile")}
            error={personal?.mobile?.message}
          />
          <TextField
            id="personal-email"
            label="Email address"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            registration={register("personal.email")}
            error={personal?.email?.message}
          />
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>Business information</legend>
        <div className={gridClass}>
          <TextField
            id="business-companyName"
            label="Company name"
            required
            hint="Enter N/A if there is no business registration"
            autoComplete="organization"
            registration={register("business.companyName")}
            error={business?.companyName?.message}
          />
          <SelectField
            id="business-businessType"
            label="Type of business"
            required
            hint="Choose Other if there is no business registration"
            placeholder="Choose"
            options={BUSINESS_TYPES}
            autoComplete="off"
            registration={register("business.businessType")}
            error={business?.businessType?.message}
          />
          <AddressFields section="business" register={register} errors={errors} />
          <TextField
            id="business-phone"
            label="Business phone"
            type="tel"
            inputMode="tel"
            autoComplete="section-business tel"
            registration={register("business.phone")}
            error={business?.phone?.message}
          />
          <TextField
            id="business-website"
            label="Website"
            type="url"
            inputMode="url"
            autoComplete="url"
            registration={register("business.website")}
            error={business?.website?.message}
          />
          <TextField
            id="business-email"
            label="Business email"
            type="email"
            inputMode="email"
            autoComplete="section-business email"
            registration={register("business.email")}
            error={business?.email?.message}
          />
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>Your consent</legend>

        <div className="mt-4 space-y-4">
          {/* Privacy consent: required. Starts unticked. */}
          <div>
            <div className="flex items-start gap-3">
              <input
                id="consent-privacy"
                type="checkbox"
                autoComplete="off"
                aria-required="true"
                aria-invalid={consent?.privacyConsent ? true : undefined}
                aria-describedby={consent?.privacyConsent ? "consent-privacy-error" : undefined}
                className="mt-1 size-6 shrink-0 accent-ink"
                {...register("consent.privacyConsent")}
              />
              <label htmlFor="consent-privacy" className="min-h-11 text-base text-ink">
                {CONSENT_TEXT.privacyBeforeLink}
                <a
                  href="/signup/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline"
                >
                  {CONSENT_TEXT.privacyLinkText}
                </a>
                {CONSENT_TEXT.privacyAfterLink}{" "}
                <span aria-hidden="true" className="text-red-700">
                  *
                </span>{" "}
                <span className="text-sm text-ink/75">Required</span>
              </label>
            </div>
            {consent?.privacyConsent ? (
              <p
                id="consent-privacy-error"
                role="alert"
                className="mt-1 text-sm font-medium text-red-700"
              >
                {consent.privacyConsent.message}
              </p>
            ) : null}
          </div>

          {/* Email consent: optional. Starts unticked. Same size and contrast as the box above. */}
          <div>
            <div className="flex items-start gap-3">
              <input
                id="consent-email"
                type="checkbox"
                autoComplete="off"
                aria-describedby="consent-sender-line"
                className="mt-1 size-6 shrink-0 accent-ink"
                {...register("consent.emailOptIn")}
              />
              <label htmlFor="consent-email" className="min-h-11 text-base text-ink">
                {CONSENT_TEXT.emailLabel}{" "}
                <span className="text-sm text-ink/75">Optional</span>
              </label>
            </div>
            <p id="consent-sender-line" className="mt-2 pl-9 text-base text-ink">
              {CONSENT_TEXT.senderLine}
              {CONSENT_TEXT.howWeUseBeforeLink}
              <a
                href="/signup/how-we-use-your-information"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline"
              >
                {CONSENT_TEXT.howWeUseLinkText}
              </a>
              {CONSENT_TEXT.howWeUseAfterLink}
            </p>
          </div>
        </div>
      </fieldset>

      {/* Honeypot: hidden from sight, from screen readers and from the keyboard.
          Only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this box empty</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileResetKey} />

      {problem && (
        <p role="alert" className="rounded-2xl border border-red-700 bg-red-50 p-4 text-base text-red-800">
          {problem}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full rounded-full border-2 border-ink bg-lime px-6 py-3 text-base font-bold text-ink hover:bg-ink hover:text-lime focus:outline-2 focus:outline-offset-2 focus:outline-ink disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
