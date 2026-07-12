"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";
import { CURRENT_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";
import GameHeader from "@/app/components/GameHeader";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Comparison helpers ─────────────────────────────────────────────────────────

type CellColor = "green" | "yellow" | "gray";

function compareStat(guess: number, answer: number, tolerance: number): CellColor {
  if (Math.round(guess) === Math.round(answer)) return "green";
  if (Math.abs(guess - answer) <= tolerance) return "yellow";
  return "gray";
}
function compareDraftYear(guess: number | null, answer: number | null): CellColor {
  if (guess === answer) return "green";
  if (guess === null || answer === null) return "gray";
  return Math.abs(guess - answer) <= 3 ? "yellow" : "gray";
}
function compareAge(guess: number, answer: number): CellColor {
  if (guess === answer) return "green";
  return Math.abs(guess - answer) <= 2 ? "yellow" : "gray";
}
function compareHeight(guess: number, answer: number): CellColor {
  if (guess === answer) return "green";
  return Math.abs(guess - answer) <= 1 ? "yellow" : "gray";
}
function formatHeight(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

// ── Team / Conference / Division ───────────────────────────────────────────────

const TEAM_DIVISION: Record<string, string> = {
  "Boston Celtics":"Atlantic","Brooklyn Nets":"Atlantic","New Jersey Nets":"Atlantic",
  "New York Nets":"Atlantic","New York Knicks":"Atlantic","Philadelphia 76ers":"Atlantic",
  "Syracuse Nationals":"Atlantic","Philadelphia Warriors":"Atlantic",
  "Buffalo Braves":"Atlantic","Toronto Raptors":"Atlantic","Rochester Royals":"Atlantic",
  "Chicago Bulls":"Central","Chicago Stags":"Central","Cleveland Cavaliers":"Central",
  "Detroit Pistons":"Central","Fort Wayne Pistons":"Central","Indiana Pacers":"Central",
  "Milwaukee Bucks":"Central","Milwaukee Hawks":"Central","Cincinnati Royals":"Central",
  "Atlanta Hawks":"Southeast","St. Louis Hawks":"Southeast","Tri-Cities Blackhawks":"Southeast",
  "Charlotte Hornets":"Southeast","Charlotte Bobcats":"Southeast",
  "Miami Heat":"Southeast","Orlando Magic":"Southeast",
  "Washington Wizards":"Southeast","Washington Bullets":"Southeast",
  "Capital Bullets":"Southeast","Baltimore Bullets":"Southeast",
  "Denver Nuggets":"Northwest","Minnesota Timberwolves":"Northwest",
  "Oklahoma City Thunder":"Northwest","Seattle SuperSonics":"Northwest",
  "Portland Trail Blazers":"Northwest","Utah Jazz":"Northwest",
  "Vancouver Grizzlies":"Northwest","Minneapolis Lakers":"Northwest",
  "Golden State Warriors":"Pacific","San Francisco Warriors":"Pacific",
  "LA Clippers":"Pacific","Los Angeles Clippers":"Pacific","San Diego Clippers":"Pacific",
  "Los Angeles Lakers":"Pacific","Phoenix Suns":"Pacific",
  "Sacramento Kings":"Pacific","Kansas City Kings":"Pacific","Kansas City-Omaha Kings":"Pacific",
  "Dallas Mavericks":"Southwest","Houston Rockets":"Southwest","San Diego Rockets":"Southwest",
  "Memphis Grizzlies":"Southwest","New Orleans Pelicans":"Southwest",
  "New Orleans Hornets":"Southwest","New Orleans Jazz":"Southwest","San Antonio Spurs":"Southwest",
};
const DIVISION_ABBR: Record<string, string> = {
  "Atlantic":"ATL","Central":"CEN","Southeast":"SE","Northwest":"NW","Pacific":"PAC","Southwest":"SW",
};
const DIV_CONFERENCE: Record<string, string> = {
  "Atlantic":"East","Central":"East","Southeast":"East",
  "Northwest":"West","Pacific":"West","Southwest":"West",
};
const TEAM_ABBR: Record<string, string> = {
  "Atlanta Hawks":"ATL","Boston Celtics":"BOS","Brooklyn Nets":"BKN",
  "New Jersey Nets":"NJN","New York Knicks":"NYK","Charlotte Hornets":"CHA",
  "Charlotte Bobcats":"CHA","Chicago Bulls":"CHI","Cleveland Cavaliers":"CLE",
  "Dallas Mavericks":"DAL","Denver Nuggets":"DEN","Detroit Pistons":"DET",
  "Golden State Warriors":"GSW","Houston Rockets":"HOU","Indiana Pacers":"IND",
  "LA Clippers":"LAC","Los Angeles Clippers":"LAC","Los Angeles Lakers":"LAL",
  "Memphis Grizzlies":"MEM","Miami Heat":"MIA","Milwaukee Bucks":"MIL",
  "Minnesota Timberwolves":"MIN","New Orleans Pelicans":"NOP","New Orleans Hornets":"NOH",
  "New York Nets":"NNE","Oklahoma City Thunder":"OKC","Orlando Magic":"ORL",
  "Philadelphia 76ers":"PHI","Phoenix Suns":"PHX","Portland Trail Blazers":"POR",
  "Sacramento Kings":"SAC","San Antonio Spurs":"SAS","Seattle SuperSonics":"SEA",
  "Toronto Raptors":"TOR","Utah Jazz":"UTA","Vancouver Grizzlies":"VAN",
  "Washington Wizards":"WAS","Washington Bullets":"WSB",
};

function getDivision(team: string): string { return TEAM_DIVISION[team] ?? "Unknown"; }
function getConference(team: string): string { return DIV_CONFERENCE[getDivision(team)] ?? "Unknown"; }
function getTeamAbbr(team: string): string { return TEAM_ABBR[team] ?? team.slice(0,3).toUpperCase(); }
function compareTeam(g: string, a: string): CellColor {
  if (g === a) return "green";
  return getConference(g) === getConference(a) ? "yellow" : "gray";
}
function compareDivisionFn(g: string, a: string): CellColor {
  if (getDivision(g) === getDivision(a)) return "green";
  return getConference(g) === getConference(a) ? "yellow" : "gray";
}
function compareConference(g: string, a: string): CellColor {
  return getConference(g) === getConference(a) ? "green" : "gray";
}
function getArrow(guess: number, answer: number): "up" | "down" | null {
  if (Math.round(guess * 10) === Math.round(answer * 10)) return null;
  return answer > guess ? "up" : "down";
}

// ── Cell component ─────────────────────────────────────────────────────────────

const CELL_STYLES: Record<CellColor, React.CSSProperties> = {
  green:  { background: "#84cc16", color: "white" },
  yellow: { background: "#f59e0b", color: "white" },
  gray:   { background: "#f4f0e6", color: "#aaa49b", border: "1px solid #ddd8cc" },
};

function StatCell({ value, color, arrow }: { value: string; color: CellColor; arrow?: "up"|"down"|null }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ height: 76, borderRadius: 5, ...CELL_STYLES[color] }}
    >
      <span className="font-playfair font-black leading-none" style={{ fontSize: "1.05rem" }}>{value}</span>
      {arrow && (
        <span className="font-mono font-bold leading-none mt-1" style={{ fontSize: "0.7rem" }}>
          {arrow === "up" ? "↑" : "↓"}
        </span>
      )}
    </div>
  );
}

