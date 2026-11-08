import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 overflow-hidden bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="font-display max-w-md text-3xl leading-tight text-cream sm:text-4xl">
            Good food travels better when everyone gets paid on time.
          </p>
          <div className="label flex flex-col gap-2 text-lime">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/search" className="hover:underline">
              Search
            </Link>
            <Link href="/cart" className="hover:underline">
              Cart
            </Link>
            <Link href="/wallet" className="hover:underline">
              Seller wallet demo
            </Link>
          </div>
        </div>
        <p className="label mt-8 text-cream/60">
          Prototype for a demo. All sellers, food and payments are pretend.
        </p>
        <p className="font-display select-none text-[22vw] leading-[0.8] text-lime sm:text-[15rem]">
          Kain Tayo
        </p>
      </div>
    </footer>
  );
}
