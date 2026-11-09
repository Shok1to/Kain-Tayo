"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FakeQr from "@/components/FakeQr";
import { ORDER_KEY } from "@/components/CartProvider";
import { usePlatform } from "@/components/PlatformProvider";
import { Order, formatPrice, pickupLines, seedOrders } from "@/data/mock";

// Shown if someone opens this page without checking out first:
// two of the built in pretend orders, from two different vendors.
function demoOrders(): Order[] {
  return seedOrders.filter((o) => ["KT4821", "KT4811"].includes(o.code));
}

// The saved checkout must be a list of orders. Anything else is ignored.
function isOrderList(value: unknown): value is Order[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((o) => o && typeof o.code === "string" && o.vendorSlug)
  );
}

export default function ConfirmationPage() {
  const { getVendor } = usePlatform();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let found: Order[] | null = null;
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isOrderList(parsed)) found = parsed;
      }
    } catch {
      // ignore
    }
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsDemo(!found);
    setOrders(found ?? demoOrders());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!orders) return <p className="py-10 text-ink/60">Loading...</p>;

  const many = orders.length > 1;
  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <p className="label">
          {isDemo ? "Sample orders" : "Thank you for your preorder"}
        </p>
        <h1 className="font-display mt-2 text-5xl leading-none text-ink">
          {many ? `${orders.length} orders confirmed` : "Order confirmed"}
        </h1>
        <p className="mt-3 text-ink/70">
          {many
            ? `You ordered from ${orders.length} vendors, so you have ${orders.length} QR codes. Each order is paid and picked up separately.`
            : "Show your QR code to the vendor when you pick up your food."}
        </p>
      </div>

      {orders.map((order) => {
        const vendor = getVendor(order.vendorSlug);
        return (
          <section
            key={order.code}
            className="overflow-hidden rounded-[2rem] border-2 border-ink bg-white"
          >
            <div className="flex flex-col items-center gap-3 bg-ink p-6 text-center text-cream">
              <p className="label text-lime">
                Pick up from {vendor?.name ?? "your vendor"}
              </p>
              <div className="rounded-2xl bg-white p-2">
                <FakeQr seed={order.code} />
              </div>
              <p className="text-sm text-cream/80">
                Show this QR code to the vendor at pickup.
              </p>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="label text-ink/60">Order {order.code}</p>
                <p className="font-display text-3xl leading-none text-ink">
                  {formatPrice(order.total)}
                </p>
              </div>
              <ul className="space-y-1 text-ink">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4 text-sm">
                    <span>
                      {item.qty} x {item.title}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-ink/20 pt-3">
                {pickupLines(order).map((line) => (
                  <p key={line} className="label text-ink/70">
                    Pickup {line}
                  </p>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <div className="rounded-3xl border-2 border-ink bg-mint p-5 text-ink">
        <p className="font-semibold">Your payment is held safely</p>
        <p className="mt-1 text-sm">
          Your money stays in the Kain Tayo vault until pickup. Each vendor gets
          a small advance to buy ingredients, and the rest is only released
          after they scan your QR code. If anything goes wrong, you are
          protected.
        </p>
      </div>

      {many && (
        <div className="flex justify-between rounded-3xl border-2 border-ink bg-white p-5 font-bold text-ink">
          <span>Total paid</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      )}

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
