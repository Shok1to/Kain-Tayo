import Link from "next/link";
import HeroMedia from "@/components/HeroMedia";
import ListingCard from "@/components/ListingCard";
import { Avatar } from "@/components/ui";
import { ALL_TAGS, listings, sellers } from "@/data/mock";

const marquee = [
  "Lechon",
  "Kakanin",
  "Leche flan",
  "Inasal",
  "Pancit",
  "Lumpia",
  "Ube halaya",
  "Halo halo",
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* ---------- full screen hero ---------- */}
      <section className="relative left-1/2 -mt-[calc(var(--header-h,72px)+1.5rem)] flex h-[100svh] min-h-[560px] w-screen -translate-x-1/2 flex-col justify-end text-cream">
        <HeroMedia />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 sm:pb-8">
          <p className="label mb-4">Weekend feast preorders</p>
          <h1 className="font-display max-w-4xl text-[3.4rem] leading-[0.92] sm:text-[6.5rem]">
            Feasts from home kitchens,{" "}
            <em className="italic">made for sharing.</em>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-cream/90">
            Preorder lechon, kakanin and leche flan from verified home cooks.
            Pay now, we hold it safe, and pick up when it is hot.
          </p>
          <Link
            href="#feasts"
            className="btn-lime mt-7 block w-full py-4 text-base"
          >
            Order now
          </Link>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="-mx-4 overflow-hidden border-y-2 border-ink bg-mango py-3 sm:mx-0 sm:rounded-full sm:border-2">
        <div className="animate-marquee font-display flex w-max gap-8 whitespace-nowrap text-4xl text-ink">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-8">
              {m} <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            </span>
          ))}
        </div>
      </div>
      {/* ---------- listings ---------- */}
      <section id="feasts" className="scroll-mt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
            This weekend&apos;s
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      </section>

      {/* ---------- cooks ---------- */}
      <section className="-mx-4 bg-ube px-4 py-14 sm:mx-0 sm:rounded-[2.5rem] sm:border-2 sm:border-ink sm:px-10">
        <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
          Meet the <em className="italic">cooks</em>
        </h2>
        <p className="mt-3 max-w-md text-ink/80">
          Every one of them has a verified food handler certificate on file.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {sellers.map((s) => (
            <Link
              key={s.id}
              href={`/seller/${s.id}`}
              className="group rounded-3xl border-2 border-ink bg-cream p-4 transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
            >
              <Avatar
                name={s.name}
                className="h-14 w-14 bg-mango text-2xl transition group-hover:rotate-12"
              />
              <p className="font-display mt-3 text-2xl leading-tight text-ink">
                {s.name}
              </p>
              <p className="label mt-1 text-ink/70">
                {s.city}, rated {s.rating.toFixed(1)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section>
        <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
          How your money <em className="italic">stays safe</em>
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["bg-mint", "You pay", "Your payment goes into a safe vault, not straight to the cook."],
            ["bg-mango", "Cook gets 30%", "48 hours before pickup, the cook receives an advance to buy ingredients."],
            ["bg-tomato", "Scan to finish", "At pickup the cook scans your QR code and the last 70% is released."],
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
