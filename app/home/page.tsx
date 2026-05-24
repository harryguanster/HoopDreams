"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyGuessWhoGame from "@/app/components/DailyGuessWhoGame";
import DailyStatLineGame from "@/app/components/DailyStatLineGame";
import DailyBadge from "@/app/components/DailyBadge";
import { LINEUPS } from "@/lib/lineupData";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { CURRENT_NBA_PLAYERS } from "@/lib/currentNBAPlayers";
import { STAT_LINE_PLAYERS } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";
import { CURRENT_GUESS_WHO_PLAYERS } from "@/lib/currentGuessWhoData";
import {
  getTodayStr, getDailyIndex, loadDailyData, saveDailyData, updateStreak, loadStreak,
  type DailyData,
} from "@/lib/dailyUtils";


function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}>
      <p className="font-bebas text-teal-400 tabular-nums" style={{ fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}>{value}</p>
      <p className="text-[9px] text-white/50 font-mono uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Hero photo plates ────────────────────────────────────────────────────────
const HERO_PHOTOS = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",                    label: "The Block · 2016 Finals",  pos: "center 30%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg",   label: "Michael Jordan · 1997",    pos: "center 35%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kobe_Bryant_81.jpg",                                label: "Kobe 81 Pts · 2006",       pos: "center 25%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Dream_Team_at_the_1992_Summer_Olympics.JPEG",       label: "Dream Team · 1992",        pos: "center 20%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Stephen_Curry_shooting.jpg",                        label: "Steph Curry · Warriors",   pos: "center 30%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Victor_Wembanyama_San_Antonio_Spurs_2025_NBA_Cup.jpg", label: "Wemby · Spurs 2025",    pos: "center 20%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg", label: "LeBron vs Steph · 2016", pos: "center 30%" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ray_Allen_Heat.jpg",                                label: "Ray Allen · Heat",         pos: "center 15%" },
];
const PLATE_LAYOUT = [
  { x: -43, y: -24, rx:  14, ry: -28, rz: -13, w: 275, zLayer: 0 },
  { x:  37, y: -27, rx: -11, ry:  24, rz:  11, w: 250, zLayer: 0 },
  { x: -47, y:   9, rx:  20, ry: -18, rz:   8, w: 268, zLayer: 1 },
  { x:  43, y:   7, rx: -16, ry: -24, rz:  -7, w: 248, zLayer: 0 },
  { x: -13, y: -43, rx:   9, ry: -16, rz:  17, w: 205, zLayer: 1 },
  { x:  11, y:  41, rx: -11, ry:  17, rz: -14, w: 225, zLayer: 0 },
  { x:  45, y:  33, rx: -21, ry: -27, rz:  -5, w: 215, zLayer: 1 },
  { x: -40, y:  33, rx:  17, ry:  21, rz:   5, w: 198, zLayer: 0 },
];

