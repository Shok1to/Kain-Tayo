"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePlatform } from "./PlatformProvider";
import VendorBanner from "./VendorBanner";
import { Stars, VerifiedBadge } from "./ui";

const ALL = "All cuisines";

// The directory: every vendor on Kain Tayo, with search and a cuisine filter.
export default function VendorsDirectory() {
  const { vendors, listings } = usePlatform();
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState(ALL);

  // Only offer cuisines that at least one vendor really has.
  const cuisines = useMemo(
    () => [ALL, ...Array.from(new Set(vendors.map((v) => v.cuisine)))],
    [vendors],
  );

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return vendors.filter((v) => {
      const haystack = [v.name, v.ownerName, v.cuisine, v.city, v.bio]
        .join(" ")
        .toLowerCase();
      const matchesWords = words.every((w) => haystack.includes(w));
      const matchesCuisine = cuisine === ALL || v.cuisine === cuisine;
      return matchesWords && matchesCuisine;
    });
  }, [vendors, query, cuisine]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-none text-ink sm:text-6xl">
            Vendors <em className="italic">on Kain Tayo</em>
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/vendor/dashboard" className="btn-ghost px-6 py-3">
              Vendor login
            </Link>
            <Link href="/vendor/signup" className="btn-primary px-6 py-3">
              Become a vendor
            </Link>
          </div>
        </div>
        <p className="mt-3 max-w-lg text-ink/80">
          Every vendor runs their own shop. Find a cook you like and order
          straight from their storefront.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, cuisine or city"
          className="mt-5 w-full rounded-xl border border-ink bg-white px-4 py-3 outline-none focus:bg-lime/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {cuisines.map((c) => {
          const on = cuisine === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCuisine(c)}
              aria-pressed={on}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                on
                  ? "border-ink btn-primary"
                  : "border-ink bg-cream text-ink hover:bg-lime"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-ink/70">
        {results.length} {results.length === 1 ? "vendor" : "vendors"} found
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((v, i) => {
            const count = listings.filter((l) => l.vendorSlug === v.slug).length;
            return (
              <Link
                key={v.slug}
                href={`/vendors/${v.slug}`}
                style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
                className="group animate-fade-up flex flex-col gap-3"
              >
                <VendorBanner
                  vendor={v}
                  className="aspect-[4/3] rounded-[2rem] border-2 border-ink transition duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_var(--color-ink)]"
                />
                <div className="px-1">
                  <h2 className="font-display text-3xl leading-tight text-ink">
                    {v.name}
                  </h2>
                  <p className="label mt-1 text-ink/70">
                    {v.cuisine}, {v.city}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {v.status === "verified" ? (
                      <VerifiedBadge />
                    ) : (
                      <span className="label rounded-full bg-mango px-2.5 py-1 ring-2 ring-ink">
                        Pending verification
                      </span>
                    )}
                    <Stars rating={v.rating} count={v.reviews.length} />
                  </div>
                  <p className="label mt-2 text-ink/60">
                    {count} {count === 1 ? "listing" : "listings"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink bg-white p-10 text-center text-ink/70">
          No vendors match. Try fewer words or pick another cuisine.
        </div>
      )}
    </div>
  );
}
