"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  MY_TEAM_CARDS, cardById,
  getStarColor, STAR_COLORS, TIER_GLOW, tierFromLevel,
  type MTCard, type SavedTeam, EMPTY_TEAM,
} from "@/lib/myTeamData";

// ─── Star strip ─────────────────────────────────────────────────────────────────
function Stars({ level, size = 11 }: { level: number; size?: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(slot => {
        const color = getStarColor(slot, level);
        const hex = STAR_COLORS[color];
        return (
          <span
            key={slot}
            style={{
              fontSize: size,
              color: hex,
              lineHeight: 1,
              textShadow: color !== "empty" ? `0 0 6px ${hex}` : "none",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

// ─── 2K-style card ──────────────────────────────────────────────────────────────
function Card2K({
  card,
  size = "md",
  inTeam,
  slot,
  onClick,
  glow,
}: {
  card: MTCard;
  size?: "sm" | "md" | "lg";
  inTeam?: "starter" | "bench" | null;
  slot?: string; // e.g. "Starter 1"
  onClick?: () => void;
  glow?: boolean;
}) {
  const W = size === "lg" ? 220 : size === "sm" ? 120 : 160;
  const H = Math.round(W * 1.42);
  const tier = tierFromLevel(card.starLevel);
  const tierColor = TIER_GLOW[tier];
  const FONT_SCALE = W / 160;

  return (
    <motion.div
      onClick={onClick}
      className="relative select-none cursor-pointer flex-shrink-0"
      style={{ width: W, height: H }}
      whileHover={onClick ? { scale: 1.05, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
    >
      {/* Card container */}
      <div
        className="relative overflow-hidden"
        style={{
          width: W, height: H,
          borderRadius: W * 0.065,
          border: `${size === "sm" ? 1.5 : 2}px solid ${inTeam ? tierColor : "rgba(255,255,255,0.12)"}`,
          boxShadow: (glow || inTeam)
            ? `0 0 ${size === "lg" ? 32 : 18}px ${tierColor}66, 0 4px 20px rgba(0,0,0,0.7)`
            : "0 4px 20px rgba(0,0,0,0.5)",
          background: "#0a0f1a",
        }}
      >
        {/* Photo */}
        {card.photo ? (
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${card.photo})`,
              backgroundSize: "cover",
              backgroundPosition: card.photoPos ?? "center top",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${card.teamColor}44 0%, #0a0f1a 60%)`,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.72) 0%,
              rgba(0,0,0,0.08) 25%,
              rgba(0,0,0,0.05) 45%,
              rgba(0,0,0,0.82) 70%,
              rgba(0,0,0,0.97) 100%
            )`,
          }}
        />

        {/* Diagonal team-color accent band */}
        <div
          style={{
            position: "absolute",
            left: "-20%", right: "-20%",
            bottom: "32%",
            height: size === "sm" ? 3 : 4,
            background: `linear-gradient(90deg, transparent, ${card.teamColor}dd, ${card.accentColor}88, ${card.teamColor}dd, transparent)`,
            transform: "rotate(-4deg)",
          }}
        />

        {/* Top-left: OVR number */}
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              borderRadius: 4,
              padding: "2px 5px",
              border: `1px solid ${tierColor}55`,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 900,
                color: tierColor,
                fontSize: FONT_SCALE * 18,
                lineHeight: 1,
                display: "block",
                textShadow: `0 0 8px ${tierColor}`,
              }}
            >
              {Math.round(55 + card.starLevel * 2.8)}
            </span>
          </div>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: FONT_SCALE * 8,
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginTop: 2,
            }}
          >
            {card.position}
          </span>
        </div>

        {/* Top-right: team abbr */}
        <div
          style={{
            position: "absolute", top: 8, right: 8,
            fontFamily: "monospace", fontWeight: 800,
            fontSize: FONT_SCALE * 9, color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}
        >
          {card.teamAbbr}
        </div>

        {/* In-team badge */}
        {inTeam && (
          <div
            style={{
              position: "absolute", top: 8, right: 8,
              background: inTeam === "starter" ? "#84cc16" : "#f59e0b",
              color: "#000", borderRadius: 3,
              padding: "1px 5px",
              fontFamily: "monospace", fontWeight: 800,
              fontSize: FONT_SCALE * 7,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            {slot ?? (inTeam === "starter" ? "STR" : "BEN")}
          </div>
        )}

        {/* Bottom section */}
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: `${FONT_SCALE * 6}px ${FONT_SCALE * 8}px ${FONT_SCALE * 7}px`,
          }}
        >
          {/* Stars */}
          <Stars level={card.starLevel} size={FONT_SCALE * 10} />

          {/* Name */}
          <p
            style={{
              fontFamily: "monospace", fontWeight: 700,
              fontSize: FONT_SCALE * 8.5, color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase", letterSpacing: "0.06em",
              margin: "3px 0 0",
            }}
          >
            {card.firstName}
          </p>
          <p
            className="font-playfair"
            style={{
              fontWeight: 900, fontStyle: "italic",
              fontSize: FONT_SCALE * 15.5,
              color: "#fff",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {card.lastName}
          </p>

          {/* Era + stat strip */}
          <div
            className="flex items-center justify-between"
            style={{ marginTop: FONT_SCALE * 3 }}
          >
            <span
              style={{
                fontFamily: "monospace", fontWeight: 700,
                fontSize: FONT_SCALE * 7.5, color: tierColor,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}
            >
              {card.era}
            </span>
            <span
              style={{
                fontFamily: "monospace", fontSize: FONT_SCALE * 7,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {card.ppg} PPG
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty slot ──────────────────────────────────────────────────────────────────
function EmptySlot({ label, isStarter }: { label: string; isStarter: boolean }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center"
      style={{
        width: 120, height: 170,
        border: `2px dashed ${isStarter ? "rgba(132,204,22,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        background: isStarter ? "rgba(132,204,22,0.03)" : "rgba(255,255,255,0.02)",
      }}
    >
      <span style={{ fontSize: 22, color: isStarter ? "rgba(132,204,22,0.3)" : "rgba(255,255,255,0.1)" }}>+</span>
      <p
        style={{
          fontFamily: "monospace", fontSize: 8, fontWeight: 700,
          color: isStarter ? "rgba(132,204,22,0.4)" : "rgba(255,255,255,0.2)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Card picker modal ────────────────────────────────────────────────────────────
function CardModal({
  card,
  inStarters,
  inBench,
  onAddStarter,
  onAddBench,
  onRemove,
  onClose,
}: {
  card: MTCard;
  inStarters: boolean;
  inBench: boolean;
  onAddStarter: () => void;
  onAddBench: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const inTeam = inStarters || inBench;
  const tier = tierFromLevel(card.starLevel);
  const tierColor = TIER_GLOW[tier];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row items-center gap-8 p-8"
        style={{
          background: "#0d1526",
          border: `2px solid ${tierColor}55`,
          borderRadius: 16,
          boxShadow: `0 0 60px ${tierColor}33`,
          maxWidth: 600, width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        <Card2K card={card} size="lg" />

        <div className="flex flex-col gap-4 flex-1">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "PPG", val: card.ppg },
              { label: "RPG", val: card.rpg },
              { label: "APG", val: card.apg },
              { label: "FG%", val: `${card.fg}%` },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-mono text-white/30 text-[8px] uppercase tracking-widest">{s.label}</p>
                <p className="font-mono font-bold text-white text-sm mt-0.5">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-2">Badges</p>
            <div className="flex flex-wrap gap-1.5">
              {card.badges.map(b => (
                <span
                  key={b}
                  className="font-mono text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
                  style={{ border: `1px solid ${tierColor}`, color: tierColor, borderRadius: 3 }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-2">
            {inTeam ? (
              <button
                onClick={onRemove}
                className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs text-white/60 border border-white/20 rounded hover:border-red-500 hover:text-red-400 transition-colors"
              >
                Remove from Team
              </button>
            ) : (
              <>
                <button
                  onClick={onAddStarter}
                  className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs rounded transition-all"
                  style={{ background: "#84cc16", color: "#000" }}
                >
                  Add to Starting 5
                </button>
                <button
                  onClick={onAddBench}
                  className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs border border-white/20 text-white/60 rounded hover:border-white/40 hover:text-white transition-colors"
                >
                  Add to Bench
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-2 font-mono text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter button ───────────────────────────────────────────────────────────────
function FilterBtn({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-all"
      style={{
        border: `1.5px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
        color: active ? color : "rgba(255,255,255,0.35)",
        background: active ? `${color}11` : "transparent",
        boxShadow: active ? `0 0 12px ${color}44` : "none",
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────────
type TierFilter = "all" | "purple" | "blue" | "gold";

export default function MyTeamPage() {
  const { isSignedIn } = useUser();
  const [team, setTeam] = useState<SavedTeam>(EMPTY_TEAM);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selected, setSelected] = useState<MTCard | null>(null);
  const [filter, setFilter] = useState<TierFilter>("all");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load team from API or localStorage on mount
  useEffect(() => {
    async function load() {
      if (isSignedIn) {
        try {
          const res = await fetch("/api/my-team");
          const data = await res.json();
          setTeam(data.myTeam ?? EMPTY_TEAM);
        } catch {
          loadFromLocal();
        }
      } else {
        loadFromLocal();
      }
    }
    function loadFromLocal() {
      try {
        const raw = localStorage.getItem("my_team_v1");
        if (raw) setTeam(JSON.parse(raw));
      } catch {}
    }
    load();
  }, [isSignedIn]);

  // Save with debounce
  const saveTeam = useCallback((t: SavedTeam) => {
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    localStorage.setItem("my_team_v1", JSON.stringify(t));
    if (isSignedIn) {
      saveTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/my-team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ myTeam: t }),
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 800);
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }
  }, [isSignedIn]);

  function addCard(cardId: string, slot: "starter" | "bench") {
    setTeam(prev => {
      const next = { ...prev };
      if (slot === "starter" && prev.starters.length < 5 && !prev.starters.includes(cardId) && !prev.bench.includes(cardId)) {
        next.starters = [...prev.starters, cardId];
      } else if (slot === "bench" && prev.bench.length < 5 && !prev.starters.includes(cardId) && !prev.bench.includes(cardId)) {
        next.bench = [...prev.bench, cardId];
      }
      saveTeam(next);
      return next;
    });
    setSelected(null);
  }

  function removeCard(cardId: string) {
    setTeam(prev => {
      const next = {
        starters: prev.starters.filter(id => id !== cardId),
        bench: prev.bench.filter(id => id !== cardId),
      };
      saveTeam(next);
      return next;
    });
    setSelected(null);
  }

  const filtered = filter === "all"
    ? MY_TEAM_CARDS
    : MY_TEAM_CARDS.filter(c => tierFromLevel(c.starLevel) === filter);

  const starterCards = team.starters.map(id => cardById(id)).filter(Boolean) as MTCard[];
  const benchCards   = team.bench.map(id => cardById(id)).filter(Boolean) as MTCard[];

  return (
    <div className="min-h-screen" style={{ background: "#060c18" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(6,12,24,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <a href="/games" className="font-mono text-white/30 text-xs hover:text-white/60 transition-colors">← Games</a>
          <div className="w-px h-4 bg-white/10" />
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#84cc16]">My Team</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest animate-pulse">Saving…</span>}
          {saveStatus === "saved" && <span className="font-mono text-[9px] text-[#84cc16] uppercase tracking-widest">Saved ✓</span>}
          {saveStatus === "error" && <span className="font-mono text-[9px] text-red-400 uppercase tracking-widest">Save failed</span>}
          {!isSignedIn && (
            <a href="/sign-in" className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] border border-[#f59e0b44] px-2 py-1 hover:bg-[#f59e0b11] transition-colors">
              Sign in to sync →
            </a>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 pb-24">

        {/* ── Team Builder ── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#84cc16] mb-1">Your Roster</p>
              <h2 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", lineHeight: 1 }}>
                Build Your Squad.
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
                {team.starters.length}/5 starters · {team.bench.length}/5 bench
              </p>
            </div>
          </div>

          {/* Starters */}
          <div className="mb-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#84cc16] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] inline-block" />
              Starting 5
            </p>
            <div className="flex gap-3 flex-wrap">
              {starterCards.map((c, i) => (
                <Card2K
                  key={c.id}
                  card={c}
                  size="sm"
                  inTeam="starter"
                  slot={`S${i + 1}`}
                  onClick={() => setSelected(c)}
                />
              ))}
              {Array.from({ length: 5 - starterCards.length }, (_, i) => (
                <EmptySlot key={i} label={`Starter ${starterCards.length + i + 1}`} isStarter />
              ))}
            </div>
          </div>

          {/* Bench */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
              Bench
            </p>
            <div className="flex gap-3 flex-wrap">
              {benchCards.map((c, i) => (
                <Card2K
                  key={c.id}
                  card={c}
                  size="sm"
                  inTeam="bench"
                  slot={`B${i + 1}`}
                  onClick={() => setSelected(c)}
                />
              ))}
              {Array.from({ length: 5 - benchCards.length }, (_, i) => (
                <EmptySlot key={i} label={`Bench ${benchCards.length + i + 1}`} isStarter={false} />
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* ── Card Gallery ── */}
        <section>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30 mb-1">Collection</p>
              <h2 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", lineHeight: 1 }}>
                All Cards
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <FilterBtn label="All" active={filter === "all"} color="#ffffff" onClick={() => setFilter("all")} />
              <FilterBtn label="Purple" active={filter === "purple"} color="#c084fc" onClick={() => setFilter("purple")} />
              <FilterBtn label="Blue"   active={filter === "blue"}   color="#60a5fa" onClick={() => setFilter("blue")} />
              <FilterBtn label="Gold"   active={filter === "gold"}   color="#f59e0b" onClick={() => setFilter("gold")} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {filtered.map(card => {
              const inStarters = team.starters.includes(card.id);
              const inBench    = team.bench.includes(card.id);
              return (
                <Card2K
                  key={card.id}
                  card={card}
                  size="md"
                  inTeam={inStarters ? "starter" : inBench ? "bench" : null}
                  onClick={() => setSelected(card)}
                  glow={inStarters || inBench}
                />
              );
            })}
          </div>
        </section>

        {/* Legend */}
        <section className="flex items-center gap-6 flex-wrap">
          <p className="font-mono text-[8px] uppercase tracking-widest text-white/20">Card Tiers</p>
          {(["gold", "blue", "purple"] as const).map(tier => (
            <div key={tier} className="flex items-center gap-1.5">
              <Stars level={tier === "gold" ? 5 : tier === "blue" ? 10 : 15} size={9} />
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: TIER_GLOW[tier] }}>
                {tier}
              </span>
            </div>
          ))}
        </section>
      </main>

      {/* Card modal */}
      <AnimatePresence>
        {selected && (
          <CardModal
            card={selected}
            inStarters={team.starters.includes(selected.id)}
            inBench={team.bench.includes(selected.id)}
            onAddStarter={() => addCard(selected.id, "starter")}
            onAddBench={() => addCard(selected.id, "bench")}
            onRemove={() => removeCard(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
