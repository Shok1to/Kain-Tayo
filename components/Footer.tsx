import Link from "next/link";

// The marketplace footer, used on every page that is not inside one vendor's
// shop. (Shops have their own footer, see ShopFooter.tsx.)
export default function Footer() {
  const linkClass = "hover:underline";

  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <p className="font-display max-w-md text-3xl leading-tight sm:text-4xl">
            Good food travels better when everyone gets paid on time.
          </p>

          <nav aria-label="Marketplace" className="label flex flex-col gap-3">
            <p className="text-cream/50">Marketplace</p>
            <Link href="/" className={`text-lime ${linkClass}`}>
              Home
            </Link>
            <Link href="/vendors" className={`text-lime ${linkClass}`}>
              Vendors
            </Link>
            <Link href="/search" className={`text-lime ${linkClass}`}>
              Search
            </Link>
            <Link href="/cart" className={`text-lime ${linkClass}`}>
              Cart
            </Link>
          </nav>

          <nav aria-label="For vendors" className="label flex flex-col gap-3">
            <p className="text-cream/50">For vendors</p>
            <Link href="/vendor/signup" className={`text-lime ${linkClass}`}>
              Become a vendor
            </Link>
            <Link href="/vendor/dashboard" className={`text-lime ${linkClass}`}>
              Vendor dashboard
            </Link>
            <Link href="/wallet" className={`text-lime ${linkClass}`}>
              Seller wallet demo
            </Link>
          </nav>
        </div>

        <div className="mt-12 border-t border-cream/20 pt-8">
          <p className="font-display text-5xl leading-none text-lime sm:text-6xl">
            Kain Tayo
          </p>
          {/* Normal sentence case in the body font, so it reads like a sentence
              and not like a label. */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80">
            Kain Tayo is a marketplace. It does not cook or sell food. Every
            listing is sold by an independent vendor.
          </p>
        </div>
      </div>
    </footer>
  );
}
