"use client";

import Link from "next/link";
import ListingCard from "./ListingCard";
import { usePlatform } from "./PlatformProvider";
import VendorBanner from "./VendorBanner";
import { Avatar, Stars, VerifiedBadge } from "./ui";
import { BRANDS } from "@/data/brand";

// A slow strip of vendor names. Each dot uses that vendor's own color.
export function VendorMarquee() {
  const { vendors } = usePlatform();
  const loop = [...vendors, ...vendors, ...vendors, ...vendors];
  return (
    <div className="-mx-4 overflow-hidden border-y-2 border-ink bg-cream py-3 sm:mx-0 sm:rounded-full sm:border-2">
      <div className="animate-marquee font-display flex w-max gap-8 whitespace-nowrap text-4xl text-ink">
        {loop.map((v, i) => (
          <Link
            key={i}
            href={`/vendors/${v.slug}`}
            className="flex items-center gap-8 hover:underline"
          >
            {v.name}
            <span
              className={`h-3.5 w-3.5 rounded-full border-2 border-ink ${BRANDS[v.brand].bg}`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// The best rated verified vendors, shown right under the hero.
// Vendors with no ratings yet (rating 0) never get picked.
export function FeaturedVendors() {
  const { vendors } = usePlatform();
  const featured = vendors
    .filter((v) => v.status === "verified" && v.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <section className="-mx-4 bg-ink px-4 py-14 text-cream sm:mx-0 sm:rounded-[2.5rem] sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-lime">Shops to visit</p>
          <h2 className="font-display mt-2 text-5xl leading-none sm:text-6xl">
            Featured <em className="italic">vendors</em>
          </h2>
          <p className="mt-3 max-w-md text-cream/80">
            The best rated shops on the marketplace this week. Each one is run
            by a vendor with a verified food handler certificate.
          </p>
        </div>
        <Link href="/vendors" className="btn-lime px-6 py-3">
          See all vendors
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((v) => (
          <Link
            key={v.slug}
            href={`/vendors/${v.slug}`}
            className={`group overflow-hidden rounded-[2rem] border-2 border-ink bg-cream text-ink transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-lime)]`}
          >
            <VendorBanner
              vendor={v}
              className="aspect-[16/9] border-b-2 border-ink"
              letterSize="text-[6rem]"
            />
            <div className={`space-y-2 p-4 ${BRANDS[v.brand].soft}`}>
              <div className="flex items-center gap-3">
                <Avatar
                  name={v.name}
                  brand={v.brand}
                  className="-mt-10 h-14 w-14 border-4 text-xl"
                />
                <p className="label text-ink/70">{v.cuisine}</p>
              </div>
              <h3 className="font-display text-3xl leading-tight">{v.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <Stars rating={v.rating} />
              </div>
              <p className="label pt-1 underline underline-offset-4">
                Visit this shop
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// The grid of every listing on the marketplace. Each card names its vendor.
export function AllListings() {
  const { listings, vendors } = usePlatform();
  return (
    <>
      <p className="label mb-6 text-ink/60">
        {listings.length} preorders from {vendors.length} vendors
      </p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((l, i) => (
          <ListingCard key={l.id} listing={l} index={i} />
        ))}
      </div>
    </>
  );
}
