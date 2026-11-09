// All the pretend data for the prototype lives in this one file.
// Nothing here is real. Change anything you like.

export type DietaryTag =
  | "Vegetarian"
  | "Vegan"
  | "Halal"
  | "Gluten free"
  | "Dairy free"
  | "Nut free";

export const ALL_TAGS: DietaryTag[] = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten free",
  "Dairy free",
  "Nut free",
];

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

import type { BrandKey } from "./brand";

// "pending" means the food handler certificate is still being checked.
export type VendorStatus = "pending" | "verified";

export type Vendor = {
  slug: string; // the web address friendly name, like "titababy" in /vendors/titababy
  name: string; // business name
  ownerName: string;
  cuisine: string;
  city: string;
  bio: string;
  rating: number; // 0 means no ratings yet
  status: VendorStatus;
  certificateFile?: string; // name of the food handler certificate they "uploaded" at signup
  banner?: string; // optional photo for the storefront banner
  brand: BrandKey; // the vendor's own color, used across their shop
  reviews: Review[];
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number; // Canadian dollars
  unit: string; // what one "quantity" means
  tags: DietaryTag[];
  bg: string; // flat background color class for the photo placeholder
  image?: string; // optional real photo, like "/photos/lechon.jpg" inside the public folder
  vendorSlug: string; // which vendor sells this
  pickupDate: string;
  pickupSlot: string;
  cutoff: string;
};

// The cuisine types a vendor can choose when they sign up.
export const CUISINES = [
  "Roasts and lechon",
  "Kakanin and rice cakes",
  "Desserts and sweets",
  "Grill and BBQ",
  "Party trays",
  "Plant based",
  "Other",
];

