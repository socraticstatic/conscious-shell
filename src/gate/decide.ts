// The doorman's rulebook. Pure logic, no IO — the middleware is a thin
// wrapper around this file, and this file is what the tests pin down.

export type Claims = { approved: boolean } | null;
export type GateDecision = 'public' | 'app' | 'gate' | 'home';

const PUBLIC_PREFIXES = ['/assets/'];
const PUBLIC_FILES = ['/favicon.ico', '/favicon.svg', '/og-image.png', '/robots.txt'];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return PUBLIC_FILES.includes(pathname);
}

export function decideRequest(pathname: string, claims: Claims): GateDecision {
  if (isPublicPath(pathname)) return 'public';
  // The magic-link landing must always reach the gate page, whose JS
  // performs the token exchange — even for already-approved sessions.
  if (pathname === '/auth/confirm') return 'gate';
  if (pathname === '/gate.html') return claims?.approved ? 'home' : 'gate';
  return claims?.approved ? 'app' : 'gate';
}
