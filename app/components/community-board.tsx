"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  communityImpact,
  type CommunityImpactEntry,
  type CommunityType,
} from "@/lib/communityImpact";

/* ─────────────────────────────────────────────────────────────
   Community Impact — corkboard of memories.
   Paper × cork × tape, hand-written Caveat accents.
   Data lives in lib/communityImpact.ts (edit entries there).
   ───────────────────────────────────────────────────────────── */

type Filter = "all" | CommunityType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hackathon", label: "Hackathons" },
  { id: "workshop", label: "Workshops" },
  { id: "talk", label: "Talks" },
  { id: "meetup", label: "Meetups" },
  { id: "volunteering", label: "Volunteering" },
];

const TYPE_LABEL: Record<CommunityType, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  talk: "Talk",
  meetup: "Meetup",
  volunteering: "Volunteering",
};

/* Deterministic rotation from an id hash — stable across renders. */
function seededRotation(id: string, maxDeg = 6): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // map hash → -maxDeg..maxDeg
  return ((h >>> 0) % (maxDeg * 200 + 1)) / 100 - maxDeg;
}

function seededTapeSlot(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 4;
  return h;
}

const TAPE_W = 46;
const TAPE_H = 18;

/* ── Washi tape piece (top edge of a pinned card) ── */
function WashiTape({ rotate = 0 }: { rotate?: number }) {
  return (
    <svg
      width={TAPE_W}
      height={TAPE_H}
      viewBox="0 0 46 18"
      className="text-amber-200/90"
      aria-hidden
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M0 18 L0 9 L4 7 L8 11 L13 8 L18 12 L23 9 L28 13 L33 8 L38 11 L42 7 L46 10 L46 18 Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

/* ── Push pin ── */
function PushPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="text-[#b45309]" aria-hidden>
      <circle cx="7" cy="7" r="5.5" fill="currentColor" opacity="0.82" />
      <circle cx="5" cy="5" r="1.5" fill="white" opacity="0.55" />
    </svg>
  );
}

/* ── Hand-drawn paper placeholder photo (no image supplied) ── */
function PaperPlaceholder({ text = "a memory to pin here" }: { text?: string }) {
  return (
    <div
      className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "repeating-linear-gradient(0deg, #fdfaf3 0 22px, #f3ece0 22px 23px)",
      }}
    >
      {/* ruled lines of a journal page */}
      <svg
        className="absolute inset-0 w-full h-full text-[#d8cfbe]"
        preserveAspectRatio="none"
        viewBox="0 0 100 60"
        aria-hidden
      >
        <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 5" />
      </svg>
      {/* doodle: corner fold */}
      <svg className="absolute top-0 right-0 w-6 h-6 text-[#e5dcc9]" viewBox="0 0 24 24" aria-hidden>
        <path d="M0 24 L24 24 L24 8 Q12 14 4 24 Z" fill="currentColor" />
      </svg>
      <span className="relative font-[family-name:var(--font-caveat)] text-[18px] leading-tight text-[#8a7f6a] text-center px-2">
        {text}
      </span>
    </div>
  );
}

