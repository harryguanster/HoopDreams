"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import DailyGuessWhoGame from "@/app/components/DailyGuessWhoGame";
import DailyStatLineGame from "@/app/components/DailyStatLineGame";
import { CURRENT_GUESS_WHO_PLAYERS } from "@/lib/currentGuessWhoData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";
import {
  getTodayStr, getDailyIndex, loadDailyData, saveDailyData, updateStreak, loadStreak,
  type DailyData,
} from "@/lib/dailyUtils";

// ─── Game mode data ────────────────────────────────────────────────────────────
const FEATURED = {
  href: "/franchise",
  title: "Franchise Mode",
  desc: "Build your roster, simulate full 82-game seasons, run the playoffs, and manage your franchise through the draft and free agency year after year.",
  tag: "Simulation",
  bg: "linear-gradient(135deg, #0a1628 0%, #111827 60%, #1a2f1a 100%)",
  textColor: "#ffffff",
  accentColor: "#84cc16",
};

const GAMES = [
  {
    href: "/start-bench-cut",
    title: "Start, Bench, Cut",
    desc: "Jordan, Kobe, LeBron — who starts, who rides pine, who gets cut?",
    tag: "Opinion",
    bg: "#84cc16",
    textColor: "#111827",
    hoverBg: "#65a30d",
    tagBorderColor: "#111827",
    tagTextColor: "#111827",
  },
  {
    href: "/guess-who",
    title: "Guess Who",
    desc: "Decode a mystery player from Wordle-style stat clues.",
    tag: "Puzzle",
    bg: "#111827",
    textColor: "#ffffff",
    hoverBg: "#1f2937",
    tagBorderColor: "#84cc16",
    tagTextColor: "#84cc16",
  },
  {
    href: "/higher-lower",
    title: "Higher or Lower",
    desc: "Guess which player's career stat is higher. Build your streak.",
    tag: "Streak",
    bg: "#f4f0e6",
    textColor: "#111827",
    hoverBg: "#e8e2d4",
    tagBorderColor: "#111827",
    tagTextColor: "#111827",
  },
  {
    href: "/stat-line-guesser",
    title: "Stat Line Guesser",
    desc: "Five clues, one player. Name them before all clues drop.",
    tag: "Stats",
    bg: "#84cc16",
    textColor: "#111827",
    hoverBg: "#65a30d",
    tagBorderColor: "#111827",
    tagTextColor: "#111827",
  },
  {
    href: "/lineup-guesser",
    title: "Lineup Guesser",
    desc: "Five starters, their stats. Name the team and season.",
    tag: "Trivia",
    bg: "#111827",
    textColor: "#ffffff",
    hoverBg: "#1f2937",
    tagBorderColor: "#84cc16",
    tagTextColor: "#84cc16",
  },
  {
    href: "/connections",
    title: "NBA Connections",
    desc: "16 players, 4 hidden groups. Daily puzzle.",
    tag: "Daily",
    bg: "#f4f0e6",
    textColor: "#111827",
    hoverBg: "#e8e2d4",
    tagBorderColor: "#111827",
    tagTextColor: "#111827",
  },
  {
    href: "/auction-draft",
    title: "Auction Draft",
    desc: "Bid on all-time legends against an AI. Build your dream team, then play a game to 7.",
    tag: "New",
    bg: "#84cc16",
    textColor: "#111827",
    hoverBg: "#65a30d",
    tagBorderColor: "#111827",
    tagTextColor: "#111827",
  },
];

const TIMED = [
  { href: "/challenges/name-teams",   title: "Name All 30 Teams",    tag: "5 min",  desc: "Type every NBA franchise before time runs out.", bg: "#111827", textColor: "#fff" },
  { href: "/challenges/name-players", title: "Name the Starters",    tag: "10 min", desc: "Name the 5 starters + 1 bench for all 30 teams.", bg: "#84cc16", textColor: "#111827" },
  { href: "/challenges/draft-class",  title: "Draft Class Challenge", tag: "8 min",  desc: "Name 3 players from every draft class 2010–2025.", bg: "#111827", textColor: "#fff" },
  { href: "/challenges/champions",    title: "Champions by Year",     tag: "6 min",  desc: "Type a team, all their title years fill in at once.", bg: "#84cc16", textColor: "#111827" },
];


// ─── Components ────────────────────────────────────────────────────────────────

function Tag({ label, green }: { label: string; green?: boolean }) {
  return (
    <span
      className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] px-2 py-0.5 border"
      style={green
        ? { borderColor: "#84cc16", color: "#84cc16", background: "rgba(132,204,22,0.1)" }
        : { borderColor: "currentColor", color: "inherit", opacity: 0.5 }}
    >
      {label}
    </span>
  );
}

