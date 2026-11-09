"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";

function SearchForm({
  className = "",
  clear,
}: {
  className?: string;
  clear: boolean;
}) {
  // A plain form: submitting it opens /search?q=what you typed
  return (
    <form action="/search" className={`flex ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="Search preorders"
        className={`label w-full rounded-l-full border-2 border-r-0 px-4 py-2 outline-none transition ${
          clear
            ? "border-cream/70 bg-white/15 text-cream backdrop-blur placeholder:text-cream/70 focus:bg-white/25"
            : "border-ink bg-white text-ink placeholder:text-ink/50 focus:bg-lime/40"
        }`}
      />
      <button
        type="submit"
        className={`${clear ? "btn-lime" : "btn-primary"} rounded-l-none px-5 py-2 text-xs`}
      >
        Go
      </button>
    </form>
  );
}

export default function Header() {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [pastHero, setPastHero] = useState(false);

  // On the home page the header floats clear over the hero,
  // then turns solid once you scroll past it.
  const clear = pathname === "/" && !pastHero;
  const vendorButton = clear ? "btn-lime" : "btn-primary";

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tell the rest of the page how tall the header is.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`,
      );
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        clear
          ? "border-b-2 border-transparent text-cream"
          : "border-b-2 border-ink bg-cream/95 text-ink backdrop-blur"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.2fr)] md:grid-cols-[1fr_auto_1fr]">
        <SearchForm clear={clear} className="hidden max-w-xs sm:flex" />
        <span className="sm:hidden" />

        {/* The platform brand. This is the marketplace, not a shop. */}
        <Link
          href="/"
          className="font-display text-5xl leading-none transition hover:-rotate-2"
        >
          Kain Tayo
        </Link>

        <div className="flex items-center gap-4 justify-self-end">
          <Link
            href="/vendors"
            className="label hidden hover:underline lg:inline"
          >
            Vendors
          </Link>
          {/* The wrapper does the hiding. The button style sets its own
              display, which would cancel a "hidden" class on the button. */}
          <span className="hidden sm:block">
            <Link
              href="/vendor/signup"
              className={`${vendorButton} whitespace-nowrap px-4 py-2 text-xs`}
            >
              Become a vendor
            </Link>
          </span>
          <Link
            href="/cart"
            className="group flex items-center gap-2 font-mono"
            aria-label="Open cart"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-none stroke-current transition group-hover:-rotate-12"
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
              className="animate-pop inline-block text-lg font-bold"
            >
              [{ready ? count : 0}]
            </span>
          </Link>
        </div>
      </div>

      {/* Phones: search, then a slim row with the two vendor links. */}
      <div className="px-4 pb-2 sm:hidden">
        <SearchForm clear={clear} />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-3 sm:hidden">
        <Link href="/vendors" className="label hover:underline">
          Browse vendors
        </Link>
        <Link
          href="/vendor/signup"
          className={`${vendorButton} whitespace-nowrap px-4 py-2 text-xs`}
        >
          Become a vendor
        </Link>
      </div>
    </header>
  );
}
