import { supabase, type LogLevel } from './supabase';

const SESSION_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type QueueItem = {
  level: LogLevel;
  message: string;
  details: Record<string, unknown>;
  source: string;
};

const queue: QueueItem[] = [];
let flushing = false;
let flushTimer: number | null = null;
const listeners = new Set<() => void>();

function safeStringify(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function argsToMessage(args: unknown[]): { message: string; details: Record<string, unknown> } {
  const message = args.map(safeStringify).join(' ');
  const details: Record<string, unknown> = {
    args: args.map((a) => {
      if (a instanceof Error) {
        return { name: a.name, message: a.message, stack: a.stack };
      }
      if (typeof a === 'object' && a !== null) {
        try {
          return JSON.parse(JSON.stringify(a));
        } catch {
          return String(a);
        }
      }
      return a;
    }),
  };
  return { message, details };
}

async function flush() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, queue.length);
  const rows = batch.map((item) => ({
    level: item.level,
    message: item.message.slice(0, 4000),
    details: item.details,
    source: item.source,
    url: typeof window !== 'undefined' ? window.location.href : '',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    session_id: SESSION_ID,
  }));
  try {
    const { error } = await supabase.from('app_logs').insert(rows);
    if (error) {
      originalConsole.error('[logger] insert failed:', error.message);
    } else {
      listeners.forEach((fn) => fn());
    }
  } catch (err) {
    originalConsole.error('[logger] insert threw:', err);
  } finally {
    flushing = false;
    if (queue.length > 0) scheduleFlush();
  }
}

function scheduleFlush(immediate = false) {
  if (immediate) {
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    void flush();
    return;
  }
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 400);
}

export function log(level: LogLevel, source: string, args: unknown[]) {
  const { message, details } = argsToMessage(args);
  queue.push({ level, message, details, source });
  scheduleFlush(level === 'error' || level === 'warn');
}

function flushBeacon() {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  const rows = batch.map((item) => ({
    level: item.level,
    message: item.message.slice(0, 4000),
    details: item.details,
    source: item.source,
    url: typeof window !== 'undefined' ? window.location.href : '',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    session_id: SESSION_ID,
  }));
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/app_logs`;
  const body = JSON.stringify(rows);
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function subscribeToFlush(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSessionId() {
  return SESSION_ID;
}

const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug.bind(console),
};

let installed = false;

export function installLogger() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  (['log', 'info', 'warn', 'error', 'debug'] as LogLevel[]).forEach((level) => {
    const orig = originalConsole[level];
    console[level] = (...args: unknown[]) => {
      orig(...args);
      log(level, 'console', args);
    };
  });

  window.addEventListener('error', (event) => {
    log('error', 'window.error', [
      event.message,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
    ]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    log('error', 'unhandledrejection', [
      reason instanceof Error ? reason : 'Unhandled promise rejection',
      reason instanceof Error ? { stack: reason.stack } : { reason },
    ]);
  });

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (target && target !== (window as unknown as EventTarget) && 'tagName' in target) {
        const tag = (target as HTMLElement).tagName?.toLowerCase();
        const src =
          (target as HTMLImageElement).src ||
          (target as HTMLLinkElement).href ||
          '';
        log('error', 'resource', [`Failed to load <${tag}>`, { src, tag }]);
      }
    },
    true,
  );

  installViteHmrHooks();
  installFetchHook();
  installOverlayObserver();

  window.addEventListener('pagehide', flushBeacon);
  window.addEventListener('beforeunload', flushBeacon);
}

function installViteHmrHooks() {
  const hot = (import.meta as unknown as { hot?: ViteHot }).hot;
  if (!hot) return;
  const events: Array<[string, LogLevel]> = [
    ['vite:error', 'error'],
    ['vite:ws:disconnect', 'warn'],
    ['vite:beforeUpdate', 'debug'],
    ['vite:afterUpdate', 'debug'],
    ['vite:invalidate', 'warn'],
    ['vite:beforeFullReload', 'warn'],
    ['vite:beforePrune', 'debug'],
    ['vite:ws:connect', 'debug'],
  ];
  for (const [name, level] of events) {
    try {
      hot.on(name, (payload: unknown) => {
        const details = normalizeVitePayload(name, payload);
        log(level, name, [details.message, details.extra]);
      });
    } catch {
      /* ignore */
    }
  }
}

type ViteHot = {
  on: (event: string, cb: (payload: unknown) => void) => void;
};

function normalizeVitePayload(
  name: string,
  payload: unknown,
): { message: string; extra: Record<string, unknown> } {
  if (name === 'vite:error' && payload && typeof payload === 'object') {
    const p = payload as {
      err?: {
        message?: string;
        stack?: string;
        plugin?: string;
        id?: string;
        loc?: { file?: string; line?: number; column?: number };
        frame?: string;
      };
    };
    const err = p.err ?? {};
    const loc = err.loc
      ? `${err.loc.file ?? err.id ?? ''}:${err.loc.line ?? '?'}:${err.loc.column ?? '?'}`
      : err.id ?? '';
    const plugin = err.plugin ? `[plugin:${err.plugin}] ` : '';
    return {
      message: `${plugin}${err.message ?? 'Vite error'} ${loc}`.trim(),
      extra: {
        plugin: err.plugin,
        id: err.id,
        loc: err.loc,
        frame: err.frame,
        stack: err.stack,
      },
    };
  }
  if (payload && typeof payload === 'object') {
    return { message: name, extra: payload as Record<string, unknown> };
  }
  return { message: `${name}: ${String(payload ?? '')}`, extra: {} };
}

function installFetchHook() {
  if (typeof window === 'undefined' || !window.fetch) return;
  const orig = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url =
      typeof args[0] === 'string'
        ? args[0]
        : args[0] instanceof URL
        ? args[0].toString()
        : (args[0] as Request).url;
    if (url.includes('/rest/v1/app_logs')) return orig(...args);
    try {
      const res = await orig(...args);
      if (!res.ok) {
        log('warn', 'fetch', [`${res.status} ${res.statusText} ${url}`, { status: res.status, url }]);
      }
      return res;
    } catch (err) {
      log('error', 'fetch', [
        `Fetch failed: ${url}`,
        { url, error: err instanceof Error ? err.message : String(err) },
      ]);
      throw err;
    }
  };
}

function installOverlayObserver() {
  if (typeof window === 'undefined' || !document?.body) return;
  const seen = new WeakSet<Element>();
  const extract = (el: Element) => {
    if (seen.has(el)) return;
    seen.add(el);
    const root = (el as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot ?? el;
    const pick = (sel: string) =>
      (root as ParentNode).querySelector(sel)?.textContent?.trim() ?? '';
    const message = pick('.message, .message-body, pre.message');
    const file = pick('.file');
    const frame = pick('.frame');
    const plugin = pick('.plugin');
    log('error', 'vite-overlay', [
      `${plugin ? `[${plugin}] ` : ''}${message || 'Vite error overlay shown'} ${file}`.trim(),
      { message, file, frame, plugin },
    ]);
  };
  const scan = (root: ParentNode) => {
    root.querySelectorAll('vite-error-overlay').forEach(extract);
  };
  scan(document);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const el = n as Element;
        if (el.tagName?.toLowerCase() === 'vite-error-overlay') extract(el);
        else scan(el);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