// ── NBA headshot IDs ───────────────────────────────────────────────────────────

const NBA_IDS: Record<string, number> = {
  trae:1629027,tatum:1628369,jbrown:1627759,holiday:201950,horford:201143,porzingis:204001,
  dwhite:1628401,camthomas:1630560,nclaxton:1629651,lamelo:1630163,mbridges:1628970,
  lavine:203897,vucevic:202696,dmitchell:1628378,garland:1629636,mobley:1630596,jallen:1628386,
  kyrie:202681,kthompson:202691,dlively:1641706,cade:1630595,istewart:1630191,tharris:202699,
  jokic:203999,jmurray:1627750,mporter:1629008,agordon:203932,kcpp:203484,
  curry:201939,dgreen:203110,awiggins:203952,kuminga:1630228,jbutler:202710,
  sengun:1641706,haliburton:1630169,siakam:1627783,mturner:1626167,
  kawhi:202695,harden:201935,lebron:2544,luka:1629029,areaves:1630559,dlrussell:1626156,
  ja:1629630,dbane:1630217,jjackson:1628991,bam:1628389,therro:1629639,
  giannis:203507,dame:203081,kmiddleton:203114,blopez:201572,
  ant:1630162,gobert:203497,jrandle:203944,
  zion:1629627,bingram:1627742,brunson:1628973,kat:1626157,oganunoby:1628384,
  sga:1628983,cholmgren:1631096,ihartenstein:1628432,acaruso:1627936,
  banchero:1631094,fwagner:1631011,jsuggs:1630580,
  embiid:203954,pgeorge:202331,tmaxey:1630178,durant:201142,booker:1626164,
  defox:1628368,sabonis:1627734,lmarkkanen:1628374,wemby:1641705,dvassell:1630170,
  sbarnes:1630567,rjbarrett:1629628,iquickley:1630193,jclarkson:203546,kuzma:1628398,
};