// The 6 built in vendors. New vendors made through signup are saved
// in the browser and added on top of these by PlatformProvider.
export const seedVendors: Vendor[] = [
  {
    slug: "titababy",
    name: "Tita Baby's Kitchen",
    ownerName: "Baby Santos",
    cuisine: "Roasts and lechon",
    city: "Mississauga",
    bio: "Three decades of fiesta cooking. Tita Baby roasts lechon every weekend for birthdays, baptisms and big family reunions.",
    rating: 4.9,
    status: "verified",
    banner: "/photos/wholelechon.jpg",
    brand: "tomato",
    reviews: [
      {
        author: "Marites D.",
        rating: 5,
        text: "The skin was so crispy and the meat was juicy. Our whole family finished it in one afternoon.",
        date: "Oct 26",
      },
      {
        author: "Jun R.",
        rating: 5,
        text: "Pickup was smooth and on time. Tita Baby even packed extra sauce for us.",
        date: "Oct 12",
      },
      {
        author: "Cheska L.",
        rating: 4,
        text: "Delicious and generous portions. I wish the pickup window was a little longer.",
        date: "Sep 28",
      },
    ],
  },
  {
    slug: "lolanena",
    name: "Lola Nena's Kakanin",
    ownerName: "Nena Reyes",
    cuisine: "Kakanin and rice cakes",
    city: "Scarborough",
    bio: "Traditional rice cakes made the slow way, wrapped in banana leaf and cooked over coals the way Lola learned back home.",
    rating: 4.8,
    status: "verified",
    banner: "/photos/kakanintray.jpg",
    brand: "ube",
    reviews: [
      {
        author: "Rowena P.",
        rating: 5,
        text: "Tastes exactly like my childhood. The biko was sticky, sweet and perfect.",
        date: "Nov 2",
      },
      {
        author: "Andre M.",
        rating: 5,
        text: "Ordered a kakanin tray for our office potluck and it disappeared in ten minutes.",
        date: "Oct 19",
      },
      {
        author: "Liza T.",
        rating: 4,
        text: "Lovely flavours. The puto was a bit small but very soft.",
        date: "Oct 5",
      },
    ],
  },
  {
    slug: "atejoy",
    name: "Ate Joy's Sweets",
    ownerName: "Joy Mendoza",
    cuisine: "Desserts and sweets",
    city: "Brampton",
    bio: "Small batch Filipino desserts. Ate Joy bakes in her home kitchen after her day job and sells out every single week.",
    rating: 4.7,
    status: "verified",
    banner: "/photos/lecheflan.jpg",
    brand: "blush",
    reviews: [
      {
        author: "Katrina V.",
        rating: 5,
        text: "The leche flan is silky smooth with just the right amount of caramel.",
        date: "Nov 1",
      },
      {
        author: "Paolo S.",
        rating: 4,
        text: "Great ube halaya. I would love a bigger tub option next time.",
        date: "Oct 22",
      },
      {
        author: "Grace N.",
        rating: 5,
        text: "Ate Joy messaged me the pickup details and everything was ready when I arrived.",
        date: "Oct 9",
      },
    ],
  },
  {
    slug: "kuyaben",
    name: "Kuya Ben's Grill",
    ownerName: "Ben Cruz",
    cuisine: "Grill and BBQ",
    city: "Markham",
    bio: "Backyard grill master. Kuya Ben marinates overnight and grills over charcoal, so every skewer tastes like a weekend at home.",
    rating: 4.6,
    status: "verified",
    banner: "/photos/chickeninasal.jpg",
    brand: "mango",
    reviews: [
      {
        author: "Dennis C.",
        rating: 5,
        text: "Smoky, sweet and juicy. We ordered 60 skewers for a game night and nobody left hungry.",
        date: "Oct 30",
      },
      {
        author: "Mylene A.",
        rating: 4,
        text: "The chicken inasal was full of flavour. Packaging kept everything warm.",
        date: "Oct 15",
      },
      {
        author: "Ramon B.",
        rating: 5,
        text: "Best BBQ I have had since moving to Canada. Will order again.",
        date: "Sep 30",
      },
    ],
  },
  {
    slug: "mananglita",
    name: "Manang Lita's Table",
    ownerName: "Lita Aquino",
    cuisine: "Party trays",
    city: "Winnipeg",
    bio: "Party trays for every occasion. Manang Lita cooks big batches of pancit and lumpia for the whole community.",
    rating: 4.8,
    status: "verified",
    banner: "/photos/pancitbihon.jpg",
    brand: "lime",
    reviews: [
      {
        author: "Beth O.",
        rating: 5,
        text: "The pancit tray fed twenty people and every noodle was seasoned well.",
        date: "Nov 3",
      },
      {
        author: "Noel F.",
        rating: 5,
        text: "Crunchy lumpia, still hot at pickup. My kids ate half the box in the car.",
        date: "Oct 21",
      },
      {
        author: "Tess G.",
        rating: 4,
        text: "Very tasty and a fair price for the amount of food.",
        date: "Oct 7",
      },
    ],
  },
  {
    slug: "greenmabuhay",
    name: "Green Mabuhay",
    ownerName: "Mara Villanueva",
    cuisine: "Plant based",
    city: "Vancouver",
    bio: "Plant based Filipino comfort food. Mara reimagines the classics so everyone at the table can enjoy a proper kainan.",
    rating: 4.7,
    status: "verified",
    banner: "/photos/veggiefeasttray.jpg",
    brand: "mint",
    reviews: [
      {
        author: "Isabel Q.",
        rating: 5,
        text: "I could not believe the lumpia was fully vegetarian. So flavourful.",
        date: "Nov 4",
      },
      {
        author: "Chris H.",
        rating: 4,
        text: "The halo halo kit was fun and easy to assemble for our family night.",
        date: "Oct 24",
      },
      {
        author: "Aileen W.",
        rating: 5,
        text: "Finally a place where my vegan friends can eat with us. Thank you Mara.",
        date: "Oct 10",
      },
    ],
  },
];

