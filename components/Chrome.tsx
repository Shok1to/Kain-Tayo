"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Header from "./Header";
import PlatformBar from "./PlatformBar";
import { usePlatform } from "./PlatformProvider";
import ShopFooter from "./ShopFooter";
import ShopHeader from "./ShopHeader";
import { BRANDS, FONTS } from "@/data/brand";
import { Vendor } from "@/data/mock";

// "Chrome" is the frame around every page: the header, the footer, and the
// space between them. Kain Tayo has two frames:
//
//   marketplace frame: the big Kain Tayo header and footer. Used for the home
//     page, the vendors directory, search, cart, signup and the dashboard.
//
//   shop frame: used for pages that belong to ONE vendor, which are their
//     storefront (/vendors/slug) and their listings (/listing/id). Kain Tayo
//     shrinks to a thin bar, and the page wears the vendor's own header,
//     footer, color and heading font.
export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getVendor, getListing, ready } = usePlatform();

  // Which vendor owns this page? A storefront knows from its address. A
  // listing knows from the listing it shows.
  const storefront = pathname.match(/^\/vendors\/([^/]+)\/?$/);
  const listingPage = pathname.match(/^\/listing\/([^/]+)\/?$/);

  let vendor: Vendor | undefined;
  if (storefront) {
    vendor = getVendor(decodeURIComponent(storefront[1]));
  } else if (listingPage) {
    const listing = getListing(decodeURIComponent(listingPage[1]));
    vendor = listing ? getVendor(listing.vendorSlug) : undefined;
  }

  if (vendor) {
    return (
      <ShopFrame vendor={vendor} asH1={Boolean(storefront)}>
        {children}
      </ShopFrame>
    );
  }

  // A shop page whose vendor is not known yet. That happens for vendors made
  // in this browser, until saved data has been read. Show only the thin bar so
  // the big marketplace header does not flash and then vanish.
  if ((storefront || listingPage) && !ready) {
    return (
      <>
        <PlatformBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-6 pt-[calc(var(--header-h,72px)+1.5rem)]">
        {children}
      </main>
      <Footer />
    </>
  );
}

function ShopFrame({
  vendor,
  asH1,
  children,
}: {
  vendor: Vendor;
  asH1: boolean;
  children: React.ReactNode;
}) {
  const brand = BRANDS[vendor.brand];
  const font = FONTS[brand.font];

  return (
    // data-shop switches on the shop theme in globals.css. These three
    // variables are what the theme reads: the vendor's color, heading font and
    // heading weight.
    <div
      data-shop={vendor.slug}
      className={`flex flex-1 flex-col ${brand.soft}`}
      style={
        {
          "--shop-accent": brand.hex,
          "--shop-display": `var(${font.cssVar})`,
          "--shop-weight": font.weight,
        } as React.CSSProperties
      }
    >
      <PlatformBar />
      <ShopHeader vendor={vendor} asH1={asH1} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <ShopFooter vendor={vendor} />
    </div>
  );
}