function PlayerFace({ player }: { player: CurrentNBAPlayer }) {
  const [failed, setFailed] = useState(false);
  const nbaId = NBA_IDS[player.id];
  if (!nbaId || failed) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-xs shrink-0" style={{ backgroundColor: player.teamColor }}>
        {player.jersey}
      </div>
    );
  }
  return (
    <div className="w-11 h-9 rounded overflow-hidden shrink-0">
      <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`} alt={player.name} className="w-full h-auto" onError={() => setFailed(true)} />
    </div>
  );
}

// ── Grid layout ────────────────────────────────────────────────────────────────

const GRID_COLS = "minmax(180px,3fr) repeat(12,minmax(0,1fr))";

function GuessTableHeader() {
  const cols = ["PLAYER","TEAM","CONF","DIV","PPG","RPG","APG","SPG","BPG","HT","AGE","DRFT","#"];
  return (
    <div className="grid gap-2 pb-2" style={{ gridTemplateColumns: GRID_COLS, borderBottom: "2px solid #111827" }}>
      {cols.map((c, i) => (
        <div key={c} className={`font-mono font-bold uppercase tracking-widest text-[10px] ${i === 0 ? "pl-3" : "text-center"}`} style={{ color: "#84cc16" }}>
          {c}
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ num }: { num: number }) {
  return (
    <div
      className="flex items-center px-4"
      style={{ height: 76, background: "#f4f0e6", border: "1px solid #ddd8cc", borderRadius: 5 }}
    >
      <span className="font-playfair font-black" style={{ fontSize: "1.5rem", color: "#e0dbd0" }}>{num}</span>
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: CurrentNBAPlayer; answer: CurrentNBAPlayer }) {
  const isCorrect = guess.id === answer.id;
  const af = (g: number, a: number, c: CellColor) => c !== "green" ? getArrow(g, a) : null;
  const ppgC = compareStat(guess.ppg, answer.ppg, 4);
  const rpgC = compareStat(guess.rpg, answer.rpg, 2);
  const apgC = compareStat(guess.apg, answer.apg, 2);
  const spgC = compareStat(guess.spg, answer.spg, 0.5);
  const bpgC = compareStat(guess.bpg, answer.bpg, 0.5);
  const htC  = compareHeight(guess.height, answer.height);
  const ageC = compareAge(guess.age, answer.age);
  const drfC = compareDraftYear(guess.draftYear, answer.draftYear);

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: GRID_COLS }}>
      {/* Name cell */}
      <div
        className="flex items-center gap-3 px-3"
        style={{
          height: 76, borderRadius: 5,
          background: isCorrect ? "#84cc16" : "white",
          color: isCorrect ? "white" : "#111827",
          border: isCorrect ? "2px solid #84cc16" : "2px solid #111827",
        }}
      >
        <PlayerFace player={guess} />
        <div className="min-w-0 flex-1">
          <p className="font-mono font-bold leading-tight truncate" style={{ fontSize: "0.78rem" }}>{guess.name}</p>
          <p className="font-mono leading-tight truncate" style={{ fontSize: "0.68rem", color: isCorrect ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
            {getTeamAbbr(guess.team)}
          </p>
        </div>
      </div>
      <StatCell value={getTeamAbbr(guess.team)} color={compareTeam(guess.team, answer.team)} />
      <StatCell value={getConference(guess.team) === "East" ? "E" : "W"} color={compareConference(guess.team, answer.team)} />
      <StatCell value={DIVISION_ABBR[getDivision(guess.team)] ?? "?"} color={compareDivisionFn(guess.team, answer.team)} />
      <StatCell value={`${guess.ppg}`} color={ppgC} arrow={af(guess.ppg, answer.ppg, ppgC)} />
      <StatCell value={`${guess.rpg}`} color={rpgC} arrow={af(guess.rpg, answer.rpg, rpgC)} />
      <StatCell value={`${guess.apg}`} color={apgC} arrow={af(guess.apg, answer.apg, apgC)} />
      <StatCell value={`${guess.spg}`} color={spgC} arrow={af(guess.spg, answer.spg, spgC)} />
      <StatCell value={`${guess.bpg}`} color={bpgC} arrow={af(guess.bpg, answer.bpg, bpgC)} />
      <StatCell value={formatHeight(guess.height)} color={htC} arrow={af(guess.height, answer.height, htC)} />
      <StatCell value={`${guess.age}`} color={ageC} arrow={af(guess.age, answer.age, ageC)} />
      <StatCell
        value={guess.draftYear ? `'${String(guess.draftYear).slice(2)}` : "UD"}
        color={drfC}
        arrow={guess.draftYear && answer.draftYear ? af(guess.draftYear, answer.draftYear, drfC) : null}
      />
      <StatCell value={`#${guess.jersey}`} color={guess.jersey === answer.jersey ? "green" : "gray"} />
    </div>
  );
}

