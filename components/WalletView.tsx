"use client";

import Link from "next/link";
import { usePlatform } from "./PlatformProvider";
import { Order, formatPrice, orderMoney, pickupLines } from "@/data/mock";
import { advanceReleaseTime } from "@/data/format";

// The seller wallet. It is tied to whoever is logged in on the dashboard.
// Mock only: nothing here moves real money. The numbers come from the vendor's
// orders, split 30% (advance) and 70% (after the QR scan).
export default function WalletView() {
  const { currentVendor, getOrdersByVendor, ready } = usePlatform();

  if (!ready) return <p className="py-10 text-ink/60">Loading...</p>;

  if (!currentVendor) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border-2 border-ink bg-white p-8 text-center">
        <h1 className="font-display text-5xl leading-none text-ink">
          Log in to see your wallet
        </h1>
        <p className="mt-4 text-ink/80">
          The wallet belongs to a vendor. Pick a vendor on the dashboard first.
        </p>
        <Link
          href="/vendor/dashboard"
          className="btn-primary mt-5 px-6 py-3"
        >
          Go to vendor login
        </Link>
      </div>
    );
  }

  const vendor = currentVendor;
  const orders = getOrdersByVendor(vendor.slug);

  // Add up the money across every order.
  const totals = orders.reduce(
    (sum, o) => {
      const m = orderMoney(o);
      return {
        released: sum.released + m.released,
        held: sum.held + m.held,
        all: sum.all + o.total,
      };
    },
    { released: 0, held: 0, all: 0 },
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-mango" />
        <p className="relative text-sm text-cream/70">Seller wallet</p>
        <h1 className="font-display relative mt-1 text-5xl leading-none">
          {vendor.name}
        </h1>
        <p className="relative mt-4 text-sm text-cream/70">Available now</p>
        <p className="font-display relative text-5xl text-lime">
          {formatPrice(totals.released)}
        </p>
        <p className="relative mt-1 text-xs text-cream/70">
          Demo view, pretend money.{" "}
          <Link href="/vendor/dashboard" className="underline">
            Not you? Switch vendor
          </Link>
        </p>
      </div>

      {vendor.status !== "verified" && (
        <div className="rounded-3xl border-2 border-dashed border-ink bg-mango/40 p-5 text-sm text-ink">
          <p className="label">Verification pending</p>
          <p className="mt-1">
            Your wallet starts filling once you are verified and buyers order
            from you.{" "}
            <Link href="/vendor/dashboard" className="font-semibold underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border-2 border-ink bg-mint p-4">
          <p className="text-xs uppercase tracking-wide text-ink">
            Available now
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(totals.released)}
          </p>
        </div>
        <div className="rounded-3xl border-2 border-ink bg-mango p-4">
          <p className="text-xs uppercase tracking-wide text-ink">
            Held in vault
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(totals.held)}
          </p>
        </div>
        <div className="rounded-3xl border-2 border-ink bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-ink/60">
            All orders
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPrice(totals.all)}
          </p>
        </div>
      </div>

      <p className="text-sm text-ink/70">
        How it works: 30% of each order is released to you 48 hours before
        pickup, so you can buy ingredients. The other 70% is released the moment
        you scan the buyer&apos;s QR code.
      </p>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderMoneyCard key={o.code} order={o} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-ink bg-white p-8 text-center text-ink/70">
          No orders yet. When buyers order from you, each order shows up here
          with its 30% and 70% payments.
        </div>
      )}
    </div>
  );
}

// One order, with its two payments.
function OrderMoneyCard({ order }: { order: Order }) {
  const money = orderMoney(order);
  const advanceDone = order.status !== "paid";
  const restDone = order.status === "completed";
  const releaseTime = advanceReleaseTime(order.pickupDate, order.pickupSlot);

  return (
    <div className="space-y-5 rounded-3xl border-2 border-ink bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="label text-ink/60">
            Order {order.code} from {order.buyerName}
          </p>
          <ul className="mt-1 space-y-0.5 text-ink">
            {order.items.map((it, i) => (
              <li key={i}>
                {it.qty} x {it.title}
              </li>
            ))}
          </ul>
          {pickupLines(order).map((line) => (
            <p key={line} className="label mt-1 text-ink/60">
              Pickup {line}
            </p>
          ))}
        </div>
        <p className="font-display text-3xl leading-none text-ink">
          {formatPrice(order.total)}
        </p>
      </div>

      {/* Simple bar showing the 30 and 70 split */}
      <div className="flex h-6 overflow-hidden rounded-full border-2 border-ink text-[11px] font-bold text-ink">
        <div
          className={`flex w-[30%] items-center justify-center border-r-2 border-ink ${advanceDone ? "bg-mint" : "bg-white"}`}
        >
          30%
        </div>
        <div
          className={`flex w-[70%] items-center justify-center ${restDone ? "bg-mint" : "bg-mango"}`}
        >
          70%
        </div>
      </div>

      <ol className="space-y-4">
        <li className="flex gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-ink ${advanceDone ? "bg-mint" : "bg-white"}`}
          >
            1
          </span>
          <div>
            <p className="font-semibold text-ink">
              30% advance {advanceDone ? "released" : "scheduled"}:{" "}
              {formatPrice(money.advance)}
            </p>
            <p className="text-sm text-ink/70">
              {advanceDone
                ? "Sent to your wallet 48 hours before pickup"
                : "Will be sent to your wallet 48 hours before pickup"}
              {releaseTime ? `, on ${releaseTime}` : ""}, so you can buy
              ingredients.
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-ink ${restDone ? "bg-mint" : "bg-mango"}`}
          >
            2
          </span>
          <div>
            <p className="font-semibold text-ink">
              70% released after QR scan: {formatPrice(money.rest)}
            </p>
            <p className="text-sm text-ink/70">
              {restDone
                ? "The buyer picked up and you scanned their QR code, so the rest was released."
                : "Waiting for pickup. The money unlocks the moment you scan the buyer’s QR code."}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
