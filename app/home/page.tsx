"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import { AnimatedGrid, AnimatedItem } from "@/app/components/AnimatedGrid";
import BballMascot from "@/app/components/BballMascot";
import { LINEUPS } from "@/lib/lineupData";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { CURRENT_NBA_PLAYERS } from "@/lib/currentNBAPlayers";
import { STAT_LINE_PLAYERS } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";

const topScorers = [...CURRENT_NBA_PLAYERS].sort((a, b) => b.ppg - a.ppg).slice(0, 5);
const maxPpg = topScorers[0]?.ppg ?? 35;

const linePoints = [22, 19, 26, 21, 30, 25, 34, 28, 38, 32, 42, 36];
const lMin = Math.min(...linePoints);
const lMax = Math.max(...linePoints);
const norm = (v: number) => ((v - lMin) / (lMax - lMin)) * 44;
const svgPath = linePoints
  .map((v, i) => `${(i / (linePoints.length - 1)) * 180},${48 - norm(v)}`)
  .join(" ");
const areaPath =
  `M0,48 ` +
  linePoints.map((v, i) => `${(i / (linePoints.length - 1)) * 180},${48 - norm(v)}`).join(" ") +
  ` L180,48 Z`;

const GAMES = [
  {
    href: "/challenges/name-teams", emoji: "🏟️", tag: "5 min", title: "Name All NBA Teams",
    description: "Can you name all 30 NBA franchises before time runs out?",
    meta: "30 teams · 5:00 timer",
  },
  {
    href: "/challenges/name-players", emoji: "👕", tag: "15 min", title: "Name 10 Players Per Team",
    description: "For each team, name 10 players — stars or all-time legends.",
    meta: "30 teams · 15:00 timer",
  },
  {
    href: "/lineup-guesser", emoji: "🏀", tag: "New", title: "Lineup Guesser",
    description: "5 starters, their stats. Which NBA team and season is it?",
    meta: `${LINEUPS.length} lineups · All eras`,
  },
  {
    href: "/start-bench-cut?era=alltime", emoji: "⭐", tag: "Opinion", title: "Start, Bench, Cut · Legends",
    description: "Jordan vs Kobe vs LeBron — who starts, who rides pine, who gets cut?",
    meta: `${TRIOS.length} rounds · All eras`,
  },
  {
    href: "/guess-who?era=alltime", emoji: "🔍", tag: "Puzzle", title: "Guess Who · Legends",
    description: "Decode a mystery legend from stat clues. Green = match, yellow = close.",
    meta: "302 players · 10 guesses",
  },
  {
    href: "/stat-line-guesser?era=alltime", emoji: "📊", tag: "Stats", title: "Stat Line · Legends",
    description: "A career stat line revealed one clue at a time. Name the player.",
    meta: `${STAT_LINE_PLAYERS.length} players · 5 reveals`,
  },
  {
    href: "/start-bench-cut?era=current", emoji: "⚡", tag: "Current", title: "Start, Bench, Cut · Now",
    description: "Jokic, Wemby, SGA — who runs your squad?",
    meta: `${CURRENT_TRIOS.length} rounds · 2025–26`,
  },
  {
    href: "/guess-who?era=current", emoji: "🔍", tag: "Current", title: "Guess Who · Current",
    description: "Identify today's stars from stats — PPG, team, division, and more.",
    meta: `${CURRENT_NBA_PLAYERS.length} players · 10 guesses`,
  },
  {
    href: "/stat-line-guesser?era=current", emoji: "📊", tag: "Current", title: "Stat Line · Current",
    description: "Current player stats, revealed one at a time. How fast can you name them?",
    meta: `${CURRENT_STAT_LINE_PLAYERS.length} players · 2025–26`,
  },
];

