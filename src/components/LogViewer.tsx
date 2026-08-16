import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, RefreshCw, Trash2, Filter, Circle } from 'lucide-react';
import { type LogRow, type LogLevel } from '../lib/supabase';
import { subscribeToFlush, getLocalLogs, clearLocalLogs } from '../lib/logger';

const LEVEL_STYLES: Record<LogLevel, { dot: string; text: string; bg: string }> = {
  error: { dot: 'bg-red-500', text: 'text-red-300', bg: 'bg-red-500/10' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-300', bg: 'bg-amber-500/10' },
  info: { dot: 'bg-sky-500', text: 'text-sky-300', bg: 'bg-sky-500/10' },
  log: { dot: 'bg-gray-400', text: 'text-gray-300', bg: 'bg-gray-500/10' },
  debug: { dot: 'bg-emerald-500', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
};

const LEVELS: LogLevel[] = ['error', 'warn', 'info', 'log', 'debug'];

export default function LogViewer() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set(LEVELS));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onDock = () => setOpen((v) => !v);
    window.addEventListener('dock:logs', onDock);
    return () => window.removeEventListener('dock:logs', onDock);
  }, []);

  // Reads the logger's in-memory session buffer. app_logs is no longer
  // publicly readable (2026-08-16 hardening), and this session's rows are
  // all the viewer ever showed by default anyway.
  const fetchLogs = useCallback(() => {
    setRows(getLocalLogs());
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchLogs();
    const unsub = subscribeToFlush(() => fetchLogs());
    return unsub;
  }, [open, fetchLogs]);

  const filtered = useMemo(
    () => rows.filter((r) => activeLevels.has(r.level as LogLevel)),
    [rows, activeLevels],
  );

  const toggleLevel = (level: LogLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSession = () => {
    if (!confirm('Clear logs for this session?')) return;
    clearLocalLogs();
    setRows([]);
  };

  return (
    <>
      {/* No floating button — the control dock owns the logs toggle at every
          viewport via the dock:logs event. */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800 shadow-2xl flex flex-col"
            style={{ height: '45vh' }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-white">Log Viewer</h3>
                <span className="text-xs text-gray-500">
                  {filtered.length} / {rows.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-2">this session</span>
                <button
                  onClick={() => fetchLogs()}
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => clearSession()}
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Clear view"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 px-4 py-2 border-b border-gray-800 flex-shrink-0">
              <Filter size={12} className="text-gray-500 flex-shrink-0" />
              {LEVELS.map((lvl) => {
                const active = activeLevels.has(lvl);
                const style = LEVEL_STYLES[lvl];
                const count = rows.filter((r) => r.level === lvl).length;
                return (
                  <button
                    key={lvl}
                    onClick={() => toggleLevel(lvl)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      active
                        ? `${style.bg} ${style.text} border-gray-700`
                        : 'bg-transparent text-gray-600 border-gray-800 hover:text-gray-400'
                    }`}
                  >
                    <Circle size={7} className={`${style.dot} rounded-full`} fill="currentColor" />
                    <span>{lvl}</span>
                    <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                  No logs yet
                </div>
              ) : (
                <ul className="divide-y divide-gray-900">
                  {filtered.map((row) => {
                    const style = LEVEL_STYLES[row.level as LogLevel] ?? LEVEL_STYLES.log;
                    const isOpen = expanded.has(row.id);
                    const time = new Date(row.created_at).toLocaleTimeString([], {
                      hour12: false,
                    });
                    return (
                      <li key={row.id} className="hover:bg-gray-900/50">
                        <button
                          onClick={() => toggleExpand(row.id)}
                          className="w-full text-left px-4 py-2 flex items-start gap-3"
                        >
                          <span className="text-gray-600 flex-shrink-0 tabular-nums">{time}</span>
                          <span
                            className={`flex-shrink-0 w-14 font-semibold uppercase ${style.text}`}
                          >
                            {row.level}
                          </span>
                          <span className="text-gray-500 flex-shrink-0 w-28 truncate">
                            {row.source}
                          </span>
                          <span className="text-gray-200 break-all flex-1">{row.message}</span>
                        </button>
                        {isOpen && (
                          <pre className="px-4 pb-3 pl-[180px] text-[11px] text-gray-400 whitespace-pre-wrap break-all">
                            {JSON.stringify(row.details, null, 2)}
                          </pre>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
