"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  SBCScene, GuessWhoScene, StatLineScene, LineupScene,
  TimedTeamsScene, TimedPlayersScene, DraftClassScene,
} from "@/app/components/GameIllustrations";

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

type Game = {
  href: string; tag: string; title: string; description: string; meta: string;
  playerId: number; playerPos: string; category: "games" | "timed";
};

const GAMES: Game[] = [
  {
    href: "/lineup-guesser", tag: "New", title: "Lineup Guesser",
    description: "5 starters, their stats. Which NBA team and season is it?",
    meta: `${LINEUPS.length} lineups · All eras`,
    playerId: 203999, playerPos: "top center", category: "games",
  },
  {
    href: "/start-bench-cut?era=alltime", tag: "Opinion", title: "Start, Bench, Cut · Legends",
    description: "Jordan vs Kobe vs LeBron — who starts, who rides pine, who gets cut?",
    meta: `${TRIOS.length} rounds · All eras`,
    playerId: 2544, playerPos: "top center", category: "games",
  },
  {
    href: "/guess-who?era=alltime", tag: "Puzzle", title: "Guess Who · Legends",
    description: "Decode a mystery legend from stat clues. Green = match, yellow = close.",
    meta: "302 players · 10 guesses",
    playerId: 977, playerPos: "top center", category: "games",
  },
  {
    href: "/stat-line-guesser?era=alltime", tag: "Stats", title: "Stat Line · Legends",
    description: "A career stat line revealed one clue at a time. Name the player.",
    meta: `${STAT_LINE_PLAYERS.length} players · 5 reveals`,
    playerId: 201142, playerPos: "top center", category: "games",
  },
  {
    href: "/start-bench-cut?era=current", tag: "Current", title: "Start, Bench, Cut · Now",
    description: "Jokic, Wemby, SGA — who runs your squad?",
    meta: `${CURRENT_TRIOS.length} rounds · 2025–26`,
    playerId: 1641705, playerPos: "top center", category: "games",
  },
  {
    href: "/guess-who?era=current", tag: "Current", title: "Guess Who · Current",
    description: "Identify today's stars from stats — PPG, team, division, and more.",
    meta: `${CURRENT_NBA_PLAYERS.length} players · 10 guesses`,
    playerId: 203507, playerPos: "top center", category: "games",
  },
  {
    href: "/stat-line-guesser?era=current", tag: "Current", title: "Stat Line · Current",
    description: "Current player stats, revealed one at a time. How fast can you name them?",
    meta: `${CURRENT_STAT_LINE_PLAYERS.length} players · 2025–26`,
    playerId: 1629029, playerPos: "top center", category: "games",
  },
  {
    href: "/challenges/name-teams", tag: "5 min", title: "Name All NBA Teams",
    description: "Can you name all 30 NBA franchises before time runs out?",
    meta: "30 teams · 5:00 timer",
    playerId: 201939, playerPos: "top center", category: "timed",
  },
  {
    href: "/challenges/name-players", tag: "10 min", title: "Name the Starters",
    description: "For each team, name the 5 current starters plus 1 bench player.",
    meta: "30 teams · 10:00 timer",
    playerId: 1628983, playerPos: "top center", category: "timed",
  },
  {
    href: "/challenges/draft-class", tag: "8 min", title: "Draft Class Challenge",
    description: "Name 3 players from every NBA draft class, 2010–2025. One hint provided per year.",
    meta: "16 classes · 48 players · 8:00 timer",
    playerId: 1629627, playerPos: "top center", category: "timed",
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
      <p className="mt-3 text-[9px] text-white/50 font-mono uppercase tracking-widest">PPG · 2025–26</p>
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
      <p className="mt-2 text-[9px] text-white/50 font-mono uppercase tracking-widest">Top teams avg · 2025–26</p>
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
      <p className="font-bebas text-teal-400 tabular-nums" style={{ fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}>{value}</p>
      <p className="text-[9px] text-white/50 font-mono uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}

function tagStyle(tag: string) {
  if (tag === "New")     return { chip: "text-orange-300 bg-orange-500/12 border-orange-400/30", glow: "rgba(251,146,60,0.35)" };
  if (tag === "Current") return { chip: "text-sky-300 bg-sky-500/12 border-sky-400/25", glow: "rgba(56,189,248,0.35)" };
  if (tag === "Opinion") return { chip: "text-purple-300 bg-purple-500/12 border-purple-400/25", glow: "rgba(168,85,247,0.3)" };
  if (tag === "Puzzle")  return { chip: "text-amber-300 bg-amber-500/12 border-amber-400/25", glow: "rgba(251,191,36,0.3)" };
  if (tag === "Stats")   return { chip: "text-emerald-300 bg-emerald-500/12 border-emerald-400/25", glow: "rgba(52,211,153,0.3)" };
  if (tag.includes("min")) return { chip: "text-red-300 bg-red-500/12 border-red-400/25 animate-pulse", glow: "rgba(248,113,113,0.35)" };
  return { chip: "text-teal-300 bg-teal-500/12 border-teal-400/20", glow: "rgba(20,184,166,0.3)" };
}

function GameCard({ href, tag, title, description, meta, playerId, playerPos }: Game) {
  const imgUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
  const { chip, glow } = tagStyle(tag);
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href={href} className="group relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm block"
        style={{
          minHeight: 170,
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)",
        }}>

        {/* Scan-line texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(20,184,166,0.025) 3px, rgba(20,184,166,0.025) 4px)",
        }} />

        {/* Player image — circular hologram right side */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full -m-3" style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            filter: "blur(10px)",
          }} />
          {/* Teal ring border */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-teal-400/30 relative"
            style={{ boxShadow: `0 0 20px ${glow}, inset 0 0 0 1px rgba(255,255,255,0.08)` }}>
            {/* Inner color tint overlay */}
            <div className="absolute inset-0 rounded-full z-10 mix-blend-color-dodge opacity-20"
              style={{ background: glow }} />
            <img
              src={imgUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: playerPos, filter: "contrast(1.08) brightness(0.92)" }}
            />
          </div>
          {/* Corner bracket decoration */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-teal-400/50" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-teal-400/50" />
        </div>

        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/15 pointer-events-none" />

        {/* Text content */}
        <div className="relative z-10 p-5 pr-40">
          <div className="mb-3">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${chip}`}>
              {tag}
            </span>
          </div>
          <h3 className="font-bebas text-white mb-1.5 group-hover:text-teal-300 transition-colors duration-200"
            style={{ fontSize: "1.35rem", letterSpacing: "0.06em", lineHeight: 1.1 }}>
            {title}
          </h3>
          <p className="text-xs text-white/70 leading-relaxed mb-4">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 font-mono">{meta}</span>
            <span className="text-teal-400 text-xs font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 transform">
              Play →
            </span>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(ellipse at 25% 50%, ${glow.replace("0.3", "0.06")} 0%, transparent 65%)` }} />

        {/* Bottom edge accent */}
        <div className="absolute bottom-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to right, transparent, ${glow}, transparent)` }} />
      </Link>
    </motion.div>
  );
}

