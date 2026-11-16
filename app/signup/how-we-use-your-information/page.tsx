import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How we use your information",
  description: "A short summary of what we collect on the sign up form, why, and your choices.",
};

const linkClass =
  "font-medium text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default function HowWeUseYourInformationPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-base leading-relaxed text-ink sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p>
          <Link href="/signup" className={`${linkClass} inline-flex min-h-11 items-center`}>
            Back to the sign up form
          </Link>
        </p>

        <h1 className="font-display mt-4 text-5xl leading-none sm:text-6xl">How we use your information</h1>
        <div className="mt-4 space-y-3">
          <p>
            We collect the details you enter on this form: your name, address, phone numbers, email
            addresses, company name and type, and your business website and email.
          </p>
          <p>We use them to [purpose, in plain words].</p>
          <p>
            We share them only with [service providers, e.g. our website host and email service],
            who may use them only to do that work for us. We do not sell them.
          </p>
          <p>
            Your information is stored in [Canada / country] and kept for [retention period] unless
            you ask us to delete it sooner.
          </p>
          <p>
            If it were lost or accessed without permission, it could be used for spam or fraud. We
            protect it with [encryption and restricted access], and we will tell you if a breach
            creates a real risk of serious harm.
          </p>
          <p>
            You can ask to see, correct or delete your information, or withdraw any consent, at any
            time: [privacy email]. Our privacy contact is [name or title].
          </p>
          <p>
            This form is for adults. If you are under 13, please ask a parent or guardian to sign up
            for you.
          </p>
          <p>
            If we cannot resolve a concern, you may contact the{" "}
            <a href="https://www.priv.gc.ca" className={linkClass}>
              Office of the Privacy Commissioner of Canada
            </a>
            .
          </p>
          <p>
            For the full details, read our{" "}
            <Link href="/signup/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
