"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ORDER_KEY, useCart } from "@/components/CartProvider";
import { PhotoPlaceholder, VerifiedBadge } from "@/components/ui";
import { usePlatform } from "@/components/PlatformProvider";
import { Listing, Vendor, formatPrice } from "@/data/mock";
import { CartLine } from "@/components/CartProvider";

type Row = { line: CartLine; listing: Listing };
type Group = {
  slug: string;
  vendor: Vendor | undefined;
  rows: Row[];
  subtotal: number;
};

// Round to whole cents so adding prices never leaves a tiny floating point tail.
const cents = (n: number) => Math.round(n * 100) / 100;

export default function CartPage() {
  const { lines, ready, total, setQty, remove, clear } = useCart();
  const { getListing, getVendor, placeOrders } = usePlatform();
  const router = useRouter();

  // Turn the flat list of cart lines into groups, one group per vendor.
  const groups: Group[] = [];
  for (const line of lines) {
    const listing = getListing(line.listingId);
    if (!listing) continue;
    let group = groups.find((g) => g.slug === listing.vendorSlug);
    if (!group) {
      group = {
        slug: listing.vendorSlug,
        vendor: getVendor(listing.vendorSlug),
        rows: [],
        subtotal: 0,
      };
      groups.push(group);
    }
    group.rows.push({ line, listing });
    group.subtotal = cents(group.subtotal + listing.price * line.qty);
  }

  function pay() {
    // Fake payment. One order is made for each vendor, because each vendor
    // is paid and picked up separately.
    const created = placeOrders(
      groups.map((g) => ({
        vendorSlug: g.slug,
        buyerName: "Guest buyer",
        items: g.rows.map(({ line, listing }) => ({
          title: listing.title,
          qty: line.qty,
          price: listing.price,
          pickupDate: listing.pickupDate,
          pickupSlot: listing.pickupSlot,
        })),
        total: g.subtotal,
        pickupDate: g.rows[0].listing.pickupDate,
        pickupSlot: g.rows[0].listing.pickupSlot,
      })),
    );
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(created));
    } catch {
      // ignore storage problems
    }
    clear();
    router.push("/confirmation");
  }

  if (!ready) {
    return <p className="py-10 text-ink/60">Loading your cart...</p>;
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink bg-white p-12 text-center">
        <h1 className="font-display mt-3 text-5xl leading-none text-ink">
          Your cart is empty
        </h1>
        <p className="mt-1 text-ink/70">Find something tasty to preorder.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full btn-primary px-6 py-3"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  const many = groups.length > 1;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <h1 className="font-display text-5xl leading-none text-ink">
          Your cart
        </h1>

        {many && (
          <p className="rounded-2xl border-2 border-ink bg-mango/40 p-4 text-sm text-ink">
            You have items from {groups.length} vendors. Each vendor&apos;s
            order is paid and picked up separately.
          </p>
        )}

        {groups.map((g) => (
          <section
            key={g.slug}
            className="space-y-3 rounded-[2rem] border-2 border-ink bg-white p-3 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/vendors/${g.slug}`}
                  className="font-display text-3xl leading-none text-ink hover:underline"
                >
                  {g.vendor?.name ?? "Vendor"}
                </Link>
                {g.vendor?.status === "verified" && <VerifiedBadge />}
              </div>
              <p className="label text-ink/60">
                Vendor subtotal {formatPrice(g.subtotal)}
              </p>
            </div>

            {g.rows.map(({ line, listing }) => (
              <div
                key={listing.id}
                className="flex gap-3 rounded-3xl border border-ink/30 bg-cream p-3 sm:gap-4"
              >
                <PhotoPlaceholder
                  listing={listing}
                  className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24 [&_.plate-label]:hidden"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="font-semibold text-ink hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-ink/60">
                    Pickup {listing.pickupDate}, {listing.pickupSlot}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center rounded-full border border-ink bg-white">
                      <button
                        type="button"
                        onClick={() => setQty(listing.id, line.qty - 1)}
                        className="h-8 w-8 rounded-l-full hover:bg-lime/50"
                        aria-label="Decrease quantity"
                      >
                        <span className="mx-auto block h-0.5 w-3 rounded bg-ink" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQty(listing.id, Math.min(20, line.qty + 1))
                        }
                        className="h-8 w-8 rounded-r-full hover:bg-lime/50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-ink">
                      {formatPrice(listing.price * line.qty)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(listing.id)}
                  className="label shrink-0 self-start p-1 text-ink/50 hover:text-ink hover:underline"
                  aria-label={`Remove ${listing.title}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>
        ))}
      </div>

      <aside className="h-fit space-y-4 rounded-3xl border-2 border-ink bg-white p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-3xl text-ink">Kain Tayo checkout</h2>
        <p className="label text-ink/60">
          Kain Tayo only holds your payment. The food is made and sold by each
          vendor.
        </p>

        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.slug}
              className="flex justify-between gap-3 text-ink/80"
            >
              <span>{g.vendor?.name ?? "Vendor"}</span>
              <span>{formatPrice(g.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t border-ink/20 pt-3 text-lg font-bold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <p className="rounded-xl border-2 border-ink bg-mint p-3 text-sm text-ink">
          {many
            ? `This checkout makes ${groups.length} separate orders, one for each vendor. Each is paid and picked up separately, so you get ${groups.length} QR codes.`
            : "Your order is paid to this vendor and picked up from them."}
        </p>

        <button
          type="button"
          onClick={pay}
          className="w-full rounded-full btn-primary px-6 py-3"
        >
          Pay {formatPrice(total)}
        </button>
        <p className="text-xs text-ink/60">
          This is a demo. No real payment is taken. In the real app your money
          would be held safely until pickup.
        </p>
      </aside>
    </div>
  );
}