// ─── Showcase section data ────────────────────────────────────────────────
type ShowcaseGame = {
  href: string; tag: string; title: string; description: string; meta: string;
  accentColor: string;
  Scene: React.ComponentType<{ accentColor?: string }>;
};

const SHOWCASE_GAMES: ShowcaseGame[] = [
  {
    href: "/start-bench-cut?era=alltime", tag: "Opinion",
    title: "Start · Bench · Cut", description: "Jordan, Kobe, LeBron — who starts, who rides pine, who gets cut? Make the call with over a hundred legendary trios.",
    meta: `${TRIOS.length} rounds · All-time legends`,
    accentColor: "#f97316",
    Scene: (p) => <SBCScene era="alltime" {...p} />,
  },
  {
    href: "/start-bench-cut?era=current", tag: "Current",
    title: "Start · Bench · Cut · Now", description: "Jokic, Wemby, SGA — build your dream 2025–26 roster one impossible trio at a time.",
    meta: `${CURRENT_TRIOS.length} rounds · 2025–26 season`,
    accentColor: "#0ea5e9",
    Scene: (p) => <SBCScene era="current" {...p} />,
  },
  {
    href: "/guess-who?era=alltime", tag: "Puzzle",
    title: "Guess Who · Legends", description: "Decode a mystery all-time great from Wordle-style stat clues. Green = exact match, yellow = close.",
    meta: "302 players · up to 10 guesses",
    accentColor: "#a855f7",
    Scene: (p) => <GuessWhoScene era="alltime" {...p} />,
  },
  {
    href: "/guess-who?era=current", tag: "Current",
    title: "Guess Who · Current", description: "Identify today's stars from PPG, team, division, position clues and more. How many guesses do you need?",
    meta: `${CURRENT_NBA_PLAYERS.length} players · 2025–26`,
    accentColor: "#0ea5e9",
    Scene: (p) => <GuessWhoScene era="current" {...p} />,
  },
  {
    href: "/stat-line-guesser?era=alltime", tag: "Stats",
    title: "Stat Line · Legends", description: "One clue at a time, a career stat line is revealed. Name the all-time great before all five clues drop.",
    meta: `${STAT_LINE_PLAYERS.length} players · 5 reveals`,
    accentColor: "#10b981",
    Scene: (p) => <StatLineScene era="alltime" {...p} />,
  },
  {
    href: "/stat-line-guesser?era=current", tag: "Current",
    title: "Stat Line · Current", description: "Current-season averages, drip-fed one stat at a time. Fewer clues = bigger bragging rights.",
    meta: `${CURRENT_STAT_LINE_PLAYERS.length} players · 2025–26`,
    accentColor: "#3b82f6",
    Scene: (p) => <StatLineScene era="current" {...p} />,
  },
  {
    href: "/lineup-guesser", tag: "New",
    title: "Lineup Guesser", description: "Five starters, their stat lines. You have three guesses to name the NBA team and season.",
    meta: `${LINEUPS.length} puzzles · All eras`,
    accentColor: "#14b8a6",
    Scene: (p) => <LineupScene {...p} />,
  },
];

