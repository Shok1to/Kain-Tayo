import Link from "next/link";
import { Avatar } from "./ui";
import { BRANDS } from "@/data/brand";
import { Vendor } from "@/data/mock";

// The vendor's own header. This is the shop's name on the door: their logo,
// their name in their own font, and links around their own shop. It sits in
// the vendor's brand color. Kain Tayo is only the thin bar above it.
export default function ShopHeader({
  vendor,
  asH1,
}: {
  vendor: Vendor;
  // The shop's own page uses the name as the page title. On a listing page the
  // listing's title is the page title, so the name is plain text there.
  asH1: boolean;
}) {
  const brand = BRANDS[vendor.brand];
  const Name = asH1 ? "h1" : "p";
  const shop = `/vendors/${vendor.slug}`;

  return (
    <header className={`border-b-2 border-ink ${brand.bg}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-4 py-5">
        <Link href={shop} className="flex min-w-0 items-center gap-4">
          <Avatar
            name={vendor.name}
            className="h-16 w-16 bg-cream text-3xl sm:h-20 sm:w-20 sm:text-4xl"
            brand={vendor.brand}
          />
          <span className="min-w-0">
            <Name className="font-display text-3xl leading-none text-ink sm:text-5xl">
              {vendor.name}
            </Name>
            <span className="label mt-1 block text-ink/70">
              {vendor.cuisine}, {vendor.city}
            </span>
          </span>
        </Link>

        <nav aria-label="Shop" className="label flex gap-6 text-ink">
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
      </div>
    </header>
  );
}
