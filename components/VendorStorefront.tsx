"use client";

import Link from "next/link";
import ListingCard from "./ListingCard";
import { usePlatform } from "./PlatformProvider";
import VendorBanner from "./VendorBanner";
import { Stars, VerifiedBadge } from "./ui";
import { BRANDS } from "@/data/brand";

// The inside of one vendor's shop. The vendor's name, logo, navigation and
// footer come from the shop frame (see Chrome.tsx), so this page only holds
// the shop's content: banner, About, Shop and Reviews.
export default function VendorStorefront({ slug }: { slug: string }) {
  const { getVendor, getListingsByVendor, ready } = usePlatform();
  const vendor = getVendor(slug);

  if (!vendor) {
    return ready ? (
      <div className="rounded-3xl border-2 border-ink bg-white p-10 text-center">
        <h1 className="font-display text-5xl leading-none text-ink">
          Vendor not found
        </h1>
        <p className="mt-3 text-ink/70">
          No vendor has a shop at this address.
        </p>
        <Link href="/vendors" className="btn-primary mt-5 px-6 py-3">
          Browse all vendors
        </Link>
      </div>
    ) : (
      <p className="py-10 text-ink/60">Loading...</p>
    );
  }

  const brand = BRANDS[vendor.brand];
  const vendorListings = getListingsByVendor(vendor.slug);

  return (
    <div className="space-y-12">
      {/* ---------- the shop's banner ---------- */}
      <VendorBanner
        vendor={vendor}
        className="h-56 rounded-[2rem] border-2 border-ink sm:h-[26rem]"
        letterSize="text-[14rem]"
      />

      {/* ---------- about ---------- */}
      <section
        id="about"
        className="grid scroll-mt-20 gap-6 lg:grid-cols-[1fr_auto] lg:items-start"
      >
        <div className="space-y-4">
          <span
            className={`label inline-block rounded-full border-2 border-ink px-3 py-1 ${brand.bg}`}
          >
            {vendor.cuisine}
          </span>
          <h2 className="font-display text-4xl leading-none text-ink sm:text-5xl">
            About this shop
          </h2>
          <p className="max-w-2xl text-lg text-ink/80">{vendor.bio}</p>
          <div className="flex flex-wrap items-center gap-3">
            {vendor.status === "verified" ? (
              <VerifiedBadge />
            ) : (
              <span className="label rounded-full bg-mango px-2.5 py-1 ring-2 ring-ink">
                Pending verification
              </span>
            )}
            <Stars rating={vendor.rating} count={vendor.reviews.length} />
          </div>
        </div>
        <dl className="label grid grid-cols-3 gap-4 rounded-3xl border-2 border-ink bg-white p-4 lg:grid-cols-1 lg:gap-3">
          <div>
            <dt className="text-ink/50">Cuisine</dt>
            <dd className="mt-0.5 text-ink">{vendor.cuisine}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Based in</dt>
            <dd className="mt-0.5 text-ink">{vendor.city}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Run by</dt>
            <dd className="mt-0.5 text-ink">{vendor.ownerName}</dd>
          </div>
        </dl>
      </section>

      {/* ---------- this shop's preorders ---------- */}
      <section id="shop" className="scroll-mt-20">
        <div
          className={`flex flex-wrap items-end justify-between gap-2 rounded-3xl border-2 border-ink px-5 py-4 ${brand.bg}`}
        >
          <h2 className="font-display text-3xl leading-none text-ink sm:text-4xl">
            Preorders from {vendor.name}
          </h2>
          <p className="label text-ink/70">
            {vendorListings.length}{" "}
            {vendorListings.length === 1 ? "listing" : "listings"}
          </p>
        </div>

        {vendorListings.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendorListings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-ink/70">This shop has no listings yet.</p>
        )}
      </section>

      {/* ---------- reviews ---------- */}
      <section id="reviews" className="scroll-mt-20">
        <h2 className="font-display mb-4 text-3xl text-ink sm:text-4xl">
          What buyers say
        </h2>
        {vendor.reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {vendor.reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-3xl border-2 border-ink bg-cream p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{r.author}</p>
                  <span className="text-xs text-ink/60">{r.date}</span>
                </div>
                <p className="label mt-1 font-bold">
                  Rated {r.rating} out of 5
                </p>
                <p className="mt-2 text-sm text-ink/80">{r.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/70">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