export const seedListings: Listing[] = [
  {
    id: "wholelechon",
    title: "Whole Lechon (about 20 lb)",
    description:
      "A whole pig roasted over charcoal until the skin is golden and crackling. Comes chopped and ready to serve with liver sauce and a banana leaf platter. Feeds around 25 guests.",
    price: 320,
    unit: "per whole lechon",
    tags: ["Dairy free", "Gluten free", "Nut free"],
    bg: "bg-tomato",
    image: "/photos/wholelechon.jpg",
    vendorSlug: "titababy",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "2 PM to 4 PM",
    cutoff: "Wednesday, Nov 11 at 8 PM",
  },
  {
    id: "lechonbelly",
    title: "Lechon Belly Roll",
    description:
      "Pork belly stuffed with lemongrass, garlic and herbs, rolled tight and roasted until the skin blisters. About 4 lb and serves 8 to 10 people.",
    price: 95,
    unit: "per roll",
    tags: ["Dairy free", "Gluten free", "Nut free"],
    bg: "bg-mango",
    image: "/photos/lechonbelly.jpg",
    vendorSlug: "titababy",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "11 AM to 1 PM",
    cutoff: "Wednesday, Nov 11 at 8 PM",
  },
  {
    id: "kakanintray",
    title: "Kakanin Party Tray",
    description:
      "A big tray of bibingka, puto and kutsinta, all steamed fresh the morning of pickup. Serves 10 to 12 people and travels well for potlucks.",
    price: 48,
    unit: "per tray",
    tags: ["Vegetarian", "Dairy free"],
    bg: "bg-ube",
    image: "/photos/kakanintray.jpg",
    vendorSlug: "lolanena",
    pickupDate: "Sunday, Nov 15",
    pickupSlot: "10 AM to 12 PM",
    cutoff: "Thursday, Nov 12 at 6 PM",
  },
  {
    id: "bikotray",
    title: "Biko Sticky Rice Tray",
    description:
      "Glutinous rice slow cooked in coconut milk and brown sugar, topped with latik. A large tray serves 12 people.",
    price: 38,
    unit: "per tray",
    tags: ["Vegetarian", "Vegan", "Dairy free", "Gluten free"],
    bg: "bg-mango",
    image: "/photos/bikotray.jpg",
    vendorSlug: "lolanena",
    pickupDate: "Sunday, Nov 15",
    pickupSlot: "12 PM to 2 PM",
    cutoff: "Thursday, Nov 12 at 6 PM",
  },
  {
    id: "lecheflan",
    title: "Leche Flan Llanera",
    description:
      "Creamy egg custard with a deep amber caramel top, steamed in a traditional llanera mold. One large flan cuts into about 12 slices.",
    price: 28,
    unit: "per llanera",
    tags: ["Vegetarian", "Gluten free", "Nut free"],
    bg: "bg-lime",
    image: "/photos/lecheflan.jpg",
    vendorSlug: "atejoy",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "9 AM to 11 AM",
    cutoff: "Tuesday, Nov 10 at 9 PM",
  },
  {
    id: "ubehalaya",
    title: "Ube Halaya Tub",
    description:
      "Purple yam jam stirred by hand for hours until thick and glossy. Spoon it on pandesal, stir it into halo halo, or eat it straight from the tub.",
    price: 22,
    unit: "per tub",
    tags: ["Vegetarian", "Gluten free"],
    bg: "bg-ube",
    image: "/photos/ubehalaya.jpg",
    vendorSlug: "atejoy",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "9 AM to 11 AM",
    cutoff: "Tuesday, Nov 10 at 9 PM",
  },
  {
    id: "chickeninasal",
    title: "Chicken Inasal Skewers (30 pieces)",
    description:
      "Chicken thigh marinated in calamansi, lemongrass and annatto oil, then grilled over charcoal. Comes with garlic rice sauce and spiced vinegar.",
    price: 60,
    unit: "per 30 pieces",
    tags: ["Halal", "Dairy free", "Gluten free", "Nut free"],
    bg: "bg-mango",
    image: "/photos/chickeninasal.jpg",
    vendorSlug: "kuyaben",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "4 PM to 6 PM",
    cutoff: "Wednesday, Nov 11 at 5 PM",
  },
  {
    id: "porkbbq",
    title: "Pork BBQ Skewers (30 pieces)",
    description:
      "Sweet and sticky Filipino style pork BBQ, brushed with a banana ketchup glaze while it grills. Thirty skewers is plenty for a small party.",
    price: 55,
    unit: "per 30 pieces",
    tags: ["Dairy free", "Nut free"],
    bg: "bg-tomato",
    image: "/photos/porkbbq.jpg",
    vendorSlug: "kuyaben",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "4 PM to 6 PM",
    cutoff: "Wednesday, Nov 11 at 5 PM",
  },
  {
    id: "pancitbihon",
    title: "Pancit Bihon Party Tray",
    description:
      "Thin rice noodles stir fried with chicken, cabbage, carrots and green beans. Served with calamansi on the side. Feeds 15 to 20 people.",
    price: 45,
    unit: "per tray",
    tags: ["Halal", "Dairy free", "Gluten free"],
    bg: "bg-lime",
    image: "/photos/pancitbihon.jpg",
    vendorSlug: "mananglita",
    pickupDate: "Sunday, Nov 15",
    pickupSlot: "1 PM to 3 PM",
    cutoff: "Friday, Nov 13 at 12 PM",
  },
  {
    id: "lumpiashanghai",
    title: "Lumpiang Shanghai (100 pieces)",
    description:
      "Tiny crispy spring rolls filled with seasoned chicken and vegetables. Delivered fresh and ready to fry or bake, with sweet chili dip included.",
    price: 50,
    unit: "per 100 pieces",
    tags: ["Halal", "Dairy free", "Nut free"],
    bg: "bg-mint",
    image: "/photos/lumpiashanghai.jpg",
    vendorSlug: "mananglita",
    pickupDate: "Sunday, Nov 15",
    pickupSlot: "1 PM to 3 PM",
    cutoff: "Friday, Nov 13 at 12 PM",
  },
  {
    id: "veggiefeasttray",
    title: "Vegetarian Pancit and Lumpia Tray",
    description:
      "Pancit canton with mushrooms and tofu, plus 40 crispy vegetable lumpia. Fully plant based and big enough for 10 hungry guests.",
    price: 42,
    unit: "per tray",
    tags: ["Vegetarian", "Vegan", "Dairy free", "Nut free"],
    bg: "bg-mint",
    image: "/photos/veggiefeasttray.jpg",
    vendorSlug: "greenmabuhay",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "12 PM to 2 PM",
    cutoff: "Thursday, Nov 12 at 8 PM",
  },
  {
    id: "halohalokit",
    title: "Halo Halo Kit for 10",
    description:
      "Everything you need for ten bowls: sweet beans, nata de coco, leche flan, ube halaya, shaved ice base and evaporated milk. Just add ice and mix.",
    price: 36,
    unit: "per kit",
    tags: ["Vegetarian", "Gluten free"],
    bg: "bg-ube",
    image: "/photos/halohalokit.jpg",
    vendorSlug: "greenmabuhay",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "12 PM to 2 PM",
    cutoff: "Thursday, Nov 12 at 8 PM",
  },
];

