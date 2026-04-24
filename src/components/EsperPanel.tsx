import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../lib/supabase';

export default function EsperPanel({ project }: { project: Project | null }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);
  const autoIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!project) return;
    setZoom(1);
    setPos({ x: 50, y: 50 });
    const steps = [
      { z: 1.2, x: 50, y: 50, t: 300 },
      { z: 1.8, x: 42, y: 55, t: 700 },
      { z: 2.6, x: 38, y: 60, t: 1200 },
      { z: 3.4, x: 35, y: 63, t: 1800 },
    ];
    steps.forEach((s) => {
      const id = window.setTimeout(() => {
        setZoom(s.z);
        setPos({ x: s.x, y: s.y });
      }, s.t);
      autoIdRef.current = id;
    });
    return () => {
      if (autoIdRef.current) clearTimeout(autoIdRef.current);
    };
  }, [project?.id]);

  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="relative aspect-[4/3] border border-[#e7b766]/40 bg-[#07070a] overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 py-1.5 text-[10px] bg-[#0b0a08]/80 border-b border-[#e7b766]/30">
            <div className="flex items-center gap-2 text-[#e7b766]">
              <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
              <span>ESPER — PHOTO ANALYSIS UNIT</span>
            </div>
            <div className="text-[#5ec8d8]">TRACK {String(Math.round(zoom * 37)).padStart(3, '0')}</div>
          </div>

          <div ref={imgRef} className="absolute inset-0 pt-6 overflow-hidden">
            <motion.div
              animate={{ scale: zoom, x: `${(50 - pos.x) * 0.8}%`, y: `${(50 - pos.y) * 0.8}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img src={project.image_url} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 mix-blend-overlay opacity-50"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent" />
            </motion.div>

            {/* Crosshair */}
            <motion.div
              animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="absolute inset-0 border border-[#e7b766]" />
              <div className="absolute top-1/2 -left-4 w-3 h-px bg-[#e7b766]" />
              <div className="absolute top-1/2 -right-4 w-3 h-px bg-[#e7b766]" />
              <div className="absolute left-1/2 -top-4 h-3 w-px bg-[#e7b766]" />
              <div className="absolute left-1/2 -bottom-4 h-3 w-px bg-[#e7b766]" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 bg-[#ff7a5c]" />
            </motion.div>
          </div>

          <div className="absolute bottom-0 inset-x-0 z-10 px-3 py-1.5 text-[10px] bg-[#0b0a08]/90 border-t border-[#e7b766]/30 flex items-center justify-between">
            <div className="text-[#e7b766]/90 truncate">
              FRAME: {project.title.toUpperCase()} · {project.year}
            </div>
            <div className="flex items-center gap-3 text-[#6b6660]">
              <span>ZOOM <span className="text-[#5ec8d8]">{zoom.toFixed(1)}×</span></span>
              <span>PX <span className="text-[#5ec8d8]">{String(Math.round(pos.x * 10)).padStart(3, '0')},{String(Math.round(pos.y * 10)).padStart(3, '0')}</span></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