function FeaturedCard({ game }: { game: typeof FEATURED }) {
  return (
    <Link href={game.href} className="group block h-full">
      <motion.div
        whileHover={{ opacity: 0.93 }}
        transition={{ duration: 0.2 }}
        className="h-full flex flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: game.bg, color: game.textColor, minHeight: 320, border: "2px solid #111827" }}
      >
        {/* Decorative green glow blob */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(132,204,22,0.18) 0%, transparent 70%)" }} />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] px-2.5 py-1 border self-start" style={{ borderColor: game.accentColor, color: game.accentColor }}>
          {game.tag}
        </span>
        <div className="relative z-10">
          <h2
            className="font-playfair font-black mb-3"
            style={{ fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)", lineHeight: 1.02, letterSpacing: "-0.02em", color: game.textColor }}
          >
            {game.title}
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>{game.desc}</p>
          <span
            className="inline-block font-mono font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 transition-all group-hover:bg-[#84cc16] group-hover:text-[#111827] group-hover:border-[#84cc16]"
            style={{ borderWidth: 2, borderStyle: "solid", borderColor: "#84cc16", color: "#84cc16" }}
          >
            Play Now →
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function SmallCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <Link href={game.href} className="group block h-full">
      <motion.div
        className="h-full flex flex-col justify-between p-5 transition-colors duration-200"
        style={{ background: game.bg, color: game.textColor, minHeight: 180 }}
        whileHover={{ background: game.hoverBg } as never}
        transition={{ duration: 0.15 }}
      >
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-0.5 border self-start" style={{ borderColor: game.tagBorderColor, color: game.tagTextColor }}>
          {game.tag}
        </span>
        <div>
          <h3
            className="font-playfair font-black mb-2 leading-tight"
            style={{ fontSize: "1.35rem", letterSpacing: "-0.01em" }}
          >
            {game.title}
          </h3>
          <p className="font-mono leading-snug" style={{ fontSize: "10px", opacity: 0.55 }}>{game.desc}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function RuleHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2.5 h-2.5" style={{ background: "#84cc16" }} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#84cc16]">{label}</span>
      </div>
      <div style={{ borderTop: "2px solid #111827", marginBottom: "14px" }} />
      <h2 className="font-playfair font-black text-[#111827]" style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {title}
      </h2>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function GamesPage() {
  const [dailyData, setDailyData] = useState<DailyData>({ date: getTodayStr(), guessWhoWon: null, statLineWon: null });
  const [streakCount, setStreakCount] = useState(0);
  const [dailyGWPlayer, setDailyGWPlayer] = useState<typeof CURRENT_GUESS_WHO_PLAYERS[0] | null>(null);
  const [dailySLPlayer, setDailySLPlayer] = useState<typeof CURRENT_STAT_LINE_PLAYERS[0] | null>(null);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setDailyGWPlayer(CURRENT_GUESS_WHO_PLAYERS[getDailyIndex(CURRENT_GUESS_WHO_PLAYERS.length, 0)]);
    setDailySLPlayer(CURRENT_STAT_LINE_PLAYERS[getDailyIndex(CURRENT_STAT_LINE_PLAYERS.length, 7)]);
    const data = loadDailyData();
    setDailyData(data);
    if (data.guessWhoWon === true && data.statLineWon === true) updateStreak();
    function refresh() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refresh();
    window.addEventListener("daily-update", refresh);
    return () => window.removeEventListener("daily-update", refresh);
  }, []);

  function handleGWComplete(won: boolean) {
    const next = { ...dailyData, guessWhoWon: won };
    setDailyData(next); saveDailyData(next);
    if (won && next.statLineWon === true) updateStreak();
  }
  function handleSLComplete(won: boolean) {
    const next = { ...dailyData, statLineWon: won };
    setDailyData(next); saveDailyData(next);
    if (won && next.guessWhoWon === true) updateStreak();
  }

  const bothWon = dailyData.guessWhoWon === true && dailyData.statLineWon === true;

  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 flex items-center justify-between" style={{ minHeight: 56, background: "#f4f0e6", borderBottom: "2px solid #111827" }}>
        <div className="flex items-center gap-3">
          <a href="/home" className="text-gray-400 hover:text-[#84cc16] transition-colors font-bold mr-1">←</a>
          <img src="/logo-cream.png" alt="" className="h-8 w-auto" />
          <span className="font-playfair font-black text-[#111827]" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#65a30d] hidden sm:block">Season 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-24">

        {/* ── BENTO HERO: intro + featured game ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0" style={{ border: "2px solid #111827" }}>

          {/* Left: intro panel */}
          <div className="lg:col-span-2 flex flex-col justify-between p-10 relative overflow-hidden" style={{ background: "#84cc16", borderRight: "2px solid #111827" }}>
            {/* Decorative large number watermark */}
            <div className="absolute -bottom-8 -left-4 font-playfair font-black text-[#65a30d] pointer-events-none select-none" style={{ fontSize: "clamp(120px, 18vw, 200px)", lineHeight: 1, opacity: 0.25 }}>IQ</div>
            <div className="relative z-10">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#111827] mb-4 opacity-60">Pick Your Game</p>
              <h1 className="font-playfair font-black text-[#111827] italic mb-6" style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                Test your<br />NBA brain.
              </h1>
              <p className="font-mono text-[#111827]/60 text-sm leading-relaxed">
                Seven game modes. Daily challenges. Infinite streak. All free.
              </p>
            </div>
            <div className="relative z-10 mt-8 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.15)" }}>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#111827]/50 mb-2">Today&apos;s streak</p>
              <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "3.5rem", lineHeight: 1 }}>{streakCount}</p>
            </div>
          </div>

          {/* Right: featured Start Bench Cut */}
          <div className="lg:col-span-3">
            <FeaturedCard game={FEATURED} />
          </div>
        </div>

        {/* ── GAME MODES GRID ── */}
        <section>
          <RuleHeader label="Game Modes" title="Choose Your Challenge" />
          {/* Row 1: first 4 games */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0" style={{ border: "2px solid #111827", borderBottom: "none" }}>
            {GAMES.slice(0, 4).map((g, i) => (
              <div key={g.href} style={{ borderRight: i < 3 ? "2px solid #111827" : undefined }}>
                <SmallCard game={g} />
              </div>
            ))}
          </div>
          {/* Row 2: remaining games */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-0" style={{ border: "2px solid #111827" }}>
            {GAMES.slice(4).map((g, i) => (
              <div key={g.href} style={{ borderRight: i < GAMES.slice(4).length - 1 ? "2px solid #111827" : undefined }}>
                <SmallCard game={g} />
              </div>
            ))}
          </div>
        </section>

        {/* ── DAILY CHALLENGES ── */}
        <section>
          <RuleHeader label="Daily" title="Today's Challenges" />
          <p className="font-mono text-gray-500 text-xs -mt-2 mb-6 uppercase tracking-widest">New players every day · Complete both to extend your streak</p>

          {bothWon && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 border-2 border-[#84cc16] flex items-center justify-between"
              style={{ background: "rgba(132,204,22,0.06)" }}
            >
              <div>
                <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "1.5rem" }}>Daily Complete</p>
                <p className="font-mono text-[#65a30d] text-xs uppercase tracking-widest mt-1">Streak updated in the header</p>
              </div>
              <div className="text-right">
                <p className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "3rem", lineHeight: 1 }}>{streakCount}</p>
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Day Streak</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-[#111827]">
            {/* Daily Guess Who */}
            <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-[#111827]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#84cc16] mb-1">Daily · Guess Who</p>
                  <h3 className="font-playfair font-black text-[#111827]" style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}>Who Am I?</h3>
                  <p className="font-mono text-gray-400 text-[10px] mt-1">Current player · 5 clues · 5 guesses</p>
                </div>
                {dailyData.guessWhoWon !== null && (
                  <span className={`text-xs font-mono font-bold px-2 py-1 border ${dailyData.guessWhoWon ? "border-[#84cc16] text-[#65a30d]" : "border-red-300 text-red-500"}`}>
                    {dailyData.guessWhoWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailyGWPlayer ? (
                <DailyGuessWhoGame player={dailyGWPlayer} onComplete={handleGWComplete} alreadyCompleted={dailyData.guessWhoWon !== null} won={dailyData.guessWhoWon} />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>

            {/* Daily Stat Line */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#84cc16] mb-1">Daily · Stat Line</p>
                  <h3 className="font-playfair font-black text-[#111827]" style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}>Who Am I?</h3>
                  <p className="font-mono text-gray-400 text-[10px] mt-1">Current player · 5 stats · 5 guesses</p>
                </div>
                {dailyData.statLineWon !== null && (
                  <span className={`text-xs font-mono font-bold px-2 py-1 border ${dailyData.statLineWon ? "border-[#84cc16] text-[#65a30d]" : "border-red-300 text-red-500"}`}>
                    {dailyData.statLineWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailySLPlayer ? (
                <DailyStatLineGame player={dailySLPlayer} onComplete={handleSLComplete} alreadyCompleted={dailyData.statLineWon !== null} won={dailyData.statLineWon} />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TIMED CHALLENGES ── */}
        <section>
          <RuleHeader label="Timed Challenges" title="Race the Clock" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0" style={{ border: "2px solid #111827" }}>
            {TIMED.map((g, i) => (
              <Link key={g.href} href={g.href} className="group block">
                <motion.div
                  className="h-full p-6 flex flex-col justify-between transition-all duration-200"
                  style={{ borderRight: i < 3 ? "2px solid #111827" : undefined, minHeight: 160, background: g.bg, color: g.textColor }}
                  whileHover={{ opacity: 0.85 } as never}
                >
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] px-2 py-0.5 border self-start"
                    style={g.bg === "#84cc16"
                      ? { borderColor: "#111827", color: "#111827" }
                      : { borderColor: "#84cc16", color: "#84cc16" }}
                  >
                    {g.tag}
                  </span>
                  <div>
                    <p className="font-playfair font-black" style={{ fontSize: "1.15rem", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{g.title}</p>
                    <p className="font-mono mt-1" style={{ fontSize: "10px", opacity: 0.55 }}>{g.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-gray-400 text-[10px] text-center font-mono uppercase tracking-widest">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
