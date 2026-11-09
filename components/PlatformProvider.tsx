"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BRAND_KEYS, brandFromClass } from "@/data/brand";
import {
  Listing,
  Order,
  Vendor,
  seedListings,
  seedOrders,
  seedVendors,
  slugify,
} from "@/data/mock";

// The "platform notebook": one place every page can open to see all the
// vendors and listings. It starts with the built in fake data, then adds
// anything that was created in this browser (saved in localStorage).

export const VENDORS_KEY = "kaintayo_vendors";
export const LISTINGS_KEY = "kaintayo_listings";
export const ORDERS_KEY = "kaintayo_orders";
export const CURRENT_VENDOR_KEY = "kaintayo_current_vendor";

type PlatformContextValue = {
  vendors: Vendor[];
  listings: Listing[];
  ready: boolean; // true once localStorage has been read
  getVendor: (slug: string) => Vendor | undefined;
  getListing: (id: string) => Listing | undefined;
  getListingsByVendor: (slug: string) => Listing[];
  orders: Order[];
  // Turn a checkout into saved orders, one per vendor. Gives each a new code.
  placeOrders: (inputs: NewOrderInput[]) => Order[];
  getOrdersByVendor: (slug: string) => Order[];
  // The fake "logged in" vendor. There is no password, you just pick one.
  currentVendor: Vendor | undefined;
  login: (slug: string) => void;
  logout: () => void;
  // Add a listing for a vendor and save it. Returns the new listing.
  addListing: (input: NewListingInput) => Listing;
  // Make a new vendor in "pending" status and save it. Returns the new vendor.
  createVendor: (input: NewVendorInput) => Vendor;
  // Fake approval: flips a vendor from "pending" to "verified".
  approveVendor: (slug: string) => void;
};

// Everything an order needs except its code and status, which are made for you.
export type NewOrderInput = Omit<Order, "code" | "status">;

// Everything a listing needs except its id, which is made for you.
export type NewListingInput = Omit<Listing, "id" | "image">;

export type NewVendorInput = {
  name: string;
  ownerName: string;
  cuisine: string;
  certificateFile: string;
};


const PlatformContext = createContext<PlatformContextValue | null>(null);

// Vendors saved before brand colors existed get one now.
function normalizeVendor(v: Vendor & { bannerColor?: string }): Vendor {
  const { bannerColor, ...rest } = v;
  return { ...rest, brand: v.brand ?? brandFromClass(bannerColor) };
}