const SHOWCASE_TIMED: ShowcaseGame[] = [
  {
    href: "/challenges/name-teams", tag: "5 min",
    title: "Name All NBA Teams", description: "30 franchises, 5 minutes. Type every team name before the clock hits zero — nicknames count.",
    meta: "30 teams · 5:00 timer",
    accentColor: "#f59e0b",
    Scene: (p) => <TimedTeamsScene {...p} />,
  },
  {
    href: "/challenges/name-players", tag: "10 min",
    title: "Name the Starters", description: "For each of the 30 teams, name the 5 current starters plus 1 bench player. Beat the 10-minute clock.",
    meta: "30 teams · 180 players · 10:00 timer",
    accentColor: "#f97316",
    Scene: (p) => <TimedPlayersScene {...p} />,
  },
  {
    href: "/challenges/draft-class", tag: "8 min",
    title: "Draft Class Challenge", description: "2010 through 2025 — name 3 players from every draft class. One hint is given per year.",
    meta: "16 classes · 48 players · 8:00 timer",
    accentColor: "#8b5cf6",
    Scene: (p) => <DraftClassScene {...p} />,
  },
];

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

// x/y = offset from hero center in vw/vh; zLayer 0 = behind title, 1 = in front
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
        position: "absolute",
        width: w,
        aspectRatio: "4/3",
        left: `calc(50% + ${x}vw)`,
        top: `calc(50% + ${y}vh)`,
        translateX: "-50%",
        translateY: "-50%",
        rotateX: rx,
        rotateY: ry,
        rotateZ: rz,
        transformPerspective: 950,
        borderRadius: 16,
        overflow: "hidden",
        zIndex: zLayer === 0 ? 5 : 15,
        boxShadow: "0 50px 130px rgba(0,0,0,0.88), 0 24px 65px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        willChange: "transform",
        pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        // Each plate gets a unique 3-waypoint path so x and y drift out of phase → organic loop
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
      {/* Glossy sheen */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 48%, rgba(0,0,0,0.08) 100%)", pointerEvents: "none" }} />
      {/* Label */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)" }}>
        <p style={{ color: "rgba(45,212,191,0.9)", fontSize: "7.5px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Full-viewport showcase section ──────────────────────────────────────
function GameShowcaseSection({ href, tag, title, description, meta, accentColor, Scene, flip, index }: ShowcaseGame & { flip: boolean; index: number }) {
  const { chip } = tagStyle(tag);
  return (
    <motion.section
      className="relative min-h-[88vh] flex items-center overflow-hidden border-b border-white/5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Atmosphere blob */}
      <div className="absolute pointer-events-none" style={{
        width: "65%", height: "100%",
        left: flip ? "auto" : 0, right: flip ? 0 : "auto",
        background: `radial-gradient(ellipse at ${flip ? "70%" : "30%"} 50%, ${accentColor}14 0%, transparent 65%)`,
      }} />

      {/* Diagonal speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", width: "220%", height: "1px",
            background: `linear-gradient(to right, transparent, ${accentColor}10, transparent)`,
            top: `${8 + i * 13}%`, left: "-60%",
            transform: `rotate(${flip ? -2 : 2}deg)`,
          }} />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center gap-8 sm:gap-16 py-16 ${flip ? "sm:flex-row-reverse" : ""}`}>

        {/* ── Illustration ── */}
        <motion.div className="flex-1 w-full max-w-lg"
          initial={{ opacity: 0, x: flip ? 100 : -100, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <Scene accentColor={accentColor} />
        </motion.div>

        {/* ── Text block ── */}
        <div className="flex-1 max-w-xl relative">

          {/* Ghost chapter number */}
          <div className="absolute -top-4 select-none pointer-events-none"
            style={{
              left: flip ? "auto" : "-0.08em",
              right: flip ? "-0.08em" : "auto",
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(100px, 18vw, 190px)",
              lineHeight: 1, letterSpacing: "0.05em",
              color: "transparent",
              WebkitTextStroke: `1.5px ${accentColor}16`,
            }}>
            {String(index + 1).padStart(2, "0")}
          </div>

          <motion.div
            initial={{ opacity: 0, x: flip ? -80 : 80, skewX: flip ? 4 : -4 }}
            whileInView={{ opacity: 1, x: 0, skewX: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tag with slash accent */}
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 28, height: 2, background: accentColor, transform: "skewX(-25deg)", flexShrink: 0 }} />
              <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-3 py-1 border ${chip}`}
                style={{ clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%)" }}>
                {tag}
              </span>
            </div>

            {/* Title — Bebas Neue */}
            <h2
              className="text-white mb-6"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(54px, 8.5vw, 108px)",
                letterSpacing: "0.05em",
                lineHeight: 0.92,
              }}
            >
              {title.split("·").map((part, i) => (
                <span key={i} style={{ display: "block", color: i === 0 ? "white" : accentColor }}>
                  {part.trim()}
                </span>
              ))}
            </h2>

            {/* Description */}
            <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md font-rajdhani" style={{ fontSize: "1.05rem" }}>
              {description}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-6">
              <Link href={href}>
                <motion.div
                  className="px-8 py-3.5 text-black font-bold uppercase"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "1.15rem",
                    letterSpacing: "0.18em",
                    background: accentColor,
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                    boxShadow: `0 0 30px ${accentColor}50, 0 2px 12px rgba(0,0,0,0.3)`,
                  }}
                  whileHover={{ scale: 1.06, boxShadow: `0 0 55px ${accentColor}80, 0 4px 20px rgba(0,0,0,0.4)` }}
                  whileTap={{ scale: 0.96 }}
                >
                  Play Now
                </motion.div>
              </Link>
              <span className="text-[11px] text-white/45 font-mono">{meta}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Accent bottom line */}
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accentColor}40, transparent)` }} />
    </motion.section>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"games" | "timed" | "daily">("games");
  const [dailyData, setDailyData] = useState<DailyData>({
    date: getTodayStr(), guessWhoWon: null, statLineWon: null,
  });
  const [streakCount, setStreakCount] = useState(0);
  const [dailyGuessWhoPlayer, setDailyGuessWhoPlayer] = useState<typeof CURRENT_GUESS_WHO_PLAYERS[0] | null>(null);
  const [dailyStatLinePlayer, setDailyStatLinePlayer] = useState<typeof CURRENT_STAT_LINE_PLAYERS[0] | null>(null);

  useEffect(() => {
    // Compute today's players client-side so the local calendar day is used
    const gwIdx = getDailyIndex(CURRENT_GUESS_WHO_PLAYERS.length, 0);
    const slIdx = getDailyIndex(CURRENT_STAT_LINE_PLAYERS.length, 7);
    setDailyGuessWhoPlayer(CURRENT_GUESS_WHO_PLAYERS[gwIdx]);
    setDailyStatLinePlayer(CURRENT_STAT_LINE_PLAYERS[slIdx]);

    const data = loadDailyData();
    setDailyData(data);
    if (data.guessWhoWon === true && data.statLineWon === true) {
      updateStreak();
    }

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

      {/* ── Header ─────────────────────────────────────────────── */}
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

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden">
        <style>{`
          @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(40px,-30px) scale(1.08)} 70%{transform:translate(-20px,20px) scale(0.95)} }
          @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-50px,25px) scale(1.06)} 65%{transform:translate(30px,-20px) scale(0.97)} }
        `}</style>

        {/* Orange blob */}
        <div className="absolute pointer-events-none" style={{ width: 780, height: 620, bottom: "-140px", left: "-160px", background: "radial-gradient(ellipse, rgba(251,146,60,0.28) 0%, rgba(234,88,12,0.12) 45%, transparent 70%)", filter: "blur(60px)", animation: "floatA 9s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        {/* Teal blob */}
        <div className="absolute pointer-events-none" style={{ width: 720, height: 580, top: "-120px", right: "-140px", background: "radial-gradient(ellipse, rgba(20,184,166,0.25) 0%, rgba(13,148,136,0.10) 50%, transparent 70%)", filter: "blur(65px)", animation: "floatB 11s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        {/* Horizon glow */}
        <div className="absolute pointer-events-none" style={{ width: "100%", height: 300, bottom: 0, left: 0, background: "linear-gradient(to top, rgba(13,148,136,0.18) 0%, transparent 100%)", filter: "blur(2px)", zIndex: 1 }} />
        {/* Edge vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(5,14,26,0.82) 100%)", zIndex: 2 }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 2 }} />
        {/* Anime speed lines emanating from center */}
        <div className="absolute inset-0 pointer-events-none speed-lines-bg" style={{ zIndex: 3 }} />

        {/* 3D floating photo plates */}
        {PLATE_LAYOUT.map((pl, i) => (
          <PhotoPlate3D
            key={i}
            src={HERO_PHOTOS[i].src}
            label={HERO_PHOTOS[i].label}
            pos={HERO_PHOTOS[i].pos}
            x={pl.x} y={pl.y}
            rx={pl.rx} ry={pl.ry} rz={pl.rz}
            w={pl.w} idx={i} zLayer={pl.zLayer}
          />
        ))}

        {/* Title — z-10, sandwiched between behind/in-front plates */}
        <motion.div
          className="relative text-center pointer-events-none"
          style={{ zIndex: 10 }}
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-teal-400 mb-6">
            Test Your NBA IQ
          </p>
          <h1
            className="uppercase text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(80px, 14vw, 210px)",
              lineHeight: 0.88,
              letterSpacing: "0.05em",
              textShadow: "0 0 120px rgba(20,184,166,0.5), 4px 4px 0px rgba(255,0,98,0.25), 0 4px 40px rgba(0,0,0,0.9)",
            }}
          >
            Courtside<br />Central
          </h1>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="relative mt-10"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.a
            href="/challenges"
            className="inline-block px-14 py-4 text-black font-bold uppercase"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "1.35rem",
              letterSpacing: "0.2em",
              background: "linear-gradient(90deg, #14b8a6, #00d4ff)",
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 100%, 14px 100%)",
              boxShadow: "0 0 40px rgba(20,184,166,0.55), 0 2px 12px rgba(0,0,0,0.4)",
            }}
            whileHover={{ scale: 1.06, boxShadow: "0 0 65px rgba(20,184,166,0.75), 0 4px 24px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.96 }}
          >
            Start Playing
          </motion.a>
        </motion.div>

        {/* Stats row — pinned to bottom */}
        <motion.div
          className="absolute bottom-7 flex items-center gap-10"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <StatCounter value={`${TRIOS.length + CURRENT_TRIOS.length}+`} label="Start Bench Cut Rounds" />
          <div className="h-8 w-px bg-teal-500/20" />
          <StatCounter value={`${LINEUPS.length}+`} label="Lineup Puzzles" />
          <div className="h-8 w-px bg-teal-500/20" />
          <StatCounter value={`${STAT_LINE_PLAYERS.length + CURRENT_STAT_LINE_PLAYERS.length}+`} label="Players" />
        </motion.div>
      </section>

      {/* ── Tab nav ────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-[#05101a]/90 backdrop-blur-md border-b border-white/6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(to bottom, #ff0062, transparent)" }} />
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 py-2.5">
          {(["games", "timed", "daily"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 text-sm font-bold transition-all duration-200 font-bebas tracking-widest ${
                activeTab === tab ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              style={activeTab === tab ? {
                background: tab === "daily"
                  ? "linear-gradient(90deg, #7c3aed, #a855f7)"
                  : "linear-gradient(90deg, #14b8a6, #00d4ff)",
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
                boxShadow: tab === "daily"
                  ? "0 0 18px rgba(168,85,247,0.45)"
                  : "0 0 18px rgba(20,184,166,0.45)",
              } : {}}>
              {tab === "games" ? "GAMES" : tab === "timed" ? "TIMED CHALLENGES" : "DAILY"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Showcase / Daily content ────────────────────────────── */}
      {activeTab !== "daily" ? (
        <div>
          {(activeTab === "games" ? SHOWCASE_GAMES : SHOWCASE_TIMED).map((s, i) => (
            <GameShowcaseSection key={s.href} {...s} flip={i % 2 === 1} index={i} />
          ))}
          <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
          <p className="text-center text-white/35 text-[10px] font-mono py-10 tracking-widest uppercase">
            Stats are career averages · Accolades are highlights, not exhaustive
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-purple-400 mb-3">Daily Games</p>
            <h2
              className="text-white mb-2"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px, 7vw, 72px)", letterSpacing: "0.06em", lineHeight: 1 }}
            >
              Today&apos;s Challenges
            </h2>
            <p className="text-white/45 text-sm font-rajdhani">New players every day. Complete both to extend your streak.</p>
          </div>

          {/* Celebration banner when both won */}
          {bothWon && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="mb-8"
            >
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(91,33,182,0.45) 0%, rgba(109,40,217,0.30) 50%, rgba(91,33,182,0.45) 100%)",
                  border: "1px solid rgba(167,139,250,0.35)",
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 100%, 16px 100%)",
                  boxShadow: "0 0 50px rgba(139,92,246,0.35), 0 0 100px rgba(139,92,246,0.12)",
                  padding: "20px 32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Diagonal speed lines */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    position: "absolute", width: "200%", height: "1px",
                    background: "linear-gradient(to right, transparent, rgba(167,139,250,0.15), transparent)",
                    top: `${15 + i * 18}%`, left: "-50%",
                    transform: "rotate(-2deg)", pointerEvents: "none",
                  }} />
                ))}
                {/* Left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #a78bfa, #6d28d9)" }} />

                <div className="flex items-center gap-6">
                  {/* Left geometric accent */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, opacity: 0.6 }}>
                    {[14, 10, 6].map((w, i) => (
                      <div key={i} style={{ height: 2, width: w, background: "#a78bfa", transform: `skewX(-20deg)` }} />
                    ))}
                  </div>

                  <div>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(24px, 4vw, 36px)", letterSpacing: "0.14em", color: "#ddd6fe", lineHeight: 1 }}>
                      Daily Complete
                    </p>
                    <p className="font-mono text-purple-300/60 tracking-widest uppercase mt-1" style={{ fontSize: "0.6rem" }}>
                      Streak badge updated in the header
                    </p>
                  </div>

                  {/* Streak number display */}
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 1, height: 32, background: "rgba(167,139,250,0.25)" }} />
                    <div>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.2rem", letterSpacing: "0.04em", color: "white", lineHeight: 1, textAlign: "right" }}>
                        {streakCount}
                      </p>
                      <p className="font-mono uppercase tracking-widest text-purple-300/60" style={{ fontSize: "0.52rem", textAlign: "right" }}>
                        Day Streak
                      </p>
                    </div>
                  </div>

                  {/* Right geometric accent */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, opacity: 0.6 }}>
                    {[6, 10, 14].map((w, i) => (
                      <div key={i} style={{ height: 2, width: w, background: "#a78bfa", transform: `skewX(-20deg)` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guess Who card */}
            <div
              className="rounded-2xl p-6 border border-purple-500/20"
              style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(255,255,255,0.04) 100%)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(109,40,217,0.30)",
                    clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%)",
                    border: "1px solid rgba(168,85,247,0.35)",
                  }}
                >
                  {/* Crosshair / target icon */}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="10" cy="10" r="3.5" />
                    <circle cx="10" cy="10" r="7.5" />
                    <line x1="10" y1="1" x2="10" y2="4.5" />
                    <line x1="10" y1="15.5" x2="10" y2="19" />
                    <line x1="1" y1="10" x2="4.5" y2="10" />
                    <line x1="15.5" y1="10" x2="19" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.08em", color: "white", lineHeight: 1 }}>
                    Daily Guess Who
                  </h3>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-0.5">
                    Current player · 5 clues · 5 guesses
                  </p>
                </div>
                {dailyData.guessWhoWon !== null && (
                  <span className={`ml-auto text-xs font-bold px-2 py-1 font-mono ${dailyData.guessWhoWon ? "text-teal-300 bg-teal-500/15 border border-teal-500/30" : "text-red-300 bg-red-500/15 border border-red-500/30"}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
                    {dailyData.guessWhoWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailyGuessWhoPlayer ? (
                <DailyGuessWhoGame
                  player={dailyGuessWhoPlayer}
                  onComplete={handleGuessWhoComplete}
                  alreadyCompleted={dailyData.guessWhoWon !== null}
                  won={dailyData.guessWhoWon}
                />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-white/25 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>

            {/* Stat Line card */}
            <div
              className="rounded-2xl p-6 border border-blue-500/20"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0.04) 100%)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(37,99,235,0.30)",
                    clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%)",
                    border: "1px solid rgba(59,130,246,0.35)",
                  }}
                >
                  {/* Bar chart icon */}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1.5" y="12" width="4" height="6.5" rx="0.5" />
                    <rect x="8" y="7.5" width="4" height="11" rx="0.5" />
                    <rect x="14.5" y="3" width="4" height="15.5" rx="0.5" />
                    <line x1="0" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.08em", color: "white", lineHeight: 1 }}>
                    Daily Stat Line
                  </h3>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-0.5">
                    Current player · 5 stats · 5 guesses
                  </p>
                </div>
                {dailyData.statLineWon !== null && (
                  <span className={`ml-auto text-xs font-bold px-2 py-1 font-mono ${dailyData.statLineWon ? "text-teal-300 bg-teal-500/15 border border-teal-500/30" : "text-red-300 bg-red-500/15 border border-red-500/30"}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
                    {dailyData.statLineWon ? "✓ Done" : "✗ Done"}
                  </span>
                )}
              </div>
              {dailyStatLinePlayer ? (
                <DailyStatLineGame
                  player={dailyStatLinePlayer}
                  onComplete={handleStatLineComplete}
                  alreadyCompleted={dailyData.statLineWon !== null}
                  won={dailyData.statLineWon}
                />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-white/25 text-xs font-mono uppercase tracking-widest">Loading…</p>
                </div>
              )}
            </div>
          </div>

          {bothDone && !bothWon && (
            <p className="text-center text-white/30 text-xs font-mono mt-10 uppercase tracking-widest">
              Come back tomorrow for a new challenge
            </p>
          )}
        </div>
      )}
    </div>
  );
}
