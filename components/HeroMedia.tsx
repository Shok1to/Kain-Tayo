import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

const words = ["Lechon", "Kakanin", "Leche flan", "Inasal", "Pancit", "Lumpia"];

// Full screen background for the home page.
// If you put a video at public/hero.mp4 it plays that, on a loop with no sound.
// If not, it shows a moody animated stand in made only from color and light.
export default function HeroMedia() {
  const hasVideo = existsSync(path.join(process.cwd(), "public", "hero.mp4"));
  const hasPhoto = existsSync(path.join(process.cwd(), "public", "photos", "hero.jpg"));

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      ) : hasPhoto ? (
        // A still photo with a very slow zoom, so it feels alive like a video.
        <Image
          src="/photos/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover"
        />
      ) : (
        <>
          {/* slow drifting lights, like a busy kitchen out of focus */}
          <div className="animate-drift absolute -left-[10%] top-[5%] h-[55vmax] w-[55vmax] rounded-full bg-lime/55 blur-[110px] [--d:19s]" />
          <div className="animate-drift absolute right-[-15%] top-[20%] h-[50vmax] w-[50vmax] rounded-full bg-mango/55 blur-[110px] [--d:23s] [animation-delay:-6s]" />
          <div className="animate-drift absolute bottom-[-20%] left-[25%] h-[45vmax] w-[45vmax] rounded-full bg-tomato/50 blur-[110px] [--d:27s] [animation-delay:-12s]" />
          <div className="animate-drift absolute right-[10%] top-[-15%] h-[35vmax] w-[35vmax] rounded-full bg-ube/45 blur-[100px] [--d:21s] [animation-delay:-3s]" />

          {/* big outlined words sliding past */}
          <div className="absolute inset-x-0 top-[14%] overflow-hidden">
            <div className="animate-marquee-slow font-display text-outline flex w-max gap-16 whitespace-nowrap text-[22vw] leading-none sm:text-[16vw]">
              {[...words, ...words].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* darken the bottom so the headline is easy to read */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/45" />
      {/* film grain */}
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
