import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import { Avatar, PhotoPlaceholder, Stars, TagPill, VerifiedBadge } from "@/components/ui";
import { formatPrice, getListing, getSeller, listings } from "@/data/mock";

// Tells Next.js which listing pages exist so it can prepare them ahead of time.
export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  const seller = getSeller(listing.sellerId);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="group h-fit md:sticky md:top-24">
        <PhotoPlaceholder
          listing={listing}
          className="aspect-[4/3] rounded-[2rem]  "
        />
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-6xl">{listing.title}</h1>
          <p className="mt-2 text-3xl font-bold text-ink">
            {formatPrice(listing.price)}{" "}
            <span className="text-base font-normal text-ink/60">
              {listing.unit}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {listing.tags.map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>

        <p className="text-ink/80">{listing.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 border-2 border-ink">
            <p className="text-xs uppercase tracking-wide text-ink/60">
              Pickup time slot
            </p>
            <p className="mt-1 font-semibold">{listing.pickupDate}</p>
            <p className="text-ink/80">{listing.pickupSlot}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border-2 border-ink">
            <p className="text-xs uppercase tracking-wide text-ink/60">
              Order cutoff
            </p>
            <p className="mt-1 font-semibold">{listing.cutoff}</p>
            <p className="text-ink/80">Orders close after this</p>
          </div>
        </div>

        {seller && (
          <Link
            href={`/seller/${seller.id}`}
            className="flex items-center gap-3 rounded-xl bg-white p-4 border-2 border-ink hover:bg-lime/40"
          >
            <Avatar name={seller.name} className="h-12 w-12 text-xl" />
            <span className="space-y-1">
              <span className="block font-semibold text-ink">
                {seller.name}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <Stars rating={seller.rating} count={seller.reviews.length} />
              </span>
            </span>
          </Link>
        )}

        <AddToCart listingId={listing.id} />

        <p className="rounded-xl border-2 border-ink bg-mint p-3 text-sm text-ink">
          Your payment is held safely by Kain Tayo until you pick up your
          food.
        </p>
      </div>
    </div>
  );
}