function TopScorersCard() {
  return (
    <div className="w-52 bg-white/5 backdrop-blur-xl border border-teal-500/25 rounded-2xl p-4 shadow-2xl">
      <p className="text-[10px] font-mono uppercase tracking-widest text-teal-400 mb-3">🏀 Top Scorers</p>
      <div className="flex flex-col gap-2.5">
        {topScorers.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="text-white/30 text-[9px] font-mono w-3">{i + 1}</span>
            <span className="text-white/80 text-[11px] font-semibold truncate" style={{ maxWidth: 72 }}>
              {p.name.split(" ").slice(-1)[0]}
            </span>
            <div className="flex-1 bg-white/10 rounded-full overflow-hidden h-1">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `hsl(${170 - i * 20}, 80%, 55%)` }}
                initial={{ width: 0 }}
                animate={{ width: `${(p.ppg / maxPpg) * 100}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <span className="text-teal-300 text-[10px] font-black tabular-nums">{p.ppg}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[9px] text-white/25 font-mono uppercase tracking-widest">PPG · 2025–26</p>
    </div>
  );
}

function WinRateCard() {
  return (
    <div className="w-52 bg-white/5 backdrop-blur-xl border border-teal-500/25 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-teal-400">Win Rate</p>
        <span className="text-green-400 text-[10px] font-black">+4.8%</span>
      </div>
      <p className="text-white text-2xl font-black mb-3">68.2%</p>
      <svg viewBox="0 0 180 52" className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon
          points={areaPath.replace("M0,48 ", "").replace(" Z", "").split(" ").join(",")}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
        <motion.polyline
          points={svgPath}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
        />
        {/* Last point dot */}
        <circle
          cx={(((linePoints.length - 1) / (linePoints.length - 1)) * 180)}
          cy={48 - norm(linePoints[linePoints.length - 1])}
          r="3.5"
          fill="#14b8a6"
        />
        <circle
          cx={(((linePoints.length - 1) / (linePoints.length - 1)) * 180)}
          cy={48 - norm(linePoints[linePoints.length - 1])}
          r="6"
          fill="#14b8a6"
          opacity="0.25"
        />
      </svg>
      <p className="mt-2 text-[9px] text-white/25 font-mono uppercase tracking-widest">Top teams avg · 2025–26</p>
    </div>
  );
}

function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <p className="text-2xl font-black text-teal-400">{value}</p>
      <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mt-0.5">{label}</p>
    </motion.div>
  );
}

function GameCard({ href, emoji, title, description, meta, tag }: typeof GAMES[0]) {
  const isNew = tag === "New";
  const isCurrent = tag === "Current";
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}>
      <Link href={href} className="group relative bg-white/5 border border-teal-500/15 backdrop-blur-sm rounded-2xl p-6 flex flex-col hover:border-teal-400/40 hover:bg-white/8 transition-all duration-200 min-h-[190px] block">
        <div className="flex items-start justify-between mb-4">
          <span className="text-2xl">{emoji}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            isNew ? "text-orange-300 bg-orange-500/10 border-orange-400/30 animate-pulse"
            : isCurrent ? "text-sky-300 bg-sky-500/10 border-sky-400/30"
            : "text-teal-300 bg-teal-500/10 border-teal-400/20"
          }`}>
            {tag}
          </span>
        </div>
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed flex-1 mb-4">{description}</p>
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <p className="text-[10px] text-white/25 font-mono">{meta}</p>
          <span className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">Play →</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "linear-gradient(160deg, #050e1a 0%, #071520 40%, #091c22 70%, #071018 100%)" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative z-50 bg-black/30 backdrop-blur-md border-b border-teal-500/10 px-6 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Courtside Central" className="h-10 w-auto" />
          <span className="font-bold text-white text-base tracking-tight">Courtside Central</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-teal-400/70 hidden sm:block font-mono tracking-widest">SEASON 2025–26</span>
          <AuthButton />
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden px-4">

        {/* ── Atmospheric background ─────────────────────────────── */}
        <style>{`
          @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(40px,-30px) scale(1.08)} 70%{transform:translate(-20px,20px) scale(0.95)} }
          @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-50px,25px) scale(1.06)} 65%{transform:translate(30px,-20px) scale(0.97)} }
          @keyframes floatC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-18px) scale(1.12)} }
        `}</style>

        {/* Orange warm blob — bottom-left */}
        <div className="absolute pointer-events-none" style={{
          width: 680, height: 540,
          bottom: "-120px", left: "-140px",
          background: "radial-gradient(ellipse, rgba(251,146,60,0.22) 0%, rgba(234,88,12,0.10) 45%, transparent 70%)",
          filter: "blur(52px)",
          animation: "floatA 9s ease-in-out infinite",
          borderRadius: "50%",
        }} />

        {/* Teal blob — top-right */}
        <div className="absolute pointer-events-none" style={{
          width: 620, height: 500,
          top: "-100px", right: "-120px",
          background: "radial-gradient(ellipse, rgba(20,184,166,0.20) 0%, rgba(13,148,136,0.09) 50%, transparent 70%)",
          filter: "blur(55px)",
          animation: "floatB 11s ease-in-out infinite",
          borderRadius: "50%",
        }} />

        {/* Cyan accent — top-center */}
        <div className="absolute pointer-events-none" style={{
          width: 320, height: 260,
          top: "5%", left: "38%",
          background: "radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 65%)",
          filter: "blur(40px)",
          animation: "floatC 7s ease-in-out infinite",
          borderRadius: "50%",
        }} />

        {/* Deep teal horizon glow — bottom center */}
        <div className="absolute pointer-events-none" style={{
          width: "100%", height: 280,
          bottom: 0, left: 0,
          background: "linear-gradient(to top, rgba(13,148,136,0.15) 0%, transparent 100%)",
          filter: "blur(2px)",
        }} />

        {/* Edge vignette — keeps edges dark */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(5,14,26,0.75) 100%)",
        }} />

        {/* Dot grid on top of blobs */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Subtle arc rings */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-t-full border border-teal-400/10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] h-[225px] rounded-t-full border border-teal-400/7 pointer-events-none" />

        {/* Title */}
        <motion.div className="text-center z-10 mb-10"
          initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-teal-400/80 mb-5">
            NBA Knowledge Games
          </p>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-none uppercase">
            <span className="text-teal-400">Test</span>{" "}
            <span className="text-white">Your</span>
          </h1>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-none uppercase text-white">
            NBA IQ
          </h1>
        </motion.div>

        {/* 3-column: card | mascot | card */}
        <div className="relative z-10 flex items-center justify-center gap-8 sm:gap-16 w-full max-w-5xl">

          {/* Left card */}
          <motion.div className="hidden sm:block"
            initial={{ opacity: 0, x: -50, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}>
            <TopScorersCard />
          </motion.div>

          {/* Mascot */}
          <motion.div className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.65, type: "spring", stiffness: 180, damping: 18 }}>
            {/* Hot / Cold labels */}
            <div className="flex items-center gap-28 text-[9px] font-mono text-white/35 uppercase tracking-[0.25em]">
              <span>Hot 🔥</span>
              <span>Cold ❄️</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-2 h-2 rounded-full bg-orange-400" style={{ boxShadow: "0 0 10px #fb923c" }} />
              <BballMascot size={180} glow idle />
              <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: "0 0 10px #60a5fa" }} />
            </div>
          </motion.div>

          {/* Right card */}
          <motion.div className="hidden sm:block"
            initial={{ opacity: 0, x: 50, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}>
            <WinRateCard />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div className="z-10 mt-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}>
          <motion.a
            href="/challenges"
            className="inline-block px-14 py-4 bg-teal-500 text-black font-black text-sm uppercase tracking-[0.22em] rounded-full"
            style={{ boxShadow: "0 0 28px rgba(20,184,166,0.45), 0 2px 12px rgba(0,0,0,0.3)" }}
            whileHover={{ scale: 1.06, boxShadow: "0 0 50px rgba(20,184,166,0.65), 0 4px 20px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.96 }}
          >
            Start Playing
          </motion.a>
        </motion.div>

        {/* Stats row */}
        <motion.div className="z-10 mt-12 flex items-center gap-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}>
          <StatCounter value={`${TRIOS.length + CURRENT_TRIOS.length}+`} label="Start Bench Cut Rounds" />
          <div className="h-8 w-px bg-teal-500/15" />
          <StatCounter value={`${LINEUPS.length}+`} label="Lineup Puzzles" />
          <div className="h-8 w-px bg-teal-500/15" />
          <StatCounter value={`${STAT_LINE_PLAYERS.length + CURRENT_STAT_LINE_PLAYERS.length}+`} label="Players" />
        </motion.div>
      </section>

      {/* ── Section divider ────────────────────────────────────── */}
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/25 to-transparent" />
        <div className="relative bg-[#07101e] px-6 z-10">
          <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-teal-500/50">All Games</span>
        </div>
      </div>

      {/* ── Games section ──────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-10 pb-24">

        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <AnimatedItem key={g.href}>
              <GameCard {...g} />
            </AnimatedItem>
          ))}
        </AnimatedGrid>

        <p className="text-center text-white/15 text-[10px] font-mono mt-14 tracking-widest uppercase">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
