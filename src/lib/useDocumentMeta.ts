import { useEffect } from 'react';

type MetaInput = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
};

const DEFAULTS: MetaInput = {
  title: 'Micah Boswell — Design Leader',
  description:
    'Micah Boswell is a design leader with 30 years shaping products people actually use. Selected UX, product design, and design leadership work.',
  url: 'https://conscious-shell.com',
  image: 'https://conscious-shell.com/og-image.png',
  type: 'website',
};

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

// Manages <title>, meta description, and OG/Twitter tags per route.
// Restores the site-wide defaults on unmount so navigating back to "/"
// (or any route without its own useDocumentMeta call) doesn't leak the
// previous route's tags.
export function useDocumentMeta(meta: Partial<MetaInput>) {
  useEffect(() => {
    const merged: MetaInput = { ...DEFAULTS, ...meta };

    document.title = merged.title;
    setMeta('description', merged.description);
    setMeta('og:title', merged.title, 'property');
    setMeta('og:description', merged.description, 'property');
    setMeta('og:type', merged.type ?? 'website', 'property');
    setMeta('og:url', merged.url, 'property');
    setMeta('og:image', merged.image ?? DEFAULTS.image!, 'property');
    setMeta('twitter:image', merged.image ?? DEFAULTS.image!);
    setCanonical(merged.url);

    return () => {
      document.title = DEFAULTS.title;
      setMeta('description', DEFAULTS.description);
      setMeta('og:title', DEFAULTS.title, 'property');
      setMeta('og:description', DEFAULTS.description, 'property');
      setMeta('og:type', 'website', 'property');
      setMeta('og:url', DEFAULTS.url, 'property');
      setMeta('og:image', DEFAULTS.image!, 'property');
      setMeta('twitter:image', DEFAULTS.image!);
      setCanonical(DEFAULTS.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description, meta.url, meta.image, meta.type]);
}
