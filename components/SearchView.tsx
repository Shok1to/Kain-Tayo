"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_TAGS, DietaryTag } from "@/data/mock";
import { usePlatform } from "./PlatformProvider";
import ListingCard from "./ListingCard";

function SearchInner({ initialQuery }: { initialQuery: string }) {
  const { listings, getVendor } = usePlatform();
  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<DietaryTag[]>([]);

  function toggleTag(tag: DietaryTag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return listings.filter((l) => {
      const haystack = [
        l.title,
        l.description,
        getVendor(l.vendorSlug)?.name ?? "",
        ...l.tags,
      ]
        .join(" ")
        .toLowerCase();
      const matchesWords = words.every((w) => haystack.includes(w));
      const matchesTags = activeTags.every((t) => l.tags.includes(t));
      return matchesWords && matchesTags;
    });
  }, [query, activeTags, listings, getVendor]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl leading-none  text-ink">Search</h1>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try lechon, flan, or Brampton"
          className="mt-3 w-full rounded-xl border border-ink bg-white px-4 py-3 outline-none focus:bg-lime/40"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink/80">Dietary tags</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => {
            const on = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  on
                    ? "border-ink btn-primary"
                    : "border-ink bg-cream text-ink hover:border-ink"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="px-2 text-sm text-ink/60 underline"
            >
              Clear tags
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-ink/70">
        {results.length} {results.length === 1 ? "listing" : "listings"} found
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink bg-white p-10 text-center text-ink/70">
          Nothing matches yet. Try fewer words or clear a tag.
        </div>
      )}
    </div>
  );
}

// Reads ?q= from the address bar. The key restarts the filters whenever
// the header search sends you here with a new word.
function SearchFromUrl() {
  const q = useSearchParams().get("q") ?? "";
  return <SearchInner key={q} initialQuery={q} />;
}

export default function SearchView() {
  return (
    <Suspense fallback={<p className="py-10 text-ink/60">Loading...</p>}>
      <SearchFromUrl />
    </Suspense>
  );
}
