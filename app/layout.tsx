import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  Fredoka,
  Geist,
  Instrument_Serif,
  Space_Mono,
  Zilla_Slab,
} from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Chrome from "@/components/Chrome";
import { PlatformProvider } from "@/components/PlatformProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

// Heading fonts for vendor shops. preload is off so the other pages do not
// download them. The browser only fetches a font when a shop really uses it.
const dmSerif = DM_Serif_Display({
  variable: "--font-dmserif",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});
const zillaSlab = Zilla_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: "600",
  preload: false,
});
const fredoka = Fredoka({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: "600",
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: "700",
  preload: false,
});

export const metadata: Metadata = {
  title: "Kain Tayo",
  description: "A marketplace of home kitchens. Preorder from independent vendors, each with their own shop.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${spaceMono.variable} ${instrument.variable} ${dmSerif.variable} ${zillaSlab.variable} ${fredoka.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PlatformProvider>
          <CartProvider>
            <Chrome>{children}</Chrome>
          </CartProvider>
        </PlatformProvider>
      </body>
    </html>
  );
}
