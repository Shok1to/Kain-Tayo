import Link from "next/link";
import { Avatar, Stars, VerifiedBadge } from "./ui";
import { BRANDS } from "@/data/brand";
import { Vendor } from "@/data/mock";

// The vendor's own footer: who runs the shop. Kain Tayo shrinks to one small
// line at the very bottom.
export default function ShopFooter({ vendor }: { vendor: Vendor }) {
  const brand = BRANDS[vendor.brand];
  const shop = `/vendors/${vendor.slug}`;

  return (
    <footer className={`mt-10 border-t-2 border-ink ${brand.bg}`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div className="flex items-center gap-4">
          <Avatar
            name={vendor.name}
            brand={vendor.brand}
            className="h-16 w-16 bg-cream text-3xl"
          />
          <div>
            <p className="font-display text-3xl leading-none text-ink">
              {vendor.name}
            </p>
            <p className="label mt-2 text-ink/70">
              Run by {vendor.ownerName}, {vendor.city}
            </p>
          </div>
        </div>

        <nav
          aria-label="Shop footer"
          className="label flex flex-col gap-2 text-ink"
        >
          <Link href={shop} className="hover:underline">
            Shop
          </Link>
          <Link href={`${shop}#about`} className="hover:underline">
            About
          </Link>
          <Link href={`${shop}#reviews`} className="hover:underline">
            Reviews
          </Link>
        </nav>

        <div className="flex flex-col items-start gap-2">
          {vendor.status === "verified" && <VerifiedBadge />}
          <Stars rating={vendor.rating} count={vendor.reviews.length} />
        </div>
      </div>

      <div className="border-t border-ink/30 bg-cream/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="label text-ink/70">
            This shop is part of the Kain Tayo marketplace. Kain Tayo does not
            cook or sell food.
          </p>
          <div className="label flex gap-5 text-ink">
            <Link href="/" className="hover:underline">
              Back to marketplace
            </Link>
            <Link href="/vendor/signup" className="hover:underline">
              Become a vendor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
