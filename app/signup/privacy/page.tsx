import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_DETAILS as d } from "@/lib/privacy-details";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${d.companyName} collects, uses and protects your information.`,
};

const linkClass =
  "font-medium text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="font-display text-3xl">
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-base leading-relaxed text-ink sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p>
          <Link href="/signup" className={`${linkClass} inline-flex min-h-11 items-center`}>
            Back to the sign up form
          </Link>
        </p>

        <h1 className="font-display mt-4 text-5xl leading-none sm:text-6xl">Privacy Policy</h1>
        <p className="mt-2 text-ink">Last updated: {d.lastUpdated}</p>
        <p className="mt-4">
          This policy explains how {d.companyName} collects, uses, stores and protects the
          information you give us when you sign up on this website.
        </p>

        <Section id="what-we-collect" title="What we collect">
          <p>When you fill in the sign up form, we collect:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>your first and last name</li>
            <li>your home address</li>
            <li>your phone and mobile numbers</li>
            <li>your email address</li>
            <li>your company name and type of business</li>
            <li>your business address, phone number, website and email</li>
          </ul>
          <p>
            We also keep a record of your consent: what you agreed to, the date and time, the
            version of the wording you saw, and the page where you signed up.
          </p>
        </Section>

        <Section id="why-we-collect" title="Why we collect it">
          <p>We use your information to {d.purpose}.</p>
          <p>
            If you ticked the optional email box, we will also send you emails about {d.emailTypes}.
            If you did not tick it, we will not send you these emails.
          </p>
        </Section>

        <Section id="who-we-share-with" title="Who we share it with">
          <p>
            We share your information only with {d.serviceProviders}, who may use it only to do
            that work for us. We do not sell your information.
          </p>
        </Section>

        <Section id="storage" title="Where we store it and for how long">
          <p>
            Your information is stored in {d.storageLocation}. We keep it for {d.retentionPeriod}{" "}
            unless you ask us to delete it sooner.
          </p>
        </Section>

        <Section id="protection" title="How we protect it">
          <p>
            We protect your information with {d.safeguards}. Only people who need it to do their
            work can see it.
          </p>
        </Section>

        <Section id="your-rights" title="See, correct or delete your information">
          <p>
            You can ask to see the information we hold about you, to correct it, or to delete it.
            Email us at {d.privacyEmail}. We will answer within 30 days.
          </p>
        </Section>

        <Section id="withdraw-consent" title="Withdraw your consent">
          <p>You can withdraw your consent at any time.</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              To stop our emails, use the unsubscribe link in any email, or contact{" "}
              {d.privacyEmail}. We stop sending right away.
            </li>
            <li>
              Stopping our emails does not delete your signup. If you also want your information
              deleted, ask us at {d.privacyEmail}.
            </li>
          </ul>
        </Section>

        <Section id="breach" title="If there is a data breach">
          <p>
            If your information were lost or seen by someone without permission, it could be used
            for spam or fraud. We keep a record of every security breach. If a breach creates a
            real risk of serious harm to you, we will tell you and the Office of the Privacy
            Commissioner of Canada.
          </p>
        </Section>

        <Section id="children" title="Children">
          <p>
            This form is for adults. If you are under 13, please ask a parent or guardian to sign up
            for you.
          </p>
        </Section>

        <Section id="contact" title="Contact us">
          <p>Our privacy contact is {d.privacyContact}.</p>
          <address className="not-italic">
            {d.companyName}
            <br />
            {d.mailingAddress}
            <br />
            {d.phoneOrWebsite}
            <br />
            Email: {d.privacyEmail}
          </address>
          <p>
            If we cannot resolve a concern, you may contact the{" "}
            <a href="https://www.priv.gc.ca" className={linkClass}>
              Office of the Privacy Commissioner of Canada
            </a>
            .
          </p>
        </Section>

        <p className="mt-10">
          <Link href="/signup" className={`${linkClass} inline-flex min-h-11 items-center`}>
            Back to the sign up form
          </Link>
        </p>
      </div>
    </main>
  );
}
