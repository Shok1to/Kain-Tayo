import type { Metadata } from "next";
import SignupForm from "@/components/signup/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Tell us about you and your business with this short sign up form.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display mt-4 text-5xl leading-none sm:text-6xl">Sign up</h1>
        <p className="mt-2 text-ink">
          Tell us about you and your business. It takes about two minutes.
        </p>

        <div className="mt-6">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
