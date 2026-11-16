// A plain form, so signing out always does a full page load (see app/admin/logout/route.ts).
export default function SignOutButton() {
  return (
    <form action="/admin/logout" method="post">
      <button
        type="submit"
        className="min-h-11 rounded-2xl border border-ink bg-white px-4 py-2 font-medium text-ink hover:bg-lime/40 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
      >
        Sign out
      </button>
    </form>
  );
}
