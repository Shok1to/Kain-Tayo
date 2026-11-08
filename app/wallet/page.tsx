import { formatPrice, getListing } from "@/data/mock";

// Mock only: every number on this page is hard coded on purpose.
export default function WalletPage() {
  const listing = getListing("wholelechon")!;
  const total = listing.price; // 320
  const advance = total * 0.3; // 96
  const remaining = total * 0.7; // 224

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white ">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-mango" />
        <p className="relative text-sm text-cream/70">Seller wallet</p>
        <h1 className="font-display relative mt-1 text-5xl leading-none ">
          Tita Baby&apos;s Kitchen
        </h1>
        <p className="relative mt-4 text-sm text-cream/70">Available now</p>
        <p className="font-display relative text-5xl font-bold text-lime">
          {formatPrice(advance)}
        </p>
        <p className="relative mt-1 text-xs text-cream/70">Demo view, pretend money</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-mint p-4 border-2 border-ink">
          <p className="text-xs uppercase tracking-wide text-ink">
            Available now
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(advance)}
          </p>
        </div>
        <div className="rounded-3xl bg-mango p-4 border-2 border-ink">
          <p className="text-xs uppercase tracking-wide text-ink">
            Held in vault
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(remaining)}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-4 border-2 border-ink">
          <p className="text-xs uppercase tracking-wide text-ink/60">
            Order total
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(total)}
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl bg-white p-6 border-2 border-ink">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-ink/60">Order KT4821</p>
            <h2 className="font-display text-3xl  text-ink">
              1 x {listing.title}
            </h2>
            <p className="text-sm text-ink/70">
              Pickup {listing.pickupDate}, {listing.pickupSlot}
            </p>
          </div>
          <p className="text-xl font-bold text-ink">
            {formatPrice(total)}
          </p>
        </div>

        {/* Simple bar showing the 30 and 70 split */}
        <div className="flex h-6 overflow-hidden rounded-full border-2 border-ink text-[11px] font-bold text-ink">
          <div className="flex w-[30%] items-center justify-center border-r-2 border-ink bg-mint">
            30%
          </div>
          <div className="flex w-[70%] items-center justify-center bg-mango">
            70%
          </div>
        </div>

        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mint text-ink">
              1
            </span>
            <div>
              <p className="font-semibold text-ink">
                30% advance released: {formatPrice(advance)}
              </p>
              <p className="text-sm text-ink/70">
                Sent to your wallet 48 hours before pickup, on Thursday, Nov 12
                at 2 PM, so you can buy ingredients.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mango text-ink">
              2
            </span>
            <div>
              <p className="font-semibold text-ink">
                70% released after QR scan: {formatPrice(remaining)}
              </p>
              <p className="text-sm text-ink/70">
                Waiting for pickup. The money unlocks the moment you scan the
                buyer&apos;s QR code.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