/* ── Ticket stub (speaker / organizer — perforated divider) ── */
function TicketStub({ entry }: { entry: CommunityImpactEntry }) {
  return (
    <div className="relative">
      <div
        className="relative w-full bg-[#fbf7f0] border border-[#e2d8c6] shadow-[0_2px_8px_rgba(63,44,34,0.08)]"
        style={{ transform: `rotate(${seededRotation(entry.id, 3)}deg)` }}
      >
        {/* ticket header — Caveat title */}
        <div className="px-4 pt-3 pb-4 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block w-px self-stretch bg-[#c9b a]" aria-hidden />
            <span className="text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.18em] text-[#a03]">
              {TYPE_LABEL[entry.type]} · {entry.role}
            </span>
          </div>
          <h4 className="font-[family-name:var(--font-caveat)] text-[22px] leading-[1.05] text-[#23180f]">
            {entry.title}
          </h4>
          <p className="mt-1.5 text-[12.5px] leading-snug text-[#66594a] font-[family-name:var(--font-noto)] [&_b]:text-[#23180f]">
            {entry.description}
          </p>
        </div>

        {/* perforated divider */}
        <div className="relative mx-3 border-t border-dashed border-[#ca-news]">
          <span className="absolute -left-[7px] -top-[7px] w-[14px] h-[14px] rounded-full bg-[#faf8f5]" />
          <span className="absolute -right-[7px] -top-[7px] w-[14px] h-[14px] rounded-full bg-[#faf8f5]" />
        </div>

        {/* stub meta */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-caveat)] text-[18px] text-[#23180f] leading-none">
              {new Date(entry.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-courier-prime)] tracking-[0.12em] text-[#8b7c67] uppercase">
              {entry.organizer}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-[family-name:var(--font-courier-prime)] text-[#8b7c67]">{entry.location}</span>
            {entry.tags?.length ? (
              <span className="mt-1 flex gap-1">
                {entry.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[9px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] px-1.5 py-0.5 bg-[#f4ede0] text-[#8a6a3b] rounded-sm border border-[#e6dcc6]">
                    {t}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Passport stamp — circular ink stamp for quick attendances ── */
function PassportStamp({ entry }: { entry: CommunityImpactEntry }) {
  const first = entry.title.split(" ")[0] ?? "MC";
  const year = entry.date.slice(0, 4);
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ transform: `rotate(${seededRotation(entry.id, 6)}deg)` }}
    >
      <svg width="92" height="92" viewBox="0 0 100 100" className="text-[#b45309]/80" aria-hidden>
        {/* dashed circular border */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 4" />
        {/* curved text (top) */}
        <defs>
          <path id={`stampArc-${entry.id}`} d="M 18 56 A 38 38 0 1 1 82 56" fill="none" />
        </defs>
        <text className="font-[family-name:var(--font-caveat)]" fontSize="13" fill="currentColor">
          <textPath href={`#stampArc-${entry.id}`}>{entry.title.toUpperCase()}</textPath>
        </text>
        {/* initial + year */}
        <text x="50" y="60" textAnchor="middle" className="font-[family-name:var(--font-caveat)]" fontSize="24" fill="currentColor">
          {first.slice(0, 2).toUpperCase()}
        </text>
        <text x="50" y="76" textAnchor="middle" className="font-[family-name:var(--font-courier-prime)]" fontSize="8" fill="currentColor" letterSpacing="1">
          {year}
        </text>
      </svg>
      <span className="absolute inset-0 flex items-end justify-center font-[family-name:var(--font-caveat)] text-[10px] text-[#a03] opacity-0 translate-y-1 transition-all duration-200 group-hover[data-stamp]:opacity-100 group-hover[data-stamp]:translate-y-0" />
    </div>
  );
}

/* ── Photo modal — focus trap + Escape + scroll lock ── */
function PhotoModal({
  entry,
  onClose,
  onPrev,
  onNext,
  imageIndex,
}: {
  entry: CommunityImpactEntry;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  imageIndex: number;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const total = entry.images.length;

  useEffect(() => {
    prevFocus.current = (document.activeElement as HTMLElement) || null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      // focus trap
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
  }, [onClose, onPrev, onNext]);

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
      {/* backdrop */}
      <div className="absolute inset-0 bg-[#1c120a]/60 backdrop-blur-[2px]" />

      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="document"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] focus:outline-none"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotate: -1 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, rotate: 0.5 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24 }}
      >
        {/* washi tape on top of modal */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" aria-hidden>
          <WashiTape rotate={-2} />
        </div>

        {/* photo frame */}
        <div className="relative bg-[#fdfaf3] p-2.5 pb-3 shadow-[0_20px_60px_rgba(28,18,10,0.35)]" style={{ transform: "rotate(0.4deg)" }}>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {entry.images.length > imageIndex ? (
              <Image
                src={entry.images[imageIndex]}
                alt={entry.title}
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover"
              />
            ) : (
              <PaperPlaceholder />
            )}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 shadow text-[#23180f] hover:bg-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 shadow text-[#23180f] hover:bg-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-[family-name:var(--font-courier-prime)] bg-[#23180f]/70 text-[#fdf6e8] rounded-full">
                  {imageIndex + 1} / {total}
                </div>
              </>
            )}
          </div>

          <div className="pt-3 px-0.5">
            <h3 className="font-[family-name:var(--font-caveat)] text-[24px] leading-[1.1] text-[#23180f]">{entry.title}</h3>
            <p className="mt-1 text-[13px] leading-snug text-[#66594a] font-[family-name:var(--font-noto)] whitespace-pre-line">
              {entry.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.14em] text-[#8b7c67]">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {entry.location}
              </span>
              <span className="text-[11px] font-[family-name:var(--font-courier-prime)] text-[#8b7c67]">
                {TYPE_LABEL[entry.type]} · {entry.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-[#23180f] text-[#fdf6e8] shadow hover:bg-[#3a2b1c] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── A pinned card on the board ── */
function PinnedCard({ entry, onOpen }: { entry: CommunityImpactEntry; onOpen: (e: CommunityImpactEntry) => void }) {
  const reducedMotion = useReducedMotion();
  const rot = seededRotation(entry.id);
  const tapeSlot = seededTapeSlot(entry.id);
  const tapePositions = [
    { left: "8%", top: "0" },
    { left: "78%", top: "6%" },
    { left: "46%", top: "0" },
    { left: "20%", top: "8%" },
  ];
  const tape = tapePositions[tapeSlot];

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(entry)}
      whileHover={reducedMotion ? {} : { rotate: rot * -0.3, scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309]/60"
      aria-label={`Open details for ${entry.title}`}
      style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center 30%" }}
    >
      <div className="relative bg-[#fdfaf3] p-2.5 pb-3 shadow-[0_6px_18px_rgba(63,44,34,0.16)] transition-shadow group-hover:shadow-[0_10px_26px_rgba(63,44,34,0.22)]">
        {/* tape */}
        <div className="absolute -top-[9px] z-10" style={{ left: tape.left }} aria-hidden>
          <WashiTape rotate={tapeSlot % 2 === 0 ? -8 : 7} />
        </div>

        {/* photo or paper placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {entry.images.length > 0 ? (
            <Image
              src={entry.images[0]}
              alt={entry.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 300px"
              className="object-cover"
            />
          ) : (
            <PaperPlaceholder text={`awaiting a photo —\n${TYPE_LABEL[entry.type]} ${entry.role}`} />
          )}
        </div>

        <div className="pt-2.5 px-0.5">
          <h4 className="font-[family-name:var(--font-caveat)] text-[19px] leading-[1.05] text-[#23180f]">{entry.title}</h4>
          <p className="mt-0.5 text-[11.5px] leading-snug text-[#8b7c67] font-[family-name:var(--font-noto)] line-clamp-2">{entry.description}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.12em] text-[#a03]">
              {new Date(entry.date).getFullYear()}
            </span>
            <PushPin />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ── Filter chip ── */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.96 }}
      className={`px-3 py-1 rounded-full font-[family-name:var(--font-caveat)] text-[17px] leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309]/60 ${
        active
          ? "bg-[#23180f] text-[#fdf6e8] shadow"
          : "bg-[#fdfaf3] text-[#66594a] hover:bg-[#f3ece0] hover:text-[#23180f]"
      }`}
    >
      {label}
    </motion.button>
  );
}

/* ── Main board ── */
export function CommunityBoard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openEntry, setOpenEntry] = useState<CommunityImpactEntry | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const filtered = useMemo(
    () => (filter === "all" ? communityImpact : communityImpact.filter((e) => e.type === filter)),
    [filter]
  );

  // group by year, newest first
  const byYear = useMemo(() => {
    const map = new Map<string, CommunityImpactEntry[]>();
    for (const e of filtered) {
      const year = e.date.slice(0, 4);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const open = (e: CommunityImpactEntry) => {
    setImageIndex(0);
    setOpenEntry(e);
    const next = () => {
      setImageIndex((i) => (e.images.length ? (i + 1) % e.images.length : 0));
    };
    const prev = () => {
      setImageIndex((i) => (e.images.length ? (i - 1 + e.images.length) % e.images.length : 0));
    };
    return { next, prev };
  };

  return (
    <section id="community" className="relative mt-24 lg:mt-32 scroll-mt-16" aria-labelledby="community-title">
      {/* heading — hand-written, Caveat */}
      <div className="relative text-center px-4">
        <h2
          id="community-title"
          className="font-[family-name:var(--font-caveat)] text-[34px] sm:text-[40px] leading-[1.02] text-[#23180f]"
          style={{ transform: "rotate(-0.8deg)" }}
        >
          Bits of the community that shaped how I think
        </h2>
        <p className="mt-2 font-[family-name:var(--font-noto)] text-[15px] text-[#66594a] max-w-md mx-auto leading-snug">
          Hackathons I lost (and won), workshops I ran, meetups where I showed up early and stayed late.
        </p>
      </div>

      {/* filter chips — pinned like a paper strip */}
      <div className="mt-7 flex flex-wrap justify-center gap-2.5" role="group" aria-label="Filter community entries">
        {FILTERS.map((f) => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      {/* corkboard panel */}
      <div
        className="relative mt-8 mx-1 sm:mx-4 lg:mx-10 rounded-[6px] p-6 sm:p-8 md:p-12 overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, #c6945855, transparent 45%)," +
            "radial-gradient(circle at 85% 90%, #a06a2f66, transparent 50%)," +
            "linear-gradient(135deg, #b4823f, #a06a2f)",
        }}
      >
        {/* cork grain */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(0,0,0,0.12) ila 1px, transparent 2px)," +
              "radial-gradient(circle at 70% 60%, rgba(0,0,0,0.10) 1px, transparent 2px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* thumbtacks in the corners */}
        {[
          { top: "6%", left: "4%" },
          { top: "6%", right: "4%" },
          { bottom: "6%", left: "4%" },
          { bottom: "6%", right: "4%" },
        ].map((pos, i) => (
          <span key={i} className="absolute z-10" style={pos} aria-hidden>
            <PushPin />
          </span>
        ))}

        {/* year group rows */}
        <div className="relative flex flex-col gap-10">
          <AnimatePresence mode="popLayout">
            {byYear.map(([year, entries]) => (
              <motion.div
                key={year}
                layout
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              >
                <YearTab year={year} entries={entries.length} />

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-9 items-start">
                  {entries.map((entry) => (
                    <BoardPiece key={entry.id} entry={entry} onOpen={open} />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {byYear.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-[family-name:var(--font-caveat)] text-[24px] text-[#fdf6e8]/80 text-center"
            >
              nothing pinned here yet — go make a memory
            </motion.p>
          )}
        </div>
      </div>

      {/* photo modal */}
      <AnimatePresence>
        {openEntry && (
          <PhotoModal
            entry={openEntry}
            onClose={() => setOpenEntry(null)}
            onPrev={() => imageIndex - 1}
            onNext={() => imageIndex + 1}
            imageIndex={imageIndex}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Year tab — a little Manila folder tab sticking up ── */
function YearTab({ year, entries }: { year: string; entries: number }) {
  return (
    <div className="flex items-end gap-0">
      <span
        className="inline-block font-[family-name:var(--font-caveat)] text-[24px] leading-none px-3 pt-2 pb-1 bg-[#f4ede0] text-[#23180f] shadow-[0_2px_6px_rgba(63,44,34,0.18)]"
        style={{ transform: "rotate(-1.2deg)" }}
      >
        {year}
      </span>
      <span className="ml-2 text-[11px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.16em] text-[#fdf6e8]/70 pb-1">
        {entries} {entries === 1 ? "memory" : "memories"}
      </span>
    </div>
  );
}

/* ── Chooses the right presentation for one entry ── */
function BoardPiece({ entry, onOpen }: { entry: CommunityImpactEntry; onOpen: (e: CommunityImpactEntry) => void }) {
  const isImpactEvent = entry.type === "talk" || entry.type === "workshop";
  const hasPhoto = entry.images.length > 0;

  // speaker/organizer of a talk/workshop → ticket stub (bring your own seat)
  if (isImpactEvent && (entry.role === "speaker" || entry.role === "organizer")) {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.22 }} className="group/ticket relative">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="font-[family-name:var(--font-courier-prime)] text-[10px] uppercase tracking-[0.16em] text-[#fdf6e8]/80">admit one</span>
          <span className="inline-block w-4 border-t border-dashed border-[#fdf6e8]/50" />
        </div>
        <TicketStub entry={entry} />
      </motion.div>
    );
  }

  // has a real photo → pinned photo card
  if (hasPhoto) {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.22 }}>
        <PinnedCard entry={entry} onOpen={onOpen} />
      </motion.div>
    );
  }

  // no photo, quick attendance → passport stamp row item
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.22 }}
      className="group/[stamp] flex flex-col items-center justify-center min-h-[120px]"
      data-stamp
    >
      <PassportStamp entry={entry} />
      <span className="mt-1 text-center font-[family-name:var(--font-caveat)] text-[15px] text-[#fdf6e8]/85 leading-tight max-w-[150px]">
        {entry.title}
      </span>
      <span className="text-[10px] font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.12em] text-[#fdf6e8]/55 mt-0.5">
        {TYPE_LABEL[entry.type]} · {entry.role}
      </span>
    </motion.div>
  );
}