function readList<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T[]) : [];
  } catch {
    return [];
  }
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [extraVendors, setExtraVendors] = useState<Vendor[]>([]);
  const [extraListings, setExtraListings] = useState<Listing[]>([]);
  const [extraOrders, setExtraOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  // Read anything saved in this browser, once, after the page appears.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtraVendors(readList<Vendor & { bannerColor?: string }>(VENDORS_KEY).map(normalizeVendor));
    setExtraListings(readList<Listing>(LISTINGS_KEY));
    setExtraOrders(readList<Order>(ORDERS_KEY));
    try {
      setCurrentSlug(localStorage.getItem(CURRENT_VENDOR_KEY));
    } catch {
      // ignore storage problems
    }
    setReady(true);
  }, []);

  // Save new vendors whenever they change (but only after the first read,
  // so we never overwrite saved data with an empty list).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(VENDORS_KEY, JSON.stringify(extraVendors));
    } catch {
      // ignore storage problems
    }
  }, [extraVendors, ready]);

  // Save new orders whenever they change.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(extraOrders));
    } catch {
      // ignore storage problems
    }
  }, [extraOrders, ready]);

  // Remember who is logged in.
  useEffect(() => {
    if (!ready) return;
    try {
      if (currentSlug) localStorage.setItem(CURRENT_VENDOR_KEY, currentSlug);
      else localStorage.removeItem(CURRENT_VENDOR_KEY);
    } catch {
      // ignore storage problems
    }
  }, [currentSlug, ready]);

  // Save new listings whenever they change, same idea as vendors above.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(extraListings));
    } catch {
      // ignore storage problems
    }
  }, [extraListings, ready]);

  const vendors = useMemo(
    () => [...seedVendors, ...extraVendors],
    [extraVendors],
  );
  const listings = useMemo(
    () => [...seedListings, ...extraListings],
    [extraListings],
  );

  const getVendor = useCallback(
    (slug: string) => vendors.find((v) => v.slug === slug),
    [vendors],
  );
  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );
  const getListingsByVendor = useCallback(
    (slug: string) => listings.filter((l) => l.vendorSlug === slug),
    [listings],
  );

  // Newest orders first, then the built in pretend ones.
  const orders = useMemo(
    () => [...extraOrders].reverse().concat(seedOrders),
    [extraOrders],
  );

  const placeOrders = useCallback(
    (inputs: NewOrderInput[]): Order[] => {
      // Codes look like KT4822. Start one above the biggest code so far.
      let next =
        orders.reduce((max, o) => Math.max(max, Number(o.code.slice(2)) || 0), 0) + 1;
      const created: Order[] = inputs.map((input) => ({
        ...input,
        code: `KT${next++}`,
        status: "paid",
      }));
      setExtraOrders((prev) => [...prev, ...created]);
      return created;
    },
    [orders],
  );

  const getOrdersByVendor = useCallback(
    (slug: string) => orders.filter((o) => o.vendorSlug === slug),
    [orders],
  );

  // If the saved vendor no longer exists, nobody is logged in.
  const currentVendor = currentSlug ? getVendor(currentSlug) : undefined;
  const login = useCallback((slug: string) => setCurrentSlug(slug), []);
  const logout = useCallback(() => setCurrentSlug(null), []);

  const createVendor = useCallback(
    (input: NewVendorInput): Vendor => {
      // Two vendors can pick the same name, so add a number if the slug is taken.
      const base = slugify(input.name);
      let slug = base;
      for (let n = 2; vendors.some((v) => v.slug === slug); n++) {
        slug = `${base}${n}`;
      }
      const vendor: Vendor = {
        slug,
        name: input.name,
        ownerName: input.ownerName,
        cuisine: input.cuisine,
        city: "Canada",
        bio: `${input.ownerName} cooks ${input.cuisine.toLowerCase()} and just opened this shop.`,
        rating: 0,
        status: "pending",
        certificateFile: input.certificateFile,
        // The first brand color no other vendor is using yet.
        brand:
          BRAND_KEYS.find((k) => !vendors.some((v) => v.brand === k)) ??
          BRAND_KEYS[vendors.length % BRAND_KEYS.length],
        reviews: [],
      };
      setExtraVendors((prev) => [...prev, vendor]);
      return vendor;
    },
    [vendors],
  );

  const addListing = useCallback(
    (input: NewListingInput): Listing => {
      // Same title twice is fine, so add a number if the id is taken.
      const base = slugify(input.title);
      let id = base;
      for (let n = 2; listings.some((l) => l.id === id); n++) {
        id = `${base}${n}`;
      }
      const listing: Listing = { ...input, id };
      setExtraListings((prev) => [...prev, listing]);
      return listing;
    },
    [listings],
  );

  const approveVendor = useCallback((slug: string) => {
    setExtraVendors((prev) =>
      prev.map((v) => (v.slug === slug ? { ...v, status: "verified" } : v)),
    );
  }, []);

  const value = useMemo<PlatformContextValue>(
    () => ({
      vendors,
      listings,
      ready,
      getVendor,
      getListing,
      getListingsByVendor,
      orders,
      placeOrders,
      getOrdersByVendor,
      currentVendor,
      login,
      logout,
      addListing,
      createVendor,
      approveVendor,
    }),
    [
      vendors,
      listings,
      ready,
      getVendor,
      getListing,
      getListingsByVendor,
      orders,
      placeOrders,
      getOrdersByVendor,
      currentVendor,
      login,
      logout,
      addListing,
      createVendor,
      approveVendor,
    ],
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside PlatformProvider");
  return ctx;
}
