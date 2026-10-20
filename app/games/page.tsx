"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import Arena3D from "@/app/components/Arena3D";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

const FEATURED = {
  href: "/full-court",
  title: "Full Court",
  desc: "7 NBA prompts. Beat the crowd — rarer answers travel farther down the court. Inbound at the baseline and go coast to coast.",
  tag: "Daily",
  tagColor: "#84cc16",
};

const GAMES = [
  {
    href: "/my-team",
    title: "My Team",
    desc: "Collect 2K-style era cards and build your dream 10-man roster.",
    tag: "New",
    tagColor: "#c084fc",
  },
  {
    href: "/higher-lower",
    title: "Higher or Lower",
    desc: "Guess which player's career stat is higher. Build your streak.",
    tag: "Streak",
    tagColor: "#84cc16",
  },
  {
    href: "/lineup-thief",
    title: "Lineup Thief",
    desc: "One player from a famous lineup is blacked out. Name them using clues.",
    tag: "New",
    tagColor: "#f97316",
  },
  {
    href: "/connections",
    title: "NBA Connections",
    desc: "16 players, 4 hidden groups. Daily puzzle.",
    tag: "Daily",
    tagColor: "#84cc16",
  },
  {
    href: "/auction-draft",
    title: "Auction Draft",
    desc: "Bid on all-time legends against an AI. Build your dream team.",
    tag: "Strategy",
    tagColor: "#60a5fa",
  },
  {
    href: "/badge-court",
    title: "Badge Court",
    desc: "Card battle with NBA legends. Pick plays, activate badges.",
    tag: "New",
    tagColor: "#f97316",
  },
  {
    href: "/franchise",
    title: "Franchise Mode",
    desc: "Build a roster, simulate seasons, run the playoffs year after year.",
    tag: "Sim",
    tagColor: "#84cc16",
  },
];

const TIMED = [
  { href: "/challenges/name-teams",   title: "Name All 30 Teams",    tag: "5 min",  desc: "Type every NBA franchise before time runs out." },
  { href: "/challenges/name-players", title: "Name the Starters",    tag: "10 min", desc: "Name the 5 starters + 1 bench for all 30 teams." },
  { href: "/challenges/draft-class",  title: "Draft Class Challenge", tag: "8 min",  desc: "Name 3 players from every draft class 2010–2025." },
  { href: "/challenges/champions",    title: "Champions by Year",     tag: "6 min",  desc: "Type a team, all their title years fill in at once." },
];

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] px-2 py-0.5 border"
      style={{ borderColor: color, color, background: `${color}18` }}
    >
      {label}
    </span>
  );
}

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2" style={{ background: "#84cc16" }} />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-[#84cc16]">{label}</span>
      </div>
      <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {title}
      </h2>
    </div>
  );
}

export default function GamesPage() {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    function refresh() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refresh();
    window.addEventListener("daily-update", refresh);
    return () => window.removeEventListener("daily-update", refresh);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#030508", color: "white", fontFamily: "var(--font-geist-mono)" }}>

      {/* 3D arena background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Arena3D />
        {/* Extra fade so cards are readable */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,5,8,0.55)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 flex items-center justify-between" style={{ minHeight: 56, background: "rgba(3,5,8,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <a href="/home" className="text-white/40 hover:text-[#84cc16] transition-colors font-bold mr-1 text-sm">←</a>
          <img src="/logo-green.png" alt="" className="h-8 w-auto" />
          <span className="font-playfair font-black text-white hidden sm:block" style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#84cc16]/60 hidden sm:block">Season 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 py-10 space-y-14 pb-24">

        {/* ── FEATURED: Full Court ── */}
        <section>
          <SectionLabel label="Today's Game" title="Full Court" />
          <Link href={FEATURED.href} className="group block">
            <motion.div
              className="relative overflow-hidden p-8 md:p-12"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(132,204,22,0.25)", minHeight: 200 }}
              whileHover={{ background: "rgba(132,204,22,0.06)" }}
              transition={{ duration: 0.2 }}
            >
              {/* Court SVG background hint */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <svg viewBox="0 0 900 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                  <rect x="0" y="0" width="900" height="200" fill="#C17F2A" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={i} x1="0" y1={30 * i} x2="900" y2={30 * i} stroke="#7A520F" strokeWidth="1" />
                  ))}
                  <rect x="20" y="15" width="860" height="170" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="450" y1="15" x2="450" y2="185" stroke="white" strokeWidth="1.5" />
                  <circle cx="450" cy="100" r="45" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="20" y="55" width="140" height="90" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="740" y="55" width="140" height="90" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <Tag label={FEATURED.tag} color={FEATURED.tagColor} />
                  <h2 className="font-playfair font-black italic text-white mt-3" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
                    {FEATURED.title}
                  </h2>
                  <p className="text-white/45 text-sm mt-3 leading-relaxed max-w-lg">{FEATURED.desc}</p>
                </div>
                <motion.span
                  className="inline-block px-8 py-3 font-mono font-bold text-xs uppercase tracking-[0.2em] shrink-0"
                  style={{ background: "#84cc16", color: "#030508" }}
                  whileHover={{ scale: 1.04 }}
                >
                  Inbound →
                </motion.span>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* ── GAME MODES ── */}
        <section>
          <SectionLabel label="Game Modes" title="Choose Your Game" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.07)" }}>
            {GAMES.map(g => (
              <Link key={g.href} href={g.href} className="group block">
                <motion.div
                  className="h-full flex flex-col justify-between p-5 transition-colors duration-200"
                  style={{ background: "#030508", minHeight: 160 }}
                  whileHover={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Tag label={g.tag} color={g.tagColor} />
                  <div className="mt-auto pt-6">
                    <h3 className="font-playfair font-black italic text-white leading-tight mb-1.5" style={{ fontSize: "1.15rem" }}>
                      {g.title}
                    </h3>
                    <p className="font-mono text-white/35 leading-snug" style={{ fontSize: "10px" }}>{g.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── TIMED CHALLENGES ── */}
        <section>
          <SectionLabel label="Timed Challenges" title="Race the Clock" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.07)" }}>
            {TIMED.map(g => (
              <Link key={g.href} href={g.href} className="group block">
                <motion.div
                  className="h-full p-5 flex flex-col justify-between"
                  style={{ background: "#030508", minHeight: 140 }}
                  whileHover={{ background: "rgba(255,255,255,0.04)" }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] px-2 py-0.5 border border-[#84cc16]/40 text-[#84cc16] self-start">
                    {g.tag}
                  </span>
                  <div className="mt-auto pt-5">
                    <p className="font-playfair font-black italic text-white leading-tight mb-1" style={{ fontSize: "1.05rem" }}>{g.title}</p>
                    <p className="font-mono text-white/35 leading-snug" style={{ fontSize: "9px" }}>{g.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-center text-white/20 text-[9px] font-mono uppercase tracking-widest">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
