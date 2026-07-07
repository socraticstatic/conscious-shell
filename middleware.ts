// The door itself. Runs at the edge before anything is served.
// Fail closed: any error means the gate, never the content — and a
// request whose URL cannot even be parsed gets a bare 403.
import { next, rewrite } from '@vercel/edge';
import { createServerClient } from '@supabase/ssr';
import { decideRequest, isPublicPath, type Claims } from './src/gate/decide';

export const config = {
  // Everything except Vercel internals. Static assets still pass through
  // here; decide.ts short-circuits them as 'public'.
  matcher: '/((?!_vercel).*)',
};

async function readClaims(req: Request): Promise<Claims> {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const header = req.headers.get('cookie') ?? '';
        return header
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const eq = c.indexOf('=');
            if (eq === -1) return null;
            return { name: c.slice(0, eq), value: decodeURIComponent(c.slice(eq + 1)) };
          })
          .filter((c): c is { name: string; value: string } => c !== null);
      },
      setAll() {
        // Middleware never writes cookies; the browser client refreshes.
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  const meta = data.claims.app_metadata as Record<string, unknown> | undefined;
  return { approved: meta?.approved === true };
}

export default async function middleware(req: Request) {
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    // Cannot even parse the request URL. Serve nothing.
    return new Response(null, { status: 403 });
  }
  try {
    const claims = await readClaims(req);
    const decision = decideRequest(url.pathname, claims);
    if (decision === 'public' || decision === 'app') return next();
    if (decision === 'home') return Response.redirect(new URL('/', url), 302);
    return rewrite(new URL('/gate.html', url));
  } catch {
    if (isPublicPath(url.pathname)) return next();
    return rewrite(new URL('/gate.html', url));
  }
}
