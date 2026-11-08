"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCart({ listingId }: { listingId: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-ink/80">Quantity</span>
        <div className="flex items-center rounded-full border border-ink">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 text-xl text-ink/80 hover:bg-lime/50 rounded-l-full"
            aria-label="Decrease quantity"
          >
            <span className="mx-auto block h-0.5 w-3.5 rounded bg-ink" />
          </button>
          <span className="w-10 text-center font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="h-10 w-10 text-xl text-ink/80 hover:bg-lime/50 rounded-r-full"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          add(listingId, qty);
          setAdded(true);
        }}
        className="w-full rounded-full btn-primary px-6 py-3 sm:w-auto"
      >
        Add to cart
      </button>

      {added && (
        <p className="text-sm text-ink">
          Added to your cart.{" "}
          <Link href="/cart" className="font-semibold underline">
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
