"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { TURNSTILE_ACTION } from "@/lib/spam/shared";

// The parts of Cloudflare's Turnstile script that we use.
type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  // Called with a new token, or with null when the token is no longer valid.
  // Pass a stable function, such as a state setter.
  onToken: (token: string | null) => void;
  // Change this number to ask for a fresh check (each token works only once).
  resetKey: number;
};

// Cloudflare Turnstile tells people and bots apart, usually without a puzzle.
// The site key is public. The secret key is only used on the server.
export default function TurnstileWidget({ onToken, resetKey }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Draw the check once Cloudflare's script has loaded.
  useEffect(() => {
    const api = window.turnstile;
    if (!scriptReady || !siteKey || !containerRef.current || !api) return;

    const id = api.render(containerRef.current, {
      sitekey: siteKey,
      action: TURNSTILE_ACTION,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
    widgetId.current = id;

    return () => {
      api.remove(id);
      widgetId.current = null;
    };
  }, [scriptReady, siteKey, onToken]);

  // Get a fresh token after each try.
  useEffect(() => {
    if (resetKey > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </>
  );
}
