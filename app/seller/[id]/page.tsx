import { notFound } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { Avatar, Stars, VerifiedBadge } from "@/components/ui";
import { getListingsBySeller, getSeller, sellers } from "@/data/mock";

export function generateStaticParams() {
  return sellers.map((s) => ({ id: s.id }));
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = getSeller(id);
  if (!seller) notFound();
  const sellerListings = getListingsBySeller(seller.id);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 border-2 border-ink sm:flex-row sm:items-center">
        <Avatar name={seller.name} className="h-24 w-24 text-4xl" />
        <div className="space-y-2">
          <h1 className="font-display text-5xl leading-none  text-ink">{seller.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <VerifiedBadge />
            <Stars rating={seller.rating} count={seller.reviews.length} />
            <span className="label text-ink/60">{seller.city}</span>
          </div>
          <p className="max-w-2xl text-ink/80">{seller.bio}</p>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-3xl  text-ink">
          Listings from {seller.name}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sellerListings.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-3xl  text-ink">Reviews</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {seller.reviews.map((r, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-4 border-2 border-ink"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{r.author}</p>
                <span className="text-xs text-ink/60">{r.date}</span>
              </div>
              <p className="label mt-1 font-bold">Rated {r.rating} out of 5</p>
              <p className="mt-2 text-sm text-ink/80">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
