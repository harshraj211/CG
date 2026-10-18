/** Compare against the browser-facing Host, before NextURL's loopback normalization. */
export function isSameOriginRequest(
  origin: string | null,
  requestUrl: string,
  host: string | null,
): boolean {
  // Non-browser clients may omit Origin. Request/body validation still applies.
  if (origin === null) return true;
  try {
    const source = new URL(origin);
    if (
      source.origin !== origin ||
      !["http:", "https:"].includes(source.protocol)
    )
      return false;
    const target = new URL(requestUrl);
    const authority = host ?? target.host;
    if (/[\s/\\@?#]/.test(authority)) return false;
    return source.origin === new URL(`${target.protocol}//${authority}`).origin;
  } catch {
    return false;
  }
}
