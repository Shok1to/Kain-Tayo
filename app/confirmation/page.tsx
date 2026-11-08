"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FakeQr from "@/components/FakeQr";
import { ORDER_KEY } from "@/components/CartProvider";
import { formatPrice, getListing, getSeller } from "@/data/mock";

type Order = {
  code: string;
  total: number;
  items: {
    title: string;
    qty: number;
    price: number;
    seller: string;
    pickupDate: string;
    pickupSlot: string;
  }[];
};

// Shown if someone opens this page without checking out first.
function demoOrder(): Order {
  const l = getListing("wholelechon")!;
  return {
    code: "KT4821",
    total: l.price,
    items: [
      {
        title: l.title,
        qty: 1,
        price: l.price,
        seller: getSeller(l.sellerId)?.name ?? "",
        pickupDate: l.pickupDate,
        pickupSlot: l.pickupSlot,
      },
    ],
  };
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let found: Order | null = null;
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (saved) found = JSON.parse(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(found ?? demoOrder());
  }, []);

  if (!order) return <p className="py-10 text-ink/60">Loading...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <p className="label">Thank you for your preorder</p>
        <h1 className="font-display mt-2 text-5xl leading-none  text-ink">
          Order confirmed
        </h1>
        <p className="mt-1 text-ink/70">
          Order number <span className="font-semibold">{order.code}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-[2rem] bg-ink p-6 text-cream ">
        <div className="rounded-3xl bg-white p-2 "><FakeQr seed={order.code} /></div>
        <p className="text-center text-sm text-cream/70">
          Show this QR code to your seller when you pick up your food.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-ink bg-mint p-5 text-ink">
        <p className="font-semibold">Your payment is held safely</p>
        <p className="mt-1 text-sm">
          Your money stays in the Kain Tayo vault until pickup. The seller gets a
          small advance to buy ingredients, and the rest is only released after
          they scan your QR code. If anything goes wrong, you are protected.
        </p>
      </div>

      <div className="space-y-3 rounded-3xl bg-white p-5 border-2 border-ink">
        <h2 className="font-display text-3xl text-ink">Your order</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-ink">
                {item.qty} x {item.title}
              </p>
              <p className="text-ink/60">
                {item.seller}. Pickup {item.pickupDate}, {item.pickupSlot}
              </p>
            </div>
            <p className="font-semibold">
              {formatPrice(item.price * item.qty)}
            </p>
          </div>
        ))}
        <div className="flex justify-between border-t border-ink/20 pt-3 font-bold">
          <span>Total paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block rounded-full btn-primary px-6 py-3"
        >
          Back to listings
        </Link>
      </div>
    </div>
  );
}
