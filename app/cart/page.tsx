"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ORDER_KEY, useCart } from "@/components/CartProvider";
import { PhotoPlaceholder } from "@/components/ui";
import { formatPrice, getListing, getSeller } from "@/data/mock";

export default function CartPage() {
  const { lines, ready, total, setQty, remove, clear } = useCart();
  const router = useRouter();

  const items = lines.flatMap((line) => {
    const listing = getListing(line.listingId);
    return listing ? [{ line, listing }] : [];
  });

  function pay() {
    // Fake payment: save a summary so the confirmation page can show it.
    const order = {
      code: `KT${1000 + ((Math.round(total) * 37 + lines.length * 101) % 9000)}`,
      total,
      items: items.map(({ line, listing }) => ({
        title: listing.title,
        qty: line.qty,
        price: listing.price,
        seller: getSeller(listing.sellerId)?.name ?? "",
        pickupDate: listing.pickupDate,
        pickupSlot: listing.pickupSlot,
      })),
    };
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      // ignore storage problems
    }
    clear();
    router.push("/confirmation");
  }

  if (!ready) {
    return <p className="py-10 text-ink/60">Loading your cart...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink bg-white p-12 text-center">
                <h1 className="font-display mt-3 text-5xl leading-none  text-ink">
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

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="font-display text-5xl leading-none  text-ink">Your cart</h1>
        {items.map(({ line, listing }) => (
          <div
            key={listing.id}
            className="flex gap-4 rounded-3xl bg-white p-3 border-2 border-ink"
          >
            <PhotoPlaceholder
              listing={listing}
              className="h-24 w-24 shrink-0 rounded-xl [&_.plate-label]:hidden"
            />
            <div className="flex flex-1 flex-col gap-1">
              <Link
                href={`/listing/${listing.id}`}
                className="font-semibold text-ink hover:underline"
              >
                {listing.title}
              </Link>
              <p className="text-sm text-ink/60">
                {getSeller(listing.sellerId)?.name}
              </p>
              <p className="text-xs text-ink/60">
                Pickup {listing.pickupDate}, {listing.pickupSlot}
              </p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <div className="flex items-center rounded-full border border-ink">
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
                    onClick={() => setQty(listing.id, Math.min(20, line.qty + 1))}
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
              className="label self-start p-1 text-ink/50 hover:text-ink hover:underline"
              aria-label={`Remove ${listing.title}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit space-y-4 rounded-3xl bg-white p-5 border-2 border-ink">
        <h2 className="font-display text-3xl  text-ink">Checkout</h2>
        <div className="flex justify-between text-ink/80">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between border-t border-ink/20 pt-3 text-lg font-bold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
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
