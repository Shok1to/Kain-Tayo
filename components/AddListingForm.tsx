"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatform } from "./PlatformProvider";
import { PhotoPlaceholder, TagPill } from "./ui";
import { ALL_TAGS, DietaryTag, Listing, formatPrice } from "@/data/mock";
import { formatCutoff, formatDay, formatTime } from "@/data/format";

// The colors a vendor can pick for their photo placeholder tile.
const TILE_COLORS = [
  { cls: "bg-lime", name: "Lime" },
  { cls: "bg-mango", name: "Mango" },
  { cls: "bg-ube", name: "Ube" },
  { cls: "bg-tomato", name: "Tomato" },
  { cls: "bg-mint", name: "Mint" },
];

type Errors = Partial<
  Record<"title" | "price" | "date" | "start" | "end" | "cutoff", string>
>;

const fieldClass =
  "mt-1 w-full rounded-xl border border-ink bg-white px-4 py-3 outline-none focus:bg-lime/40";

export default function AddListingForm() {
  const { currentVendor, ready, addListing } = usePlatform();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<DietaryTag[]>([]);
  const [tile, setTile] = useState(TILE_COLORS[0].cls);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [cutoff, setCutoff] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [added, setAdded] = useState<Listing | null>(null);

  if (!ready) return <p className="py-10 text-ink/60">Loading...</p>;

  // ---------- guards: you must be a logged in, verified vendor ----------
  if (!currentVendor) {
    return (
      <Notice title="Please log in first">
        Pick a vendor on the dashboard, then come back to add a listing.
        <Link href="/vendor/dashboard" className="btn-primary mt-5 px-6 py-3">
          Go to vendor login
        </Link>
      </Notice>
    );
  }
  if (currentVendor.status !== "verified") {
    return (
      <Notice title="Locked until verified">
        {currentVendor.name} is still pending verification. Listings unlock as
        soon as your food handler certificate is approved.
        <Link href="/vendor/dashboard" className="btn-primary mt-5 px-6 py-3">
          Back to dashboard
        </Link>
      </Notice>
    );
  }

  const vendor = currentVendor;

  function toggleTag(tag: DietaryTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function reset() {
    setTitle("");
    setPrice("");
    setDescription("");
    setTags([]);
    setDate("");
    setStart("");
    setEnd("");
    setCutoff("");
    setErrors({});
    setAdded(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const priceNumber = Number(price);

    if (!title.trim()) next.title = "Please enter a title.";
    if (!price || !(priceNumber > 0)) next.price = "Enter a price above zero.";
    if (!date) next.date = "Pick a pickup date.";
    if (!start) next.start = "Pick a start time.";
    if (!end) next.end = "Pick an end time.";
    if (start && end && end <= start) next.end = "End must be after the start.";
    if (!cutoff) next.cutoff = "Pick an order cutoff.";
    // The cutoff has to come before the pickup begins.
    if (cutoff && date && start && cutoff >= `${date}T${start}`) {
      next.cutoff = "The cutoff must be before pickup starts.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const created = addListing({
      title: title.trim(),
      description:
        description.trim() || `${title.trim()} made by ${vendor.name}.`,
      price: Math.round(priceNumber * 100) / 100,
      unit: "each",
      tags,
      bg: tile,
      vendorSlug: vendor.slug,
      pickupDate: formatDay(date),
      pickupSlot: `${formatTime(start)} to ${formatTime(end)}`,
      cutoff: formatCutoff(cutoff),
    });
    setAdded(created);
    window.scrollTo({ top: 0 });
  }

  // ---------- success screen ----------
  if (added) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="label text-ink/60">Listing added</p>
          <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
            It is <em className="italic">live.</em>
          </h1>
          <p className="mt-3 text-ink/80">
            Your listing now shows on the home page, in search, and on your
            storefront.
          </p>
        </div>

        <div className="flex gap-4 rounded-3xl border-2 border-ink bg-white p-3">
          <PhotoPlaceholder
            listing={added}
            className="h-24 w-24 shrink-0 rounded-2xl [&_.plate-label]:hidden"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl leading-tight text-ink">
              {added.title}
            </p>
            <p className="label mt-1 text-ink/70">
              {added.pickupDate}, {added.pickupSlot}
            </p>
            <p className="label text-ink/50">Cutoff {added.cutoff}</p>
          </div>
          <p className="label shrink-0 text-base font-bold">
            {formatPrice(added.price)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/listing/${added.id}`} className="btn-primary px-6 py-3">
            View listing
          </Link>
          <button type="button" onClick={reset} className="btn-ghost px-6 py-3">
            Add another
          </button>
          <Link href="/vendor/dashboard" className="btn-ghost px-6 py-3">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---------- the form ----------
  return (
    <div className="space-y-6">
      <div>
        <p className="label text-ink/60">Adding for {vendor.name}</p>
        <h1 className="font-display mt-2 text-5xl leading-none text-ink sm:text-6xl">
          Add a <em className="italic">listing</em>
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={submit}
          noValidate
          className="space-y-5 rounded-3xl border-2 border-ink bg-white p-5 sm:p-6"
        >
          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chicken Adobo Party Tray"
              className={fieldClass}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <label htmlFor="price" className="label">
              Price in Canadian dollars
            </label>
            <input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="45"
              className={fieldClass}
            />
            <FieldError message={errors.price} />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is in it, how many people it feeds"
              className={fieldClass}
            />
          </div>

          <div>
            <p className="label">Photo placeholder</p>
            <p className="mt-1 text-xs text-ink/60">
              Real photo upload comes later. For now pick a tile color.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {TILE_COLORS.map((c) => (
                <button
                  key={c.cls}
                  type="button"
                  onClick={() => setTile(c.cls)}
                  aria-pressed={tile === c.cls}
                  aria-label={c.name}
                  className={`h-12 w-12 rounded-full border-2 border-ink ${c.cls} transition ${
                    tile === c.cls
                      ? "scale-110 shadow-[3px_3px_0_var(--color-ink)]"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="label">Dietary tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={on}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      on
                        ? "border-ink btn-primary"
                        : "border-ink bg-cream text-ink hover:bg-lime"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className="label">
                Pickup date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
              />
              <FieldError message={errors.date} />
            </div>
            <div>
              <label htmlFor="start" className="label">
                Slot starts
              </label>
              <input
                id="start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={fieldClass}
              />
              <FieldError message={errors.start} />
            </div>
            <div>
              <label htmlFor="end" className="label">
                Slot ends
              </label>
              <input
                id="end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={fieldClass}
              />
              <FieldError message={errors.end} />
            </div>
          </div>

          <div>
            <label htmlFor="cutoff" className="label">
              Order cutoff
            </label>
            <input
              id="cutoff"
              type="datetime-local"
              value={cutoff}
              onChange={(e) => setCutoff(e.target.value)}
              className={fieldClass}
            />
            <FieldError message={errors.cutoff} />
            <p className="mt-2 text-xs text-ink/60">
              Orders close at this time. Set it at least 48 hours before pickup
              so you receive the 30% advance.
            </p>
          </div>

          <button type="submit" className="btn-primary w-full px-6 py-3.5">
            Publish listing
          </button>
        </form>

        {/* live preview */}
        <aside className="h-fit space-y-3 lg:sticky lg:top-28">
          <p className="label text-ink/60">Preview</p>
          <PhotoPlaceholder
            listing={{ bg: tile, title: title || "Your listing" }}
            className="aspect-square rounded-[2rem] border-2 border-ink"
          />
          <div className="flex items-baseline justify-between gap-3 px-1">
            <p className="font-display text-2xl leading-tight text-ink">
              {title || "Your listing title"}
            </p>
            <p className="label shrink-0 text-base font-bold">
              {price && Number(price) > 0 ? formatPrice(Number(price)) : "$0.00"}
            </p>
          </div>
          <p className="label px-1 text-ink/70">By {vendor.name}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 px-1">
              {tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-700">{message}</p> : null;
}

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border-2 border-ink bg-white p-8 text-center">
      <h1 className="font-display text-5xl leading-none text-ink">{title}</h1>
      <div className="mt-4 flex flex-col items-center text-ink/80">
        {children}
      </div>
    </div>
  );
}
