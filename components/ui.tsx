import Image from "next/image";
import { BRANDS, BrandKey } from "@/data/brand";
import { Listing, initials } from "@/data/mock";

// A flat colored tile with an overhead plate, standing in for a food photo.
// If a listing has an `image`, the real photo is shown instead.
// Put it inside an element with the class "group" to get the hover spin.
export function PhotoPlaceholder({
  listing,
  className = "",
}: {
  listing: Pick<Listing, "bg" | "image" | "title">;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${listing.bg} ${className}`}
      role="img"
      aria-label={listing.image ? listing.title : "Photo placeholder"}
    >
      {listing.image ? (
        <Image
          src={listing.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <>
          <div className="relative aspect-square w-[62%] rounded-full border-2 border-ink bg-cream shadow-[0_10px_0_rgba(36,51,31,0.15)] transition duration-500 group-hover:rotate-12 group-hover:scale-105">
            <div className="absolute inset-[9%] rounded-full border-2 border-ink/25" />
            <div className="absolute inset-[26%] rounded-full bg-ink/10" />
          </div>
          <span className="plate-label label absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-ink/60">
            Photo goes here
          </span>
        </>
      )}
    </div>
  );
}

// The vendor's logo placeholder: a badge with their initials, in their brand
// color and their brand's shape (circle, arch, square...). Without a brand it
// is a lime circle.
export function Avatar({
  name,
  brand,
  className = "",
}: {
  name: string;
  brand?: BrandKey;
  className?: string;
}) {
  return (
    <span
      className={`font-display relative flex shrink-0 items-center justify-center border-2 border-ink text-ink ${brand ? `${BRANDS[brand].bg} ${BRANDS[brand].shape}` : "bg-lime rounded-full"} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`label inline-flex items-center rounded-full bg-mint px-2.5 py-1 text-ink ring-2 ring-ink ${className}`}
    >
      Verified food handler
    </span>
  );
}

export function Stars({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  if (rating === 0) {
    return <span className="label text-ink/60">New vendor</span>;
  }
  return (
    <span className="label inline-flex items-center gap-1 text-ink">
      <span className="font-bold">Rated {rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-ink/60">({count} reviews)</span>
      )}
    </span>
  );
}

export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="label rounded-full border border-ink/40 px-2 py-0.5 text-[0.65rem] text-ink">
      {tag}
    </span>
  );
}
