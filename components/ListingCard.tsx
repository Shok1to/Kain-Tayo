import Link from "next/link";
import { Listing, formatPrice, getSeller } from "@/data/mock";
import { PhotoPlaceholder, TagPill } from "./ui";

export default function ListingCard({
  listing,
  index = 0,
}: {
  listing: Listing;
  index?: number;
}) {
  const seller = getSeller(listing.sellerId);
  return (
    <Link
      href={`/listing/${listing.id}`}
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      className="group animate-fade-up flex flex-col gap-3"
    >
      <div className="relative">
        <PhotoPlaceholder
          listing={listing}
          className="aspect-square rounded-[2rem] border-2 border-ink transition duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_var(--color-ink)]"
        />
        <span className="label absolute left-3 top-3 rounded-full bg-cream px-3 py-1 font-bold ring-2 ring-ink">
          {listing.pickupDate.replace(/^\w+day, /, "")}
        </span>
      </div>

      <div className="px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-ink">
            {listing.title}
          </h3>
          <p className="label shrink-0 text-base font-bold">
            {formatPrice(listing.price)}
          </p>
        </div>
        <p className="label mt-1 text-ink/70">
          {seller?.name}
        </p>
        <p className="label text-ink/50">{listing.pickupSlot}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {listing.tags.slice(0, 3).map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}
