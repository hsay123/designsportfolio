"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  communityImpact,
  type CommunityImpactEntry,
  type CommunityType,
} from "@/lib/communityImpact";

/* ─────────────────────────────────────────────────────────────
   Community Impact — Finder gallery.
   Colored placeholder "photos" (no external images), click one
   for a detail sheet. Data lives in lib/communityImpact.ts.
   ───────────────────────────────────────────────────────────── */

const TYPE_LABEL: Record<CommunityType, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  talk: "Talk",
  meetup: "Meetup",
  volunteering: "Volunteering",
};

/* Deterministic hue/color from an id — stable across renders,
   gives each entry a distinct "photo". */
function seededColor(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hue = ((h >>> 0) % 360);
  return { hue, sat: 34 + ((h >>> 8) % 12), light: 66 + ((h >>> 16) % 10) };
}

function placeholderStyle(entry: CommunityImpactEntry) {
  const { hue, sat, light } = seededColor(entry.id);
  return {
    background: `linear-gradient(135deg, hsl(${hue} ${sat}% ${light}%), hsl(${(hue + 28) % 360} ${sat + 6}% ${Math.max(light - 12, 30)}%))`,
  };
}

/* Key-value row inside the detail sheet */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[11px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] text-stone-400 shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-stone-700 text-right font-[family-name:var(--font-noto)]">
        {value}
      </span>
    </div>
  );
}

/* ── Detail modal — Escape + backdrop + close button ── */
function CommunityDetailModal({
  entry,
  onClose,
}: {
  entry: CommunityImpactEntry;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    prevFocus.current = (document.activeElement as HTMLElement) || null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocus.current?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.22 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
    >
      <div className="absolute inset-0 bg-[#1c120a]/55 backdrop-blur-[2px]" />

      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="document"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[520px] bg-[#FDFBF7] rounded-xl border border-stone-200/70 shadow-[0_24px_70px_rgba(28,18,10,0.4)] focus:outline-none overflow-hidden"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* placeholder photo */}
        <div className="relative aspect-[16/9] w-full overflow-hidden" style={placeholderStyle(entry)}>
          <span
            className="absolute inset-0 flex items-center justify-center text-white/25 font-[family-name:var(--font-caveat)] text-[64px] leading-none select-none pointer-events-none"
            aria-hidden
          >
            {entry.title.slice(0, 2).toUpperCase()}
          </span>
          <span className="absolute top-3 left-3 text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.16em] text-white/85 bg-black/25 rounded-full px-2.5 py-1">
            {TYPE_LABEL[entry.type]} · {entry.role}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 text-white shadow hover:bg-black/55 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* info */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-[family-name:var(--font-caveat)] text-[26px] leading-[1.1] text-[#23180f]">
              {entry.title}
            </h3>
            <p className="mt-0.5 text-[12px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.12em] text-stone-400">
              {new Date(entry.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <p className="text-[13.5px] leading-relaxed text-stone-600 font-[family-name:var(--font-noto)]">
            {entry.description}
          </p>

          <div className="space-y-2 pt-1 border-t border-stone-200/70">
            <DetailRow label="Role" value={entry.role} />
            <DetailRow label="Organizer" value={entry.organizer} />
            <DetailRow label="Location" value={entry.location} />
          </div>

          {entry.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] px-2 py-0.5 bg-[#f4ede0] text-[#8a6a3b] rounded-sm border border-[#e6dcc6]"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Single gallery card (a placeholder "photo") ── */
function GalleryCard({ entry, onOpen }: { entry: CommunityImpactEntry; onOpen: (e: CommunityImpactEntry) => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(entry)}
      whileHover={reducedMotion ? {} : { y: -3 }}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23180f]/50 rounded-lg"
      aria-label={`Open details for ${entry.title}`}
    >
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.12)]" style={placeholderStyle(entry)}>
        <span
          className="absolute inset-0 flex items-center justify-center text-white/30 font-[family-name:var(--font-caveat)] text-[42px] leading-none select-none pointer-events-none transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        >
          {entry.title.slice(0, 2).toUpperCase()}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/55 to-transparent">
          <p className="text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] text-white/75">
            {new Date(entry.date).getFullYear()} · {TYPE_LABEL[entry.type]}
          </p>
          <p className="text-[13px] font-medium text-white leading-tight line-clamp-2">{entry.title}</p>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[9px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] bg-white/85 text-stone-700 rounded-full px-2 py-0.5 shadow">
            View
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Gallery grid ── */
export function CommunityGallery() {
  const [openEntry, setOpenEntry] = useState<CommunityImpactEntry | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <div className="space-y-4" aria-labelledby="community-gallery-title">
      <div>
        <h3
          id="community-gallery-title"
          className="font-[family-name:var(--font-caveat)] text-[22px] leading-none text-stone-800"
        >
          Community Impact
        </h3>
        <p className="mt-1 text-[12.5px] text-stone-500 font-[family-name:var(--font-noto)]">
          Hackathons, workshops, and meetups — {communityImpact.length} memories. Click a photo for details.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch"
        initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {communityImpact.map((entry) => (
          <GalleryCard key={entry.id} entry={entry} onOpen={setOpenEntry} />
        ))}
      </motion.div>

      <AnimatePresence>
        {openEntry && <CommunityDetailModal entry={openEntry} onClose={() => setOpenEntry(null)} />}
      </AnimatePresence>
    </div>
  );
}