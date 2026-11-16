import Link from "next/link";
import Logo from "@/components/Logo";

// A slim Kain Tayo bar above the sign up pages, so they feel like part of the
// marketplace. The strict security headers still apply to these pages.
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-ink text-cream">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label="Kain Tayo home" className="block">
            <Logo className="h-24 w-24 sm:h-28 sm:w-28" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-mono text-sm font-bold uppercase tracking-wider text-lime underline sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            Back to Kain Tayo
          </Link>
        </div>
      </header>
      {children}
    </>
  );
}
