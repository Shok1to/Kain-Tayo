// Every vendor picks one brand. A brand is more than a color: it also decides
// the shop's heading font and the shape of its logo badge. That way each shop
// looks and feels like its own place, not like a copy of Kain Tayo.
//
// The class names are written out in full on purpose. Tailwind finds the
// classes it needs by reading the source text, so "bg-" + name would not work.

export type BrandKey =
  | "tomato"
  | "ube"
  | "blush"
  | "mango"
  | "lime"
  | "mint"
  | "sky";

// The heading fonts a shop can use. "cssVar" is the name of the CSS variable
// that next/font creates for it (see app/layout.tsx).
export type FontKey = "serif" | "dmserif" | "slab" | "rounded" | "grotesk" | "mono";

export const FONTS: Record<FontKey, { cssVar: string; weight: number }> = {
  serif: { cssVar: "--font-instrument", weight: 400 },
  dmserif: { cssVar: "--font-dmserif", weight: 400 },
  slab: { cssVar: "--font-slab", weight: 600 },
  rounded: { cssVar: "--font-rounded", weight: 600 },
  grotesk: { cssVar: "--font-grotesk", weight: 700 },
  mono: { cssVar: "--font-space-mono", weight: 700 },
};

// Logo badge shapes, as Tailwind classes.
const SHAPES = {
  circle: "rounded-full",
  arch: "rounded-t-full rounded-b-lg",
  squircle: "rounded-[35%]",
  square: "rounded-lg",
  leaf: "rounded-tl-[45%] rounded-br-[45%] rounded-tr-md rounded-bl-md",
  tab: "rounded-t-[40%] rounded-b-sm",
};

export const BRANDS: Record<
  BrandKey,
  {
    bg: string; // solid color
    soft: string; // see through tint, for page backgrounds
    hex: string; // same color as a plain value, for the shop theme
    name: string;
    font: FontKey;
    shape: string;
  }
> = {
  tomato: { bg: "bg-tomato", soft: "bg-tomato/20", hex: "#ff8a65", name: "Tomato", font: "dmserif", shape: SHAPES.circle },
  ube: { bg: "bg-ube", soft: "bg-ube/30", hex: "#cdb4f6", name: "Ube", font: "slab", shape: SHAPES.arch },
  blush: { bg: "bg-blush", soft: "bg-blush/30", hex: "#ffb8d1", name: "Blush", font: "rounded", shape: SHAPES.squircle },
  mango: { bg: "bg-mango", soft: "bg-mango/25", hex: "#ffc933", name: "Mango", font: "grotesk", shape: SHAPES.square },
  lime: { bg: "bg-lime", soft: "bg-lime/30", hex: "#cfe85a", name: "Lime", font: "serif", shape: SHAPES.leaf },
  mint: { bg: "bg-mint", soft: "bg-mint/30", hex: "#a8e68c", name: "Mint", font: "mono", shape: SHAPES.tab },
  sky: { bg: "bg-sky", soft: "bg-sky/30", hex: "#a9d8f5", name: "Sky", font: "rounded", shape: SHAPES.arch },
};

export const BRAND_KEYS = Object.keys(BRANDS) as BrandKey[];

// Vendors saved in the browser before brand colors existed have a
// "bannerColor" class like "bg-mango". Turn that into a brand key.
export function brandFromClass(cls: unknown): BrandKey {
  const key = typeof cls === "string" ? cls.replace("bg-", "") : "";
  return (BRAND_KEYS as string[]).includes(key) ? (key as BrandKey) : "lime";
}
