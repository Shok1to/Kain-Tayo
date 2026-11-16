import type { Metadata } from "next";

// Keep the admin area out of search engines.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-base text-ink sm:py-12">
      {children}
    </main>
  );
}
