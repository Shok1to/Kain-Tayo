"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

// The slim Kain Tayo bar shown on top of every vendor shop. The shop belongs
// to the vendor, so Kain Tayo shrinks to one thin line: a way back to the
// marketplace, search, and the cart. It uses font-platform so the name stays
// in Kain Tayo's font even though the shop below has its own font.
export default function PlatformBar() {
  const { count, ready } = useCart();

  return (
    <div className="sticky top-0 z-30 border-b-2 border-ink bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-platform text-3xl leading-none transition hover:text-lime"
          >
            Kain Tayo
          </Link>
          <span className="label hidden text-cream/60 sm:inline">
            Marketplace
          </span>
          <Link href="/vendors" className="label text-lime hover:underline">
            All vendors
          </Link>
          {/* Phones have no room for the search box, so they get a link. */}
          <Link href="/search" className="label hover:underline sm:hidden">
            Search
          </Link>
        </div>

        {/* A plain form: submitting it opens /search?q=what you typed */}
        <form action="/search" className="hidden max-w-xs flex-1 sm:flex">
          <input
            type="search"
            name="q"
            placeholder="Search all preorders"
            className="label w-full rounded-l-full border-2 border-r-0 border-cream/40 bg-white/10 px-4 py-1.5 text-cream outline-none placeholder:text-cream/60 focus:bg-white/20"
          />
          <button
            type="submit"
            className="btn-lime rounded-l-none px-4 py-1.5 text-xs"
          >
            Go
          </button>
        </form>

        <div className="flex items-center gap-5">
          <Link
            href="/vendor/signup"
            className="label hidden hover:text-lime hover:underline md:inline"
          >
            Become a vendor
          </Link>
          <Link
            href="/cart"
            className="group flex items-center gap-2 font-mono"
            aria-label="Open cart"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current transition group-hover:-rotate-12"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h3l2.7 12.3a1 1 0 001 .7h9.1a1 1 0 001-.8L20 7H6" />
            </svg>
            <span
              key={ready ? count : "x"}
              className="animate-pop inline-block text-base font-bold"
            >
              [{ready ? count : 0}]
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
