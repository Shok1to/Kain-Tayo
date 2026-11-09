import Image from "next/image";
import { BRANDS } from "@/data/brand";
import { Vendor, initials } from "@/data/mock";

// The banner at the top of a vendor's storefront and on directory cards.
// Vendors with a banner photo show it. New vendors get their brand color
// with their initials in big letters instead.
export default function VendorBanner({
  vendor,
  className = "",
  letterSize = "text-[8rem]",
}: {
  vendor: Pick<Vendor, "name" | "banner" | "brand">;
  className?: string;
  letterSize?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${BRANDS[vendor.brand].bg} ${className}`}
      role="img"
      aria-label={`${vendor.name} banner`}
    >
      {vendor.banner ? (
        <Image
          src={vendor.banner}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span
          className={`font-display absolute inset-0 flex items-center justify-center leading-none text-ink/80 ${letterSize}`}
        >
          {initials(vendor.name)}
        </span>
      )}
    </div>
  );
}
