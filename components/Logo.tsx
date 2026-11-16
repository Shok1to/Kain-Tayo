import Image from "next/image";

// The Kain Tayo logo. The file is white with a see through background
// (public/logo-white.png), so it only shows on dark or photo backgrounds.
// Size it with className, for example "h-14 w-14".
export default function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-white.png"
      alt="Kain Tayo"
      width={1024}
      height={1024}
      priority={priority}
      // The logo is never shown bigger than about 144 pixels. This tells the
      // browser so it downloads a small copy instead of the full 1024 pixel file.
      sizes="144px"
      className={className}
    />
  );
}
