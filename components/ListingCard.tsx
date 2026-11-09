"use client";

import Link from "next/link";
import { Listing, formatPrice } from "@/data/mock";
import { usePlatform } from "./PlatformProvider";
import { Avatar, PhotoPlaceholder, TagPill } from "./ui";

// One listing in a grid. Every listing belongs to a vendor, so the vendor
// comes first on the card: their logo badge and name link to their shop.
//
// The whole card is also clickable and opens the listing. A link cannot sit
// inside another link in HTML, so the card is a plain box. The title is the
// link, and a "stretched" invisible layer (the ::after below) makes the
// title's click area cover the whole card. The vendor link sits above that
// layer with z-10, so clicking the vendor goes to their storefront instead.
export default function ListingCard({
  listing,
  index = 0,
}: {
  listing: Listing;
  index?: number;
}) {
  const { getVendor } = usePlatform();
  const vendor = getVendor(listing.vendorSlug);

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      className="group animate-fade-up relative flex flex-col gap-3"
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
        {vendor && (
          <Link
            href={`/vendors/${vendor.slug}`}
            className="group/vendor relative z-10 inline-flex max-w-full items-center gap-2"
          >
            <Avatar
              name={vendor.name}
              brand={vendor.brand}
              className="h-7 w-7 text-xs"
            />
            <span className="label truncate text-ink underline decoration-ink/30 underline-offset-4 group-hover/vendor:decoration-ink">
              {vendor.name}
            </span>
          </Link>
        )}

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight text-ink">
            <Link
              href={`/listing/${listing.id}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {listing.title}
            </Link>
          </h3>
          <p className="label shrink-0 text-base font-bold">
            {formatPrice(listing.price)}
          </p>
        </div>
        <p className="label text-ink/50">{listing.pickupSlot}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {listing.tags.slice(0, 3).map((t) => (
            <TagPill key={t} tag={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
