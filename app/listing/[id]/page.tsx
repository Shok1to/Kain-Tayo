import { Suspense } from "react";
import ListingDetail from "@/components/ListingDetail";
import { seedListings } from "@/data/mock";

// The built in listings are prepared ahead of time. Listings added by a vendor
// are not in this list, so those pages are made when first visited.
export function generateStaticParams() {
  return seedListings.map((l) => ({ id: l.id }));
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetail id={id} />;
}

export default function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="py-10 text-ink/60">Loading...</p>}>
      <Content params={params} />
    </Suspense>
  );
}
