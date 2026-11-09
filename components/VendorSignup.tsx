"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatform } from "./PlatformProvider";
import VendorBanner from "./VendorBanner";
import { Avatar, VerifiedBadge } from "./ui";
import { CUISINES } from "@/data/mock";

type Errors = { name?: string; owner?: string; certificate?: string };

const fieldClass =
  "mt-1 w-full rounded-xl border border-ink bg-white px-4 py-3 outline-none focus:bg-lime/40";

// The three screens of vendor signup are not three pages. It is one page that
// shows a different screen depending on what has happened so far:
//   1. no vendor made yet           -> the form
//   2. vendor made, "pending"       -> the Pending verification screen
//   3. vendor made, "verified"      -> the Verified screen
export default function VendorSignup() {
  const { createVendor, approveVendor, getVendor, login } = usePlatform();

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [certificate, setCertificate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const vendor = createdSlug ? getVendor(createdSlug) : undefined;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your business name.";
    if (!owner.trim()) next.owner = "Please enter the owner's name.";
    if (!certificate) next.certificate = "Please choose your certificate file.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const created = createVendor({
      name: name.trim(),
      ownerName: owner.trim(),
      cuisine,
      certificateFile: certificate,
    });
    login(created.slug); // a new vendor is logged in right away
    setCreatedSlug(created.slug);
    window.scrollTo({ top: 0 });
  }

  // ---------- screen 3: verified ----------
  if (vendor && vendor.status === "verified") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="label text-ink/60">Step 3 of 3</p>
          <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
            You are <em className="italic">verified.</em>
          </h1>
          <p className="mt-3 text-ink/80">
            Your food handler certificate was approved. Your storefront now shows
            the badge, and you can start taking preorders.
          </p>
        </div>
        <VendorCard vendor={vendor} />
        <div className="flex flex-wrap gap-3">
          <Link href="/vendor/dashboard" className="btn-primary px-6 py-3">
            Go to my dashboard
          </Link>
          <Link href={`/vendors/${vendor.slug}`} className="btn-ghost px-6 py-3">
            View my storefront
          </Link>
        </div>
      </div>
    );
  }

  // ---------- screen 2: pending ----------
  if (vendor) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="label text-ink/60">Step 2 of 3</p>
          <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
            Pending <em className="italic">verification</em>
          </h1>
          <p className="mt-3 text-ink/80">
            Thank you, {vendor.ownerName}. Kain Tayo received your application
            and a reviewer is checking your food handler certificate. This
            usually takes 1 to 2 business days.
          </p>
        </div>

        <VendorCard vendor={vendor} />

        <div className="rounded-3xl border-2 border-ink bg-white p-5">
          <p className="label text-ink/60">Certificate received</p>
          <p className="mt-1 break-all font-semibold text-ink">
            {vendor.certificateFile}
          </p>
          <p className="mt-3 text-sm text-ink/70">
            You cannot add listings or take orders until this is approved.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-dashed border-ink bg-mango/40 p-5">
          <p className="label">Demo only</p>
          <p className="mt-1 text-sm text-ink/80">
            In the real app a person checks your certificate. For this
            prototype, press the button to pretend that happened.
          </p>
          <button
            type="button"
            onClick={() => approveVendor(vendor.slug)}
            className="btn-primary mt-4 px-6 py-3"
          >
            Fake approval
          </button>
        </div>

        <Link href="/vendor/dashboard" className="btn-ghost px-6 py-3">
          Go to my dashboard
        </Link>
      </div>
    );
  }

  // ---------- screen 1: the form ----------
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="label text-ink/60">Step 1 of 3</p>
        <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
          Become a <em className="italic">vendor</em>
        </h1>
        <p className="mt-3 text-ink/80">
          Open your own shop on the Kain Tayo marketplace, list your weekend
          preorders, and get paid safely. Tell Kain Tayo about your kitchen to
          get started.
        </p>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="space-y-5 rounded-3xl border-2 border-ink bg-white p-5 sm:p-6"
      >
        <div>
          <label htmlFor="name" className="label">
            Business name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mama Lita's Eats"
            className={fieldClass}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-700">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="owner" className="label">
            Owner name
          </label>
          <input
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Lita Cruz"
            className={fieldClass}
          />
          {errors.owner && (
            <p className="mt-1 text-sm text-red-700">{errors.owner}</p>
          )}
        </div>

        <div>
          <label htmlFor="cuisine" className="label">
            Cuisine type
          </label>
          <select
            id="cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className={fieldClass}
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="certificate" className="label">
            Food handler certificate
          </label>
          {/* The file is never uploaded anywhere. We only keep its name. */}
          <label
            htmlFor="certificate"
            className="mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-ink bg-cream px-4 py-6 text-center transition hover:bg-lime/40"
          >
            <span className="btn-ghost px-4 py-1.5 text-xs">Choose a file</span>
            <span className="mt-2 break-all text-sm text-ink/80">
              {certificate || "PDF, JPG or PNG. No file chosen yet."}
            </span>
          </label>
          <input
            id="certificate"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => setCertificate(e.target.files?.[0]?.name ?? "")}
          />
          {errors.certificate && (
            <p className="mt-1 text-sm text-red-700">{errors.certificate}</p>
          )}
          <p className="mt-2 text-xs text-ink/60">
            Prototype note: nothing is uploaded. Only the file name is shown.
          </p>
        </div>

        <button type="submit" className="btn-primary w-full px-6 py-3.5">
          Submit for verification
        </button>
      </form>
    </div>
  );
}

// A small preview of the storefront the vendor just created.
function VendorCard({
  vendor,
}: {
  vendor: NonNullable<ReturnType<ReturnType<typeof usePlatform>["getVendor"]>>;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-ink bg-white">
      <VendorBanner
        vendor={vendor}
        className="h-32"
        letterSize="text-[6rem]"
      />
      <div className="flex items-center gap-4 p-4">
        <Avatar name={vendor.name} brand={vendor.brand} className="h-14 w-14 text-2xl" />
        <div className="space-y-1">
          <p className="font-display text-3xl leading-none text-ink">
            {vendor.name}
          </p>
          <p className="label text-ink/60">{vendor.cuisine}</p>
          {vendor.status === "verified" ? (
            <VerifiedBadge />
          ) : (
            <span className="label inline-block rounded-full bg-mango px-2.5 py-1 ring-2 ring-ink">
              Pending verification
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
