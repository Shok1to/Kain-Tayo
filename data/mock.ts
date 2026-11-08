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

export type Seller = {
  id: string;
  name: string;
  city: string;
  bio: string;
  rating: number;
  verified: boolean;
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
  sellerId: string;
  pickupDate: string;
  pickupSlot: string;
  cutoff: string;
};

export const sellers: Seller[] = [
  {
    id: "titababy",
    name: "Tita Baby's Kitchen",
    city: "Mississauga",
    bio: "Three decades of fiesta cooking. Tita Baby roasts lechon every weekend for birthdays, baptisms and big family reunions.",
    rating: 4.9,
    verified: true,
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
    id: "lolanena",
    name: "Lola Nena's Kakanin",
    city: "Scarborough",
    bio: "Traditional rice cakes made the slow way, wrapped in banana leaf and cooked over coals the way Lola learned back home.",
    rating: 4.8,
    verified: true,
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
    id: "atejoy",
    name: "Ate Joy's Sweets",
    city: "Brampton",
    bio: "Small batch Filipino desserts. Ate Joy bakes in her home kitchen after her day job and sells out every single week.",
    rating: 4.7,
    verified: true,
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
    id: "kuyaben",
    name: "Kuya Ben's Grill",
    city: "Markham",
    bio: "Backyard grill master. Kuya Ben marinates overnight and grills over charcoal, so every skewer tastes like a weekend at home.",
    rating: 4.6,
    verified: true,
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
    id: "mananglita",
    name: "Manang Lita's Table",
    city: "Winnipeg",
    bio: "Party trays for every occasion. Manang Lita cooks big batches of pancit and lumpia for the whole community.",
    rating: 4.8,
    verified: true,
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
    id: "greenmabuhay",
    name: "Green Mabuhay",
    city: "Vancouver",
    bio: "Plant based Filipino comfort food. Mara reimagines the classics so everyone at the table can enjoy a proper kainan.",
    rating: 4.7,
    verified: true,
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

export const listings: Listing[] = [
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
    sellerId: "titababy",
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
    sellerId: "titababy",
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
    sellerId: "lolanena",
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
    sellerId: "lolanena",
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
    sellerId: "atejoy",
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
    sellerId: "atejoy",
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
    sellerId: "kuyaben",
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
    sellerId: "kuyaben",
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
    sellerId: "mananglita",
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
    sellerId: "mananglita",
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
    sellerId: "greenmabuhay",
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
    sellerId: "greenmabuhay",
    pickupDate: "Saturday, Nov 14",
    pickupSlot: "12 PM to 2 PM",
    cutoff: "Thursday, Nov 12 at 8 PM",
  },
];

export function getSeller(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function getListingsBySeller(sellerId: string): Listing[] {
  return listings.filter((l) => l.sellerId === sellerId);
}

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
