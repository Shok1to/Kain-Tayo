// True only when a form post came from a page on this same site.
// Browsers always send the Origin header with a form post, and another
// website cannot fake it, so a post from anywhere else is refused.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
