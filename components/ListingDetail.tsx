"use client";

import Link from "next/link";
import AddToCart from "./AddToCart";
import { usePlatform } from "./PlatformProvider";
import { Avatar, PhotoPlaceholder, Stars, TagPill, VerifiedBadge } from "./ui";
import { formatPrice } from "@/data/mock";

// One listing's page. Looks the listing up in the shared platform notebook.
export default function ListingDetail({ id }: { id: string }) {
  const { getListing, getVendor, ready } = usePlatform();
  const listing = getListing(id);

  if (!listing) {
    return ready ? (
      <div className="rounded-3xl border-2 border-ink bg-white p-10 text-center">
        <h1 className="font-display text-5xl leading-none text-ink">
          Listing not found
        </h1>
        <p className="mt-3 text-ink/70">
          No listing lives at this address.
        </p>
        <Link href="/" className="btn-primary mt-5 px-6 py-3">
          Back to home
        </Link>
      </div>
    ) : (
      <p className="py-10 text-ink/60">Loading...</p>
    );
  }

  const vendor = getVendor(listing.vendorSlug);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="group h-fit md:sticky md:top-24">
        <PhotoPlaceholder
          listing={listing}
          className="aspect-[4/3] rounded-[2rem]"
        />
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
            {listing.title}
          </h1>
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
          <div className="rounded-xl border-2 border-ink bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink/60">
              Pickup time slot
            </p>
            <p className="mt-1 font-semibold">{listing.pickupDate}</p>
            <p className="text-ink/80">{listing.pickupSlot}</p>
          </div>
          <div className="rounded-xl border-2 border-ink bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink/60">
              Order cutoff
            </p>
            <p className="mt-1 font-semibold">{listing.cutoff}</p>
            <p className="text-ink/80">Orders close after this</p>
          </div>
        </div>

        {vendor && (
          <Link
            href={`/vendors/${vendor.slug}`}
            className="flex items-center gap-3 rounded-xl border-2 border-ink bg-white p-4 hover:bg-lime/40"
          >
            <Avatar name={vendor.name} brand={vendor.brand} className="h-12 w-12 text-xl" />
            <span className="space-y-1">
              <span className="label block text-ink/50">Sold by</span>
              <span className="block font-semibold text-ink">
                {vendor.name}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                {vendor.status === "verified" && <VerifiedBadge />}
                <Stars rating={vendor.rating} count={vendor.reviews.length} />
              </span>
            </span>
          </Link>
        )}

        <AddToCart listingId={listing.id} />

        <p className="rounded-xl border-2 border-ink bg-mint p-3 text-sm text-ink">
          Kain Tayo holds your payment safely until you pick up your food from
          {vendor ? ` ${vendor.name}` : " the vendor"}.
        </p>
      </div>
    </div>
  );
}
