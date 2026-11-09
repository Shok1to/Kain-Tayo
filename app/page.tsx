import Link from "next/link";
import HeroMedia from "@/components/HeroMedia";
import {
  AllListings,
  FeaturedVendors,
  VendorMarquee,
} from "@/components/HomeSections";
import { ALL_TAGS } from "@/data/mock";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* ---------- full screen hero ---------- */}
      <section className="relative left-1/2 -mt-[calc(var(--header-h,72px)+1.5rem)] flex h-[100svh] min-h-[560px] w-screen -translate-x-1/2 flex-col justify-end text-cream">
        <HeroMedia />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 sm:pb-8">
          <p className="label mb-4">A marketplace of home kitchens</p>
          <h1 className="font-display max-w-4xl text-[3.4rem] leading-[0.92] sm:text-[6.5rem]">
            Shop home kitchens,{" "}
            <em className="italic">vendor by vendor.</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/90">
            Kain Tayo is where independent home cooks open their own shops.
            Browse their weekend preorders, pay safely, and pick up straight
            from the vendor.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/vendors" className="btn-lime py-4 text-base">
              Browse vendors
            </Link>
            <Link href="/vendor/signup" className="btn-ghost-light py-4 text-base">
              Become a vendor
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- vendor names ---------- */}
      <VendorMarquee />

      {/* ---------- featured vendors ---------- */}
      <FeaturedVendors />

      {/* ---------- browse all preorders ---------- */}
      <section id="preorders" className="scroll-mt-28">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
            Browse all
            <br />
            <em className="italic">preorders</em>
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="label rounded-full border-2 border-ink px-3.5 py-1.5 transition hover:bg-lime"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
        <AllListings />
      </section>

      {/* ---------- how checkout works ---------- */}
      <section>
        <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
          How checkout works <em className="italic">on Kain Tayo</em>
        </h2>
        <p className="mt-3 max-w-xl text-ink/80">
          Kain Tayo does not cook or sell anything. It holds your payment safely
          between you and the vendor.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["bg-mint", "You pay", "Your payment goes into the Kain Tayo vault, not straight to the vendor."],
            ["bg-mango", "Vendor gets 30%", "48 hours before pickup, the vendor receives an advance to buy ingredients."],
            ["bg-tomato", "Scan to finish", "At pickup the vendor scans your QR code and the last 70% is released."],
          ].map(([bg, title, text], i) => (
            <div
              key={title}
              className={`rounded-[2rem] border-2 border-ink p-6 ${bg}`}
            >
              <p className="font-display text-8xl leading-none text-ink">
                {i + 1}
              </p>
              <p className="font-display mt-2 text-3xl text-ink">{title}</p>
              <p className="mt-2 text-ink/80">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