function PhotoPlate3D({ src, label, pos, x, y, rx, ry, rz, w, idx, zLayer }: {
  src: string; label: string; pos: string;
  x: number; y: number; rx: number; ry: number; rz: number;
  w: number; idx: number; zLayer: number;
}) {
  return (
    <motion.div
      style={{
        position: "absolute", width: w, aspectRatio: "4/3",
        left: `calc(50% + ${x}vw)`, top: `calc(50% + ${y}vh)`,
        translateX: "-50%", translateY: "-50%",
        rotateX: rx, rotateY: ry, rotateZ: rz, transformPerspective: 950,
        borderRadius: 16, overflow: "hidden",
        zIndex: zLayer === 0 ? 5 : 15,
        boxShadow: "0 50px 130px rgba(0,0,0,0.88), 0 24px 65px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        willChange: "transform", pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1, scale: 1,
        x: [0, (idx % 2 === 0 ? 1 : -1) * (28 + (idx * 13) % 42), (idx % 2 === 0 ? -1 : 1) * (14 + (idx * 7) % 28), 0],
        y: [0, -(20 + (idx * 9) % 35), -(8 + (idx * 5) % 22), 0],
        rotateZ: [rz - 3, rz + 3, rz - 1.5, rz + 3],
        rotateX: [rx - 1.5, rx + 1.5, rx - 1.5],
        rotateY: [ry - 2, ry + 2, ry - 2],
      }}
      transition={{
        opacity: { duration: 1.1, delay: 0.08 + idx * 0.13 },
        scale: { duration: 1.1, delay: 0.08 + idx * 0.13, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 17 + idx * 2.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.8 },
        y: { duration: 13 + idx * 2.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.6 },
        rotateZ: { duration: 11 + idx * 1.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.5 },
        rotateX: { duration: 19 + idx * 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: idx * 0.7 },
        rotateY: { duration: 15 + idx * 2.1, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: idx * 0.9 },
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: pos }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 48%, rgba(0,0,0,0.08) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)" }}>
        <p style={{ color: "rgba(45,212,191,0.9)", fontSize: "7.5px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Game data ────────────────────────────────────────────────────────────────
const GAMES_LIST = [
  { href: "/start-bench-cut",   emoji: "⚖️",  tag: "Opinion", title: "Start, Bench, Cut",    description: "Jordan, Kobe, LeBron or Jokic, Wemby, SGA — who starts, who rides pine, who gets cut? Two eras, over a hundred impossible trios.", meta: `${TRIOS.length + CURRENT_TRIOS.length} rounds · All-time & 2025–26` },
  { href: "/guess-who",         emoji: "🔍",  tag: "Puzzle",  title: "Guess Who",            description: "Decode a mystery player from Wordle-style stat clues — legends or current stars. Green = exact, yellow = close.", meta: `302 all-time + ${CURRENT_NBA_PLAYERS.length} current · 10 guesses` },
  { href: "/stat-line-guesser", emoji: "📊",  tag: "Stats",   title: "Stat Line Guesser",    description: "One clue at a time, a career stat line is revealed. Name the player before all five clues drop.", meta: `${STAT_LINE_PLAYERS.length + CURRENT_STAT_LINE_PLAYERS.length} players · 5 reveals` },
  { href: "/lineup-guesser",    emoji: "🏟️", tag: "New",     title: "Lineup Guesser",       description: "Five starters, their stat lines. Three guesses to name the NBA team and season.", meta: `${LINEUPS.length} puzzles · All eras` },
  { href: "/connections",       emoji: "🔗",  tag: "Daily",   title: "NBA Connections",      description: "16 players, 4 hidden groups. Find what links them before you run out of lives — new puzzle every day.", meta: "4 categories · 4 lives · Daily" },
  { href: "/higher-lower",      emoji: "📈",  tag: "Streak",  title: "Higher or Lower",      description: "Career PPG, APG, All-Star appearances — guess which player's stat is higher. Build your streak.", meta: "5 stat categories · Infinite streak" },
];

const TIMED_LIST = [
  { href: "/challenges/name-teams",   emoji: "🏟️", tag: "5 min",  title: "Name All NBA Teams",      description: "30 franchises, 5 minutes. Type every team name before the clock hits zero — nicknames count.", meta: "30 teams · 5:00 timer" },
  { href: "/challenges/name-players", emoji: "👕",  tag: "10 min", title: "Name the Starters",        description: "For each of the 30 teams, name the 5 current starters plus 1 bench player. Beat the clock.", meta: "30 teams · 6 per team · 10:00 timer" },
  { href: "/challenges/draft-class",  emoji: "🎓",  tag: "8 min",  title: "Draft Class Challenge",    description: "2010 through 2025 — name 3 players from every draft class. One hint is given per year.", meta: "16 classes · 48 players · 8:00 timer" },
  { href: "/challenges/champions",    emoji: "🏆",  tag: "6 min",  title: "Champions by Year",        description: "Type a team name and all their championship years fill in at once. 35 years to conquer.", meta: "1990–2024 · 35 years · 6:00 timer" },
];

// ─── Tag styles ───────────────────────────────────────────────────────────────
function tagStyle(tag: string) {
  if (tag === "New")     return "text-orange-300 bg-orange-500/12 border-orange-400/30";
  if (tag === "Opinion") return "text-purple-300 bg-purple-500/12 border-purple-400/25";
  if (tag === "Puzzle")  return "text-amber-300 bg-amber-500/12 border-amber-400/25";
  if (tag === "Stats")   return "text-emerald-300 bg-emerald-500/12 border-emerald-400/25";
  if (tag === "Daily")   return "text-purple-300 bg-purple-500/12 border-purple-400/25";
  if (tag === "Streak")  return "text-amber-300 bg-amber-500/12 border-amber-400/25";
  if (tag.includes("min")) return "text-red-300 bg-red-500/12 border-red-400/25";
  return "text-teal-300 bg-teal-500/12 border-teal-400/20";
}

// ─── Simple game card ─────────────────────────────────────────────────────────
function GameCard({ href, emoji, tag, title, description, meta }: {
  href: string; emoji: string; tag: string; title: string; description: string; meta: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="h-full bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-white/18 hover:bg-white/8 transition-colors flex flex-col"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-3xl">{emoji}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tagStyle(tag)}`}>
            {tag}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-teal-300 transition-colors leading-tight" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.07em" }}>
          {title}
        </h3>
        <p className="text-white/55 text-sm leading-relaxed flex-1 mb-4">{description}</p>
        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <p className="text-white/30 text-[10px] font-mono">{meta}</p>
          <span className="text-teal-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Play →</span>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-teal-500 mb-2">{label}</p>
      <h2 className="text-white" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(34px, 5vw, 56px)", letterSpacing: "0.06em", lineHeight: 1 }}>
        {title}
      </h2>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [dailyData, setDailyData] = useState<DailyData>({
    date: getTodayStr(), guessWhoWon: null, statLineWon: null,
  });
  const [streakCount, setStreakCount] = useState(0);
  const [dailyGuessWhoPlayer, setDailyGuessWhoPlayer] = useState<typeof CURRENT_GUESS_WHO_PLAYERS[0] | null>(null);
  const [dailyStatLinePlayer, setDailyStatLinePlayer] = useState<typeof CURRENT_STAT_LINE_PLAYERS[0] | null>(null);

  useEffect(() => {
    const gwIdx = getDailyIndex(CURRENT_GUESS_WHO_PLAYERS.length, 0);
    const slIdx = getDailyIndex(CURRENT_STAT_LINE_PLAYERS.length, 7);
    setDailyGuessWhoPlayer(CURRENT_GUESS_WHO_PLAYERS[gwIdx]);
    setDailyStatLinePlayer(CURRENT_STAT_LINE_PLAYERS[slIdx]);

    const data = loadDailyData();
    setDailyData(data);
    if (data.guessWhoWon === true && data.statLineWon === true) updateStreak();

    function refreshStreak() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refreshStreak();
    window.addEventListener("daily-update", refreshStreak);
    return () => window.removeEventListener("daily-update", refreshStreak);
  }, []);

  function handleGuessWhoComplete(won: boolean) {
    const newData = { ...dailyData, guessWhoWon: won };
    setDailyData(newData);
    saveDailyData(newData);
    if (won && newData.statLineWon === true) updateStreak();
  }

  function handleStatLineComplete(won: boolean) {
    const newData = { ...dailyData, statLineWon: won };
    setDailyData(newData);
    saveDailyData(newData);
    if (won && newData.guessWhoWon === true) updateStreak();
  }

  const bothWon = dailyData.guessWhoWon === true && dailyData.statLineWon === true;
  const bothDone = dailyData.guessWhoWon !== null && dailyData.statLineWon !== null;

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "linear-gradient(160deg, #050e1a 0%, #071520 40%, #091c22 70%, #071018 100%)" }}>

      {/* ── Header ── */}
      <header className="relative z-50 bg-black/40 backdrop-blur-md border-b border-white/8 px-6 py-0 flex items-center justify-between sticky top-0 overflow-hidden" style={{ minHeight: 56 }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(to bottom, #ff0062, #ff006250)" }} />
        <div className="absolute inset-0 scan-lines pointer-events-none opacity-40" />
        <div className="flex items-center gap-3 relative z-10 py-3">
          <img src="/logo.svg" alt="Courtside Central" className="h-9 w-auto" />
          <span className="font-bebas text-white text-2xl tracking-[0.08em]" style={{ lineHeight: 1 }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-3 relative z-10 py-3">
          <span className="text-[10px] text-teal-400/70 hidden sm:block font-mono tracking-widest">SEASON 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden">
        <style>{`
          @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(40px,-30px) scale(1.08)} 70%{transform:translate(-20px,20px) scale(0.95)} }
          @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-50px,25px) scale(1.06)} 65%{transform:translate(30px,-20px) scale(0.97)} }
        `}</style>
        <div className="absolute pointer-events-none" style={{ width: 780, height: 620, bottom: "-140px", left: "-160px", background: "radial-gradient(ellipse, rgba(251,146,60,0.28) 0%, rgba(234,88,12,0.12) 45%, transparent 70%)", filter: "blur(60px)", animation: "floatA 9s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        <div className="absolute pointer-events-none" style={{ width: 720, height: 580, top: "-120px", right: "-140px", background: "radial-gradient(ellipse, rgba(20,184,166,0.25) 0%, rgba(13,148,136,0.10) 50%, transparent 70%)", filter: "blur(65px)", animation: "floatB 11s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        <div className="absolute pointer-events-none" style={{ width: "100%", height: 300, bottom: 0, left: 0, background: "linear-gradient(to top, rgba(13,148,136,0.18) 0%, transparent 100%)", filter: "blur(2px)", zIndex: 1 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(5,14,26,0.82) 100%)", zIndex: 2 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 2 }} />
        <div className="absolute inset-0 pointer-events-none speed-lines-bg" style={{ zIndex: 3 }} />

        {PLATE_LAYOUT.map((pl, i) => (
          <PhotoPlate3D key={i} src={HERO_PHOTOS[i].src} label={HERO_PHOTOS[i].label} pos={HERO_PHOTOS[i].pos} x={pl.x} y={pl.y} rx={pl.rx} ry={pl.ry} rz={pl.rz} w={pl.w} idx={i} zLayer={pl.zLayer} />
        ))}

        <motion.div className="relative text-center pointer-events-none" style={{ zIndex: 10 }} initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: "easeOut" }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-teal-400 mb-6">Test Your NBA IQ</p>
          <h1 className="uppercase text-white" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(80px, 14vw, 210px)", lineHeight: 0.88, letterSpacing: "0.05em", textShadow: "0 0 120px rgba(20,184,166,0.5), 4px 4px 0px rgba(255,0,98,0.25), 0 4px 40px rgba(0,0,0,0.9)" }}>
            Courtside<br />Central
          </h1>
        </motion.div>

        <motion.div className="relative mt-10" style={{ zIndex: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <motion.a
            href="#games"
            className="inline-block px-14 py-4 text-black font-bold uppercase"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.35rem", letterSpacing: "0.2em", background: "linear-gradient(90deg, #14b8a6, #00d4ff)", clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 100%, 14px 100%)", boxShadow: "0 0 40px rgba(20,184,166,0.55), 0 2px 12px rgba(0,0,0,0.4)" }}
            whileHover={{ scale: 1.06, boxShadow: "0 0 65px rgba(20,184,166,0.75), 0 4px 24px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.96 }}
          >
            Start Playing
          </motion.a>
        </motion.div>

        <motion.div className="absolute bottom-7 flex items-center gap-10" style={{ zIndex: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <StatCounter value={`${TRIOS.length + CURRENT_TRIOS.length}+`} label="Start Bench Cut Rounds" />
          <div className="h-8 w-px bg-teal-500/20" />
          <StatCounter value={`${LINEUPS.length}+`} label="Lineup Puzzles" />
          <div className="h-8 w-px bg-teal-500/20" />
          <StatCounter value={`${STAT_LINE_PLAYERS.length + CURRENT_STAT_LINE_PLAYERS.length}+`} label="Players" />
        </motion.div>
      </section>

      {/* ── Scrollable content ── */}
      <div id="games" className="max-w-5xl mx-auto px-6 py-20 pb-32 space-y-20">

        {/* Games */}
        <section>
          <SectionHeader label="Games" title="Pick Your Game" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES_LIST.map((g, i) => (
              <motion.div key={g.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <GameCard {...g} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Timed Challenges */}
        <section>
          <SectionHeader label="Timed Challenges" title="Race the Clock" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIMED_LIST.map((g, i) => (
              <motion.div key={g.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <GameCard {...g} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Daily */}
        <section>
          <SectionHeader label="Daily" title="Today's Challenges" />
          <p className="text-white/40 text-sm -mt-4 mb-8 font-mono">New players every day · Complete both to extend your streak</p>

          {/* Celebration banner */}
          {bothWon && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="mb-8">
              <div style={{ background: "linear-gradient(135deg, rgba(91,33,182,0.45) 0%, rgba(109,40,217,0.30) 50%, rgba(91,33,182,0.45) 100%)", border: "1px solid rgba(167,139,250,0.35)", clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 100%, 16px 100%)", boxShadow: "0 0 50px rgba(139,92,246,0.35)", padding: "20px 32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #a78bfa, #6d28d9)" }} />
                <div className="flex items-center gap-6">
                  <div>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(24px, 4vw, 36px)", letterSpacing: "0.14em", color: "#ddd6fe", lineHeight: 1 }}>Daily Complete</p>
                    <p className="font-mono text-purple-300/60 tracking-widest uppercase mt-1" style={{ fontSize: "0.6rem" }}>Streak badge updated in the header</p>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 1, height: 32, background: "rgba(167,139,250,0.25)" }} />
                    <div>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.2rem", letterSpacing: "0.04em", color: "white", lineHeight: 1, textAlign: "right" }}>{streakCount}</p>
                      <p className="font-mono uppercase tracking-widest text-purple-300/60" style={{ fontSize: "0.52rem", textAlign: "right" }}>Day Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Guess Who */}
            <div className="rounded-2xl p-6 border border-purple-500/20" style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(255,255,255,0.04) 100%)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "rgba(109,40,217,0.30)", clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%)", border: "1px solid rgba(168,85,247,0.35)" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="10" cy="10" r="3.5" /><circle cx="10" cy="10" r="7.5" />
                    <line x1="10" y1="1" x2="10" y2="4.5" /><line x1="10" y1="15.5" x2="10" y2="19" />
                    <line x1="1" y1="10" x2="4.5" y2="10" /><line x1="15.5" y1="10" x2="19" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.08em", color: "white", lineHeight: 1 }}>Daily Guess Who</h3>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-0.5">Current player · 5 clues · 5 guesses</p>
                </div>
                {dailyData.guessWhoWon !== null && (
                  <span className={`ml-auto text-xs font-bold px-2 py-1 font-mono ${dailyData.guessWhoWon ? "text-teal-300 bg-teal-500/15 border border-teal-500/30" : "text-red-300 bg-red-500/15 border border-red-500/30"}`} style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
                    {dailyData.guessWhoWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailyGuessWhoPlayer ? (
                <DailyGuessWhoGame player={dailyGuessWhoPlayer} onComplete={handleGuessWhoComplete} alreadyCompleted={dailyData.guessWhoWon !== null} won={dailyData.guessWhoWon} />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-white/25 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>

            {/* Daily Stat Line */}
            <div className="rounded-2xl p-6 border border-blue-500/20" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0.04) 100%)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.30)", clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%)", border: "1px solid rgba(59,130,246,0.35)" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1.5" y="12" width="4" height="6.5" rx="0.5" /><rect x="8" y="7.5" width="4" height="11" rx="0.5" />
                    <rect x="14.5" y="3" width="4" height="15.5" rx="0.5" /><line x1="0" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.08em", color: "white", lineHeight: 1 }}>Daily Stat Line</h3>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-0.5">Current player · 5 stats · 5 guesses</p>
                </div>
                {dailyData.statLineWon !== null && (
                  <span className={`ml-auto text-xs font-bold px-2 py-1 font-mono ${dailyData.statLineWon ? "text-teal-300 bg-teal-500/15 border border-teal-500/30" : "text-red-300 bg-red-500/15 border border-red-500/30"}`} style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
                    {dailyData.statLineWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailyStatLinePlayer ? (
                <DailyStatLineGame player={dailyStatLinePlayer} onComplete={handleStatLineComplete} alreadyCompleted={dailyData.statLineWon !== null} won={dailyData.statLineWon} />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-white/25 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>
          </div>

          {bothDone && !bothWon && (
            <p className="text-center text-white/30 text-xs font-mono mt-10 uppercase tracking-widest">Come back tomorrow for a new challenge</p>
          )}
        </section>

        <p className="text-white/20 text-xs text-center font-mono uppercase tracking-widest">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </div>
    </div>
  );
}
