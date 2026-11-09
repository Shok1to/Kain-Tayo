"use client";

import Link from "next/link";
import { usePlatform } from "./PlatformProvider";
import { Avatar, PhotoPlaceholder, VerifiedBadge } from "./ui";
import {
  ORDER_STATUS_LABEL,
  OrderStatus,
  Vendor,
  formatPrice,
  pickupLines,
} from "@/data/mock";

const statusColor: Record<OrderStatus, string> = {
  paid: "bg-mango",
  advance: "bg-lime",
  completed: "bg-mint",
};

// The dashboard page shows one of two things:
//   nobody logged in -> a "pick who you are" screen (no password, it is fake)
//   someone logged in -> that vendor's dashboard
export default function VendorDashboard() {
  const { currentVendor, ready } = usePlatform();

  if (!ready) return <p className="py-10 text-ink/60">Loading...</p>;
  if (!currentVendor) return <FakeLogin />;
  return <Dashboard vendor={currentVendor} />;
}

// ---------- the fake login ----------
function FakeLogin() {
  const { vendors, login } = usePlatform();

  return (
    <div className="space-y-8">
      <div>
        <p className="label text-ink/60">Vendor dashboard</p>
        <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
          Log in <em className="italic">as a vendor</em>
        </h1>
        <p className="mt-3 max-w-lg text-ink/80">
          This is a demo, so there is no password. Pick a vendor to see their
          dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v) => (
          <button
            key={v.slug}
            type="button"
            onClick={() => login(v.slug)}
            className="flex items-center gap-4 rounded-3xl border-2 border-ink bg-white p-4 text-left transition hover:-translate-x-1 hover:-translate-y-1 hover:bg-lime/40 hover:shadow-[6px_6px_0_var(--color-ink)]"
          >
            <Avatar name={v.name} brand={v.brand} className="h-14 w-14 text-2xl" />
            <span>
              <span className="font-display block text-2xl leading-tight text-ink">
                {v.name}
              </span>
              <span className="label text-ink/60">
                {v.status === "verified" ? v.cuisine : "Pending verification"}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-ink/70">
        New here?{" "}
        <Link href="/vendor/signup" className="font-semibold underline">
          Sign up as a vendor
        </Link>
      </p>
    </div>
  );
}

// ---------- the dashboard ----------
function Dashboard({ vendor }: { vendor: Vendor }) {
  const { getListingsByVendor, getOrdersByVendor, logout, approveVendor } =
    usePlatform();
  const listings = getListingsByVendor(vendor.slug);
  const orders = getOrdersByVendor(vendor.slug);
  const sales = orders.reduce((sum, o) => sum + o.total, 0);
  const verified = vendor.status === "verified";

  return (
    <div className="space-y-10">
      {/* ---------- who is logged in ---------- */}
      <section className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={vendor.name} brand={vendor.brand} className="h-16 w-16 text-3xl" />
          <div className="space-y-1">
            <p className="label text-ink/60">Logged in as</p>
            <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">
              {vendor.name}
            </h1>
            {verified ? (
              <VerifiedBadge />
            ) : (
              <span className="label inline-block rounded-full bg-mango px-2.5 py-1 ring-2 ring-ink">
                Pending verification
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vendors/${vendor.slug}`} className="btn-ghost px-5 py-2.5">
            View storefront
          </Link>
          <Link href="/wallet" className="btn-ghost px-5 py-2.5">
            My wallet
          </Link>
          <button
            type="button"
            onClick={logout}
            className="btn-ghost px-5 py-2.5"
          >
            Log out
          </button>
        </div>
      </section>

      {/* ---------- pending notice ---------- */}
      {!verified && (
        <section className="rounded-3xl border-2 border-dashed border-ink bg-mango/40 p-5">
          <p className="label">Your application is pending</p>
          <p className="mt-1 max-w-xl text-sm text-ink/80">
            You cannot add listings or take orders until your food handler
            certificate is approved.
            {vendor.certificateFile && ` Kain Tayo has ${vendor.certificateFile} on file.`}
          </p>
          <p className="mt-3 text-sm text-ink/80">
            Demo only: press the button to pretend a reviewer approved it.
          </p>
          <button
            type="button"
            onClick={() => approveVendor(vendor.slug)}
            className="btn-primary mt-3 px-6 py-3"
          >
            Fake approval
          </button>
        </section>
      )}

      {/* ---------- numbers ---------- */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          ["Listings", String(listings.length), "bg-lime"],
          ["Orders", String(orders.length), "bg-mango"],
          ["Sales", formatPrice(sales), "bg-ube"],
        ].map(([label, value, bg]) => (
          <div
            key={label}
            className={`rounded-3xl border-2 border-ink p-4 ${bg}`}
          >
            <p className="label text-ink/70">{label}</p>
            <p className="font-display mt-1 text-4xl leading-none text-ink sm:text-5xl">
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* ---------- listings ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-4xl leading-none text-ink">
            Your listings
          </h2>
          {verified ? (
            <Link href="/vendor/dashboard/new" className="btn-primary px-6 py-3">
              Add new listing
            </Link>
          ) : (
            <span className="label rounded-full border-2 border-dashed border-ink px-4 py-2 text-ink/60">
              Add listing unlocks when verified
            </span>
          )}
        </div>

        {listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="group flex gap-4 rounded-3xl border-2 border-ink bg-white p-3"
              >
                <PhotoPlaceholder
                  listing={l}
                  className="h-24 w-24 shrink-0 rounded-2xl [&_.plate-label]:hidden"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/listing/${l.id}`}
                    className="font-display text-2xl leading-tight text-ink hover:underline"
                  >
                    {l.title}
                  </Link>
                  <p className="label mt-1 text-ink/70">
                    {l.pickupDate}, {l.pickupSlot}
                  </p>
                  <p className="label text-ink/50">Cutoff {l.cutoff}</p>
                </div>
                <p className="label shrink-0 text-base font-bold">
                  {formatPrice(l.price)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-ink bg-white p-8 text-center text-ink/70">
            {verified
              ? "You have no listings yet. Add your first one."
              : "No listings yet."}
          </div>
        )}
      </section>

      {/* ---------- orders ---------- */}
      <section>
        <h2 className="font-display mb-4 text-4xl leading-none text-ink">
          Your orders
        </h2>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.code}
                className="rounded-3xl border-2 border-ink bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="label text-ink/60">
                      Order {o.code} from {o.buyerName}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-ink">
                      {o.items.map((it, i) => (
                        <li key={i}>
                          {it.qty} x {it.title}
                        </li>
                      ))}
                    </ul>
                    {pickupLines(o).map((line) => (
                      <p key={line} className="label mt-1 text-ink/60">
                        Pickup {line}
                      </p>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl leading-none text-ink">
                      {formatPrice(o.total)}
                    </p>
                    <span
                      className={`label mt-2 inline-block rounded-full px-2.5 py-1 ring-2 ring-ink ${statusColor[o.status]}`}
                    >
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-ink bg-white p-8 text-center text-ink/70">
            No orders yet. When a buyer orders from you, it shows up here.
          </div>
        )}
      </section>
    </div>
  );
}