// ---------- orders (fake) ----------
// "paid"      = buyer paid, money held safely in the vault
// "advance"   = the 30% advance was released to the vendor, 48 hours before pickup
// "completed" = buyer picked up and the vendor scanned the QR, so the rest was released
export type OrderStatus = "paid" | "advance" | "completed";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "Paid, held safely",
  advance: "30% advance released",
  completed: "Picked up, paid out",
};

export type OrderItem = {
  title: string;
  qty: number;
  price: number; // price of one
  // Each item can have its own pickup time, because one vendor can sell
  // things that are picked up on different days. Older fake orders leave
  // these empty and use the order's pickup time instead.
  pickupDate?: string;
  pickupSlot?: string;
};

export type Order = {
  code: string; // like KT4821
  vendorSlug: string;
  buyerName: string;
  items: OrderItem[];
  total: number;
  pickupDate: string;
  pickupSlot: string;
  status: OrderStatus;
};

// The pickup times of an order, as lines of text. Most orders have one line.
// An order with items on different days or slots has one line for each.
export function pickupLines(order: Order): string[] {
  const lines = order.items.map((item) =>
    item.pickupDate && item.pickupSlot
      ? `${item.pickupDate}, ${item.pickupSlot}`
      : `${order.pickupDate}, ${order.pickupSlot}`,
  );
  return Array.from(new Set(lines));
}

