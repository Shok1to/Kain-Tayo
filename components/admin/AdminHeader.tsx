import Link from "next/link";
import SignOutButton from "./SignOutButton";

// The top bar on signed in admin pages.
export default function AdminHeader({ email }: { email: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/30 pb-4">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center text-lg font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Admin area
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-ink">Signed in as {email}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
