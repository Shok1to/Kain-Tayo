import { Suspense } from "react";
import VendorStorefront from "@/components/VendorStorefront";
import { seedVendors } from "@/data/mock";

// The 6 built in vendors are prepared ahead of time. Vendors created through
// signup are not in this list, so those pages are made when first visited.
export function generateStaticParams() {
  return seedVendors.map((v) => ({ slug: v.slug }));
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VendorStorefront slug={slug} />;
}

export default function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<p className="py-10 text-ink/60">Loading...</p>}>
      <Content params={params} />
    </Suspense>
  );
}