// ── Streak storage ─────────────────────────────────────────────────────────────

const GW_STREAK_KEY = "courtside_gw_streak_v1";
const GW_BEST_KEY   = "courtside_gw_best_v1";

function loadGWNum(key: string): number {
  if (typeof window === "undefined") return 0;
  try { return parseInt(localStorage.getItem(key) ?? "0", 10) || 0; } catch { return 0; }
}
function saveGWNum(key: string, n: number) {
  try { localStorage.setItem(key, String(n)); } catch { /* ignore */ }
}

// ── Confetti ───────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#84cc16","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#a3e635"];

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: 15 + Math.random() * 70,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.5,
    duration: 1.2 + Math.random() * 0.9,
    rotate: Math.random() * 720,
    size: 8 + Math.random() * 9,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm top-0"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Main game ─────────────────────────────────────────────────────────────────

const MAX_GUESSES = 6;

function WordleGame({ players, playerNames }: { players: CurrentNBAPlayer[]; playerNames: string[] }) {
  const { user } = useUser();
  const [mounted, setMounted]       = useState(false);
  const [shuffled, setShuffled]     = useState<CurrentNBAPlayer[]>([]);
  const [answerIdx, setAnswerIdx]   = useState(0);
  const [guesses, setGuesses]       = useState<CurrentNBAPlayer[]>([]);
  const [inputVal, setInputVal]     = useState("");
  const [won, setWon]               = useState(false);
  const [gaveUp, setGaveUp]         = useState(false);
  const [error, setError]           = useState("");
  const [streak, setStreak]         = useState(0);
  const [best, setBest]             = useState(0);

  useEffect(() => {
    setShuffled(shuffleArray(players));
    setStreak(loadGWNum(GW_STREAK_KEY));
    setBest(loadGWNum(GW_BEST_KEY));
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = shuffled[answerIdx % shuffled.length];

  const checkGuess = useCallback(() => {
    if (!answer) return;
    const trimmed = inputVal.trim().toLowerCase();
    if (!trimmed) return;

    const found = players.find(
      p => p.name.toLowerCase() === trimmed || p.aliases.some(a => a.toLowerCase() === trimmed)
    );

    if (!found) { setError("Player not found — try another name."); return; }
    if (guesses.some(g => g.id === found.id)) { setError("Already guessed that player!"); return; }

    setError("");
    const next = [found, ...guesses];
    setGuesses(next);
    setInputVal("");

    if (found.id === answer.id) setWon(true);
    else if (next.length >= MAX_GUESSES) setGaveUp(true);
  }, [inputVal, guesses, answer, players]);

  const handleNext = (didWin: boolean) => {
    if (didWin) {
      const ns = streak + 1;
      const nb = Math.max(ns, best);
      setStreak(ns); setBest(nb);
      saveGWNum(GW_STREAK_KEY, ns);
      saveGWNum(GW_BEST_KEY, nb);
    } else {
      setStreak(0);
      saveGWNum(GW_STREAK_KEY, 0);
    }
    setAnswerIdx(i => i + 1);
    setGuesses([]); setInputVal(""); setWon(false); setGaveUp(false); setError("");
  };

  const userName = user?.firstName || user?.username || null;

  if (!mounted || shuffled.length === 0) return <div className="flex-1" />;

  // ── Result screen ─────────────────────────────────────────────────────────
  if (won || gaveUp) {
    const emoji = won ? ["🏆","🔥","💯","⭐","👍","🤔"][Math.min(guesses.length - 1, 5)] : "😬";
    return (
      <div className="flex-1 relative overflow-hidden" style={{ background: "#f4f0e6" }}>
        {won && <Confetti />}
        <main className="flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full min-h-full">
          <motion.div
            className="w-full"
            style={{ border: "2px solid #111827" }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="px-7 pt-7 pb-5 text-center" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
              <motion.div className="text-6xl mb-3" initial={{ scale: 0.3, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}>
                {emoji}
              </motion.div>
              <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-2">
                {won ? "Correct" : "Not Quite"}
              </p>
              <h2 className="font-playfair font-black italic text-white mb-0" style={{ fontSize: "clamp(2.5rem,6vw,3.5rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}>
                {won ? "Got it!" : "Nice try."}
              </h2>
            </div>
            <div className="p-6" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-xs text-gray-500 text-center mb-5">
                {won
                  ? `Guessed in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"} · New streak: ${streak + 1}`
                  : `Out of guesses. The answer was:`}
              </p>
              <motion.div
                className="flex items-center gap-4 p-4 mb-6 border-2 border-[#111827]"
                style={{ background: "#ffffff" }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
              >
                <PlayerHeadshot playerId={answer.id} teamColor={answer.teamColor} jersey={answer.jersey} size={64} />
                <div>
                  <p className="font-playfair font-black text-lg text-[#111827]">{answer.name}</p>
                  <p className="font-mono text-xs text-gray-400">{answer.team} · {formatHeight(answer.height)}</p>
                  <div className="flex gap-3 mt-1 font-mono text-xs text-gray-400">
                    <span>{answer.ppg} PPG</span>
                    <span>{answer.rpg} RPG</span>
                    <span>{answer.apg} APG</span>
                  </div>
                </div>
              </motion.div>
              <motion.button
                onClick={() => handleNext(won)}
                className="w-full py-4 font-mono font-bold text-sm uppercase tracking-[0.15em] border-2 border-[#111827] bg-[#84cc16] text-[#111827]"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              >
                Next Player →
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <main className="flex-1 flex flex-col px-6 py-6 w-full max-w-7xl mx-auto">

      {/* Header + input + legend — all one bordered block */}
      <div className="w-full border-2 border-[#111827] mb-5">

        {/* Top bar: title + streak */}
        <div className="flex items-center justify-between gap-4 px-6 py-5" style={{ background: "#111827" }}>
          <div>
            <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">
              {guesses.length === 0
                ? "Current Players · 2025–26 · Guess the mystery player"
                : `${MAX_GUESSES - guesses.length} guess${MAX_GUESSES - guesses.length === 1 ? "" : "es"} remaining`}
            </p>
            <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.2rem,4vw,2.8rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}>
              Who Am I?
            </h1>
          </div>

          {/* Streak leaderboard */}
          <div className="flex items-stretch gap-0 border-2 border-[#ffffff18] shrink-0">
            <div className="flex flex-col items-center justify-center px-6 py-3" style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <p className="font-mono font-bold uppercase tracking-[0.2em] text-[9px] text-gray-500 mb-1">Streak</p>
              <p className="font-playfair font-black tabular-nums" style={{ fontSize: "2.2rem", color: "#84cc16", lineHeight: 1 }}>{streak}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-3">
              <p className="font-mono font-bold uppercase tracking-[0.2em] text-[9px] text-gray-500 mb-1">
                {userName ? `${userName}'s Best` : "Best"}
              </p>
              <p className="font-playfair font-black tabular-nums" style={{ fontSize: "2.2rem", color: "#6b7280", lineHeight: 1 }}>{best}</p>
            </div>
          </div>
        </div>

        {/* Input row */}
        <div className="flex gap-0" style={{ borderTop: "2px solid #111827" }}>
          <div className="flex-1">
            <PlayerAutocomplete
              players={playerNames}
              value={inputVal}
              onChange={v => { setInputVal(v); setError(""); }}
              onSubmit={checkGuess}
              autoFocus
            />
          </div>
          <button
            onClick={checkGuess}
            disabled={!inputVal.trim()}
            className="px-8 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-l-2 border-[#111827] transition-colors shrink-0"
            style={inputVal.trim()
              ? { background: "#84cc16", color: "#111827" }
              : { background: "#f4f0e6", color: "#d1d5db", cursor: "not-allowed" }}
          >
            Guess
          </button>
          <button
            onClick={() => setGaveUp(true)}
            className="px-6 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-l-2 border-[#111827] bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            Give Up
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 px-6 py-3" style={{ borderTop: "2px solid #111827", background: "#f4f0e6" }}>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#84cc16" }} /> Match
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f59e0b" }} /> Close
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block bg-gray-200" /> Off
          </span>
          <span className="font-mono text-[10px] text-gray-400">↑↓ = direction</span>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="w-full font-mono text-xs mb-4 border-2 border-[#ef4444] px-4 py-3 text-center"
            style={{ color: "#ef4444", background: "#f4f0e6" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Guess grid */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col gap-2" style={{ minWidth: "1020px" }}>
          <GuessTableHeader />
          <AnimatePresence initial={false}>
            {guesses.map((g, i) => (
              <motion.div
                key={`${g.id}-${i}`}
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <GuessRow guess={g} answer={answer} />
              </motion.div>
            ))}
          </AnimatePresence>
          {Array.from({ length: Math.max(0, MAX_GUESSES - guesses.length) }).map((_, i) => (
            <EmptyRow key={i} num={guesses.length + i + 1} />
          ))}
        </div>
      </div>
    </main>
  );
}

function GuessWhoGame() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Guess Who" />
      <WordleGame players={CURRENT_NBA_PLAYERS} playerNames={CURRENT_PLAYER_NAMES} />
    </div>
  );
}

export default function GuessWhoPage() {
  return (
    <Suspense>
      <GuessWhoGame />
    </Suspense>
  );
}