// How an order's money is split. The vendor gets 30% as an advance 48 hours
// before pickup, and the other 70% after the buyer's QR code is scanned.
//   released = money already in the vendor's wallet
//   held     = money still waiting in the Kain Tayo vault
export function orderMoney(order: Order) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const advance = round(order.total * 0.3);
  const rest = round(order.total - advance);
  const released =
    order.status === "paid" ? 0 : order.status === "advance" ? advance : order.total;
  return { advance, rest, released, held: round(order.total - released) };
}

// A few pretend orders so each built in vendor has something on their dashboard.
export const seedOrders: Order[] = [
  { code: "KT4821", vendorSlug: "titababy", buyerName: "Marites D.", items: [{ title: "Whole Lechon (about 20 lb)", qty: 1, price: 320 }], total: 320, pickupDate: "Saturday, Nov 14", pickupSlot: "2 PM to 4 PM", status: "advance" },
  { code: "KT4790", vendorSlug: "titababy", buyerName: "Cheska L.", items: [{ title: "Lechon Belly Roll", qty: 2, price: 95 }], total: 190, pickupDate: "Saturday, Nov 14", pickupSlot: "11 AM to 1 PM", status: "paid" },
  { code: "KT4602", vendorSlug: "titababy", buyerName: "Jun R.", items: [{ title: "Lechon Belly Roll", qty: 1, price: 95 }], total: 95, pickupDate: "Saturday, Nov 7", pickupSlot: "11 AM to 1 PM", status: "completed" },
  { code: "KT4802", vendorSlug: "lolanena", buyerName: "Rowena P.", items: [{ title: "Kakanin Party Tray", qty: 2, price: 48 }], total: 96, pickupDate: "Sunday, Nov 15", pickupSlot: "10 AM to 12 PM", status: "paid" },
  { code: "KT4777", vendorSlug: "lolanena", buyerName: "Andre M.", items: [{ title: "Biko Sticky Rice Tray", qty: 1, price: 38 }], total: 38, pickupDate: "Sunday, Nov 15", pickupSlot: "12 PM to 2 PM", status: "paid" },
  { code: "KT4811", vendorSlug: "atejoy", buyerName: "Katrina V.", items: [{ title: "Leche Flan Llanera", qty: 2, price: 28 }], total: 56, pickupDate: "Saturday, Nov 14", pickupSlot: "9 AM to 11 AM", status: "advance" },
  { code: "KT4795", vendorSlug: "kuyaben", buyerName: "Dennis C.", items: [{ title: "Chicken Inasal Skewers (30 pieces)", qty: 2, price: 60 }], total: 120, pickupDate: "Saturday, Nov 14", pickupSlot: "4 PM to 6 PM", status: "advance" },
  { code: "KT4760", vendorSlug: "kuyaben", buyerName: "Ramon B.", items: [{ title: "Pork BBQ Skewers (30 pieces)", qty: 1, price: 55 }], total: 55, pickupDate: "Saturday, Nov 14", pickupSlot: "4 PM to 6 PM", status: "paid" },
  { code: "KT4808", vendorSlug: "mananglita", buyerName: "Beth O.", items: [{ title: "Pancit Bihon Party Tray", qty: 1, price: 45 }, { title: "Lumpiang Shanghai (100 pieces)", qty: 1, price: 50 }], total: 95, pickupDate: "Sunday, Nov 15", pickupSlot: "1 PM to 3 PM", status: "paid" },
  { code: "KT4815", vendorSlug: "greenmabuhay", buyerName: "Isabel Q.", items: [{ title: "Vegetarian Pancit and Lumpia Tray", qty: 1, price: 42 }, { title: "Halo Halo Kit for 10", qty: 1, price: 36 }], total: 78, pickupDate: "Saturday, Nov 14", pickupSlot: "12 PM to 2 PM", status: "paid" },
];

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Turns a business name into a web address friendly name.
// Letters and numbers only, so "Mama Lita's Eats" becomes "mamalitaseats".
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") || "vendor";
}
