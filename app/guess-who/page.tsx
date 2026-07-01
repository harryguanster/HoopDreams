"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";
import { ALL_TIME_GW_PLAYERS } from "@/lib/allTimePlayersGW";
import { CURRENT_PLAYER_NAMES, ALL_TIME_GW_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";
import GameHeader from "@/app/components/GameHeader";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

type Era = "alltime" | "current";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function EraTab({ era, setEra }: { era: Era; setEra: (e: Era) => void }) {
  return (
    <div className="sticky top-[52px] z-30 backdrop-blur-md border-b overflow-hidden" style={{ background: "rgba(244,240,230,0.95)", borderColor: "rgba(0,0,0,0.09)" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 py-2.5">
        {(["alltime", "current"] as const).map(e => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className="relative px-5 py-2 text-sm font-bold transition-all duration-200 font-bebas tracking-widest"
            style={era === e ? {
              background: e === "current"
                ? "linear-gradient(90deg, #0ea5e9, #0284c7)"
                : "linear-gradient(90deg, #84cc16, #65a30d)",
              color: "#111827",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            } : { color: "#6b7280" }}
          >
            {e === "alltime" ? "ALL-TIME LEGENDS" : "CURRENT 2025–26"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Wordle helpers ─────────────────────────────────────────────────────────────

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
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

const CELL_BG: Record<CellColor, string> = {
  green: "bg-green-500 text-white border-green-500",
  yellow: "bg-yellow-400 text-white border-yellow-400",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
};

// ── Team / Division helpers ────────────────────────────────────────────────────

const TEAM_DIVISION: Record<string, string> = {
  "Boston Celtics": "Atlantic", "Brooklyn Nets": "Atlantic", "New Jersey Nets": "Atlantic",
  "New York Nets": "Atlantic", "New York Knicks": "Atlantic", "Philadelphia 76ers": "Atlantic",
  "Syracuse Nationals": "Atlantic", "Philadelphia Warriors": "Atlantic",
  "Buffalo Braves": "Atlantic", "Toronto Raptors": "Atlantic", "Rochester Royals": "Atlantic",
  "Chicago Bulls": "Central", "Chicago Stags": "Central", "Cleveland Cavaliers": "Central",
  "Detroit Pistons": "Central", "Fort Wayne Pistons": "Central", "Indiana Pacers": "Central",
  "Milwaukee Bucks": "Central", "Milwaukee Hawks": "Central", "Cincinnati Royals": "Central",
  "Atlanta Hawks": "Southeast", "St. Louis Hawks": "Southeast", "Tri-Cities Blackhawks": "Southeast",
  "Charlotte Hornets": "Southeast", "Charlotte Bobcats": "Southeast",
  "Miami Heat": "Southeast", "Orlando Magic": "Southeast",
  "Washington Wizards": "Southeast", "Washington Bullets": "Southeast",
  "Capital Bullets": "Southeast", "Baltimore Bullets": "Southeast",
  "Denver Nuggets": "Northwest", "Minnesota Timberwolves": "Northwest",
  "Oklahoma City Thunder": "Northwest", "Seattle SuperSonics": "Northwest",
  "Portland Trail Blazers": "Northwest", "Utah Jazz": "Northwest",
  "Vancouver Grizzlies": "Northwest", "Minneapolis Lakers": "Northwest",
  "Golden State Warriors": "Pacific", "San Francisco Warriors": "Pacific",
  "LA Clippers": "Pacific", "Los Angeles Clippers": "Pacific", "San Diego Clippers": "Pacific",
  "Los Angeles Lakers": "Pacific", "Phoenix Suns": "Pacific",
  "Sacramento Kings": "Pacific", "Kansas City Kings": "Pacific", "Kansas City-Omaha Kings": "Pacific",
  "Dallas Mavericks": "Southwest", "Houston Rockets": "Southwest", "San Diego Rockets": "Southwest",
  "Memphis Grizzlies": "Southwest", "New Orleans Pelicans": "Southwest",
  "New Orleans Hornets": "Southwest", "New Orleans Jazz": "Southwest", "San Antonio Spurs": "Southwest",
};

const DIVISION_ABBR: Record<string, string> = {
  "Atlantic": "ATL", "Central": "CEN", "Southeast": "SE",
  "Northwest": "NW", "Pacific": "PAC", "Southwest": "SW",
};

const DIV_CONFERENCE: Record<string, string> = {
  "Atlantic": "East", "Central": "East", "Southeast": "East",
  "Northwest": "West", "Pacific": "West", "Southwest": "West",
};

const TEAM_ABBR: Record<string, string> = {
  "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN",
  "New Jersey Nets": "NJN", "New York Nets": "NNE", "Charlotte Hornets": "CHA",
  "Charlotte Bobcats": "CHA", "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN", "Detroit Pistons": "DET",
  "Fort Wayne Pistons": "FWP", "Golden State Warriors": "GSW",
  "San Francisco Warriors": "SFW", "Philadelphia Warriors": "PHW",
  "Houston Rockets": "HOU", "San Diego Rockets": "SDR", "Indiana Pacers": "IND",
  "LA Clippers": "LAC", "Los Angeles Clippers": "LAC", "San Diego Clippers": "SDC",
  "Buffalo Braves": "BUF", "Los Angeles Lakers": "LAL", "Minneapolis Lakers": "MNL",
  "Memphis Grizzlies": "MEM", "Vancouver Grizzlies": "VAN",
  "Miami Heat": "MIA", "Milwaukee Bucks": "MIL", "Milwaukee Hawks": "MLH",
  "Minnesota Timberwolves": "MIN", "New Orleans Pelicans": "NOP",
  "New Orleans Hornets": "NOH", "New Orleans Jazz": "NOJ",
  "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC", "Seattle SuperSonics": "SEA",
  "Orlando Magic": "ORL", "Philadelphia 76ers": "PHI", "Syracuse Nationals": "SYR",
  "Rochester Royals": "ROC", "Cincinnati Royals": "CIN",
  "Sacramento Kings": "SAC", "Kansas City Kings": "KCK", "Kansas City-Omaha Kings": "KCO",
  "San Antonio Spurs": "SAS", "Toronto Raptors": "TOR", "Utah Jazz": "UTA",
  "Washington Wizards": "WAS", "Washington Bullets": "WSB",
  "Capital Bullets": "CAP", "Baltimore Bullets": "BAL",
  "St. Louis Hawks": "STL", "Tri-Cities Blackhawks": "TRI",
  "Chicago Stags": "CHG", "Portland Trail Blazers": "POR",
};

function getDivision(team: string): string { return TEAM_DIVISION[team] ?? "Unknown"; }
function getConference(team: string): string { return DIV_CONFERENCE[getDivision(team)] ?? "Unknown"; }
function getTeamAbbr(team: string): string { return TEAM_ABBR[team] ?? team.slice(0, 3).toUpperCase(); }

function compareTeam(guessTeam: string, answerTeam: string): CellColor {
  if (guessTeam === answerTeam) return "green";
  if (getConference(guessTeam) === getConference(answerTeam)) return "yellow";
  return "gray";
}
function compareDivisionFn(guessTeam: string, answerTeam: string): CellColor {
  if (getDivision(guessTeam) === getDivision(answerTeam)) return "green";
  if (getConference(guessTeam) === getConference(answerTeam)) return "yellow";
  return "gray";
}
function compareConference(guessTeam: string, answerTeam: string): CellColor {
  return getConference(guessTeam) === getConference(answerTeam) ? "green" : "gray";
}
function getArrow(guess: number, answer: number): "up" | "down" | null {
  if (Math.round(guess * 10) === Math.round(answer * 10)) return null;
  return answer > guess ? "up" : "down";
}

function StatCellH({ value, color, arrow }: { value: string; color: CellColor; arrow?: "up" | "down" | null }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded h-16 text-center ${CELL_BG[color]}`}>
      <span className="text-xs font-black leading-none">{value}</span>
      {arrow && <span className="text-[11px] leading-none mt-0.5 font-bold">{arrow === "up" ? "↑" : "↓"}</span>}
    </div>
  );
}

const NBA_HEADSHOT_IDS: Record<string, number> = {
  trae: 1629027, jjohnson: 1630553, dehunter: 1629631,
  capela: 203991, okongwu: 1630168, bogdan: 203992, lnance: 1626204, ddaniels: 1631101,
  tatum: 1628369, jbrown: 1627759, holiday: 201950,
  horford: 201143, porzingis: 204001, dwhite: 1628401, ppritchard: 1630202, shauser: 1630554,
  camthomas: 1630560, nclaxton: 1629651, bsimmons: 1627732, schroder: 203471, cjohnson: 1629011,
  lamelo: 1630163, bmiller: 1631109, mbridges: 1628970,
  lavine: 203897, vucevic: 202696, cwhite: 1629632, giddey: 1630581,
  dmitchell: 1628378, garland: 1629636, mobley: 1630596, jallen: 1628386,
  kyrie: 202681, kthompson: 202691, pjwash: 1629023, dlively: 1641706, dgafford: 1629655,
  cade: 1630595, jivey: 1631099, istewart: 1630191, tharris: 202699,
  jokic: 203999, jmurray: 1627750, mporter: 1629008, agordon: 203932,
  kcpp: 203484, cbraun: 1631248,
  curry: 201939, dgreen: 203110, awiggins: 203952, kuminga: 1630228, mmoody: 1630541,
  jbutler: 202710,
  sengun: 1641706, jgreen2: 1630224, fvv: 1627832,
  haliburton: 1630169, siakam: 1627783, mturner: 1626167, bmathurin: 1631109,
  kawhi: 202695, harden: 201935,
  lebron: 2544, luka: 1629029, areaves: 1630559, hachimura: 1629637, dlrussell: 1626156,
  ja: 1629630, dbane: 1630217, jjackson: 1628991, msmart: 203935,
  bam: 1628389, therro: 1629639,
  giannis: 203507, dame: 203081, kmiddleton: 203114, blopez: 201572, bportis: 1626172,
  ant: 1630162, gobert: 203497, jrandle: 203944, mconley: 1626192,
  zion: 1629627, bingram: 1627742, cjmcc: 203468,
  brunson: 1628973, kat: 1626157, oganunoby: 1628384, jhart: 1628404,
  mikalbridg: 1628969, ddivincenzo: 1628976,
  sga: 1628983, cholmgren: 1631096, ihartenstein: 1628432, acaruso: 1627936,
  banchero: 1631094, fwagner: 1631011, jsuggs: 1630580,
  embiid: 203954, pgeorge: 202331, tmaxey: 1630178,
  durant: 201142, booker: 1626164, bbeal: 203078,
  defox: 1628368, sabonis: 1627734, lmarkkanen: 1628374,
  wemby: 1641705, dvassell: 1630170,
  sbarnes: 1630567, rjbarrett: 1629628, iquickley: 1630193,
  jclarkson: 203546, kuzma: 1628398,
};

const GRID_COLS = "minmax(140px,2.5fr) repeat(12,minmax(0,1fr))";

function PlayerFace({ player }: { player: CurrentNBAPlayer }) {
  const [failed, setFailed] = useState(false);
  const nbaId = NBA_HEADSHOT_IDS[player.id];
  if (!nbaId || failed) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[10px] shrink-0" style={{ backgroundColor: player.teamColor }}>
        {player.jersey}
      </div>
    );
  }
  return (
    <div className="w-10 h-8 rounded overflow-hidden shrink-0 bg-white/8">
      <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`} alt={player.name} className="w-full h-auto" onError={() => setFailed(true)} />
    </div>
  );
}

function GuessTableHeader() {
  const cols = ["NAME", "TEAM", "CONF", "DIV", "PPG", "RPG", "APG", "SPG", "BPG", "HT", "AGE", "DRFT", "#"];
  return (
    <div className="grid gap-1 pb-1 border-b border-gray-200" style={{ gridTemplateColumns: GRID_COLS }}>
      {cols.map((c, i) => (
        <div key={c} className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider ${i === 0 ? "pl-2" : "text-center"}`}>{c}</div>
      ))}
    </div>
  );
}

function EmptyRow({ num }: { num: number }) {
  return (
    <div className="w-full h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
      <span className="text-gray-300 font-bold text-sm">{num}</span>
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: CurrentNBAPlayer; answer: CurrentNBAPlayer }) {
  const isCorrect = guess.id === answer.id;
  const arrowFor = (g: number, a: number, color: CellColor) => color !== "green" ? getArrow(g, a) : null;
  const ppgC = compareStat(guess.ppg, answer.ppg, 4);
  const rpgC = compareStat(guess.rpg, answer.rpg, 2);
  const apgC = compareStat(guess.apg, answer.apg, 2);
  const spgC = compareStat(guess.spg, answer.spg, 0.5);
  const bpgC = compareStat(guess.bpg, answer.bpg, 0.5);
  const htC = compareHeight(guess.height, answer.height);
  const ageC = compareAge(guess.age, answer.age);
  const drfC = compareDraftYear(guess.draftYear, answer.draftYear);

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: GRID_COLS }}>
      <div className={`flex items-center gap-2 rounded-lg px-3 h-16 ${isCorrect ? "bg-green-500 text-white" : "bg-white border border-gray-200 text-[#111827]"}`}>
        <PlayerFace player={guess} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-tight truncate">{guess.name}</p>
          <p className={`text-[9px] leading-tight truncate ${isCorrect ? "text-green-100" : "text-gray-400"}`}>{getTeamAbbr(guess.team)}</p>
        </div>
      </div>
      <StatCellH value={getTeamAbbr(guess.team)} color={compareTeam(guess.team, answer.team)} />
      <StatCellH value={getConference(guess.team) === "East" ? "E" : "W"} color={compareConference(guess.team, answer.team)} />
      <StatCellH value={DIVISION_ABBR[getDivision(guess.team)] ?? "?"} color={compareDivisionFn(guess.team, answer.team)} />
      <StatCellH value={`${guess.ppg}`} color={ppgC} arrow={arrowFor(guess.ppg, answer.ppg, ppgC)} />
      <StatCellH value={`${guess.rpg}`} color={rpgC} arrow={arrowFor(guess.rpg, answer.rpg, rpgC)} />
      <StatCellH value={`${guess.apg}`} color={apgC} arrow={arrowFor(guess.apg, answer.apg, apgC)} />
      <StatCellH value={`${guess.spg}`} color={spgC} arrow={arrowFor(guess.spg, answer.spg, spgC)} />
      <StatCellH value={`${guess.bpg}`} color={bpgC} arrow={arrowFor(guess.bpg, answer.bpg, bpgC)} />
      <StatCellH value={formatHeight(guess.height)} color={htC} arrow={arrowFor(guess.height, answer.height, htC)} />
      <StatCellH value={`${guess.age}`} color={ageC} arrow={arrowFor(guess.age, answer.age, ageC)} />
      <StatCellH value={guess.draftYear ? `'${String(guess.draftYear).slice(2)}` : "UD"} color={drfC} arrow={guess.draftYear && answer.draftYear ? arrowFor(guess.draftYear, answer.draftYear, drfC) : null} />
      <StatCellH value={`#${guess.jersey}`} color={guess.jersey === answer.jersey ? "green" : "gray"} />
    </div>
  );
}

const MAX_GUESSES = 10;

const CONFETTI_COLORS = ["#84cc16","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#a3e635"];

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    rotate: Math.random() * 720,
    size: 8 + Math.random() * 8,
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

// Inner game — fully remounts when era changes via key prop
function WordleGame({ players, playerNames }: {
  players: CurrentNBAPlayer[];
  playerNames: string[];
}) {
  const [mounted, setMounted] = useState(false);
  const [shuffled, setShuffled] = useState<CurrentNBAPlayer[]>([]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [guesses, setGuesses] = useState<CurrentNBAPlayer[]>([]);
  const [guess, setGuess] = useState("");
  const [won, setWon] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setShuffled(shuffleArray(players));
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = shuffled[answerIndex % shuffled.length];

  const checkGuess = useCallback(() => {
    if (!answer) return;
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;

    const guessedPlayer = players.find(
      p => p.name.toLowerCase() === trimmed || p.aliases.some(a => a.toLowerCase() === trimmed)
    );

    if (!guessedPlayer) {
      setError("Player not found — try another name.");
      return;
    }
    if (guesses.some(g => g.id === guessedPlayer.id)) {
      setError("Already guessed that player!");
      return;
    }

    setError("");
    const next = [guessedPlayer, ...guesses];
    setGuesses(next);
    setGuess("");

    if (guessedPlayer.id === answer.id) {
      setWon(true);
    } else if (next.length >= MAX_GUESSES) {
      setGaveUp(true);
    }
  }, [guess, guesses, answer, players]);

  const handleNext = () => {
    setAnswerIndex(i => i + 1);
    setGuesses([]);
    setGuess("");
    setWon(false);
    setGaveUp(false);
    setError("");
  };

  if (!mounted || shuffled.length === 0) return <div className="flex-1" />;

  if (won || gaveUp) {
    const guessScore = won ? ["🏆","🔥","💯","⭐","👍","🤔","😅","😬","😓","😱"][Math.min(guesses.length - 1, 9)] : "😬";
    return (
      <div className="flex-1 relative overflow-hidden">
        {won && <Confetti />}
        <main className="flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full min-h-full">
          <motion.div
            className="w-full rounded-none p-7 text-center bg-white"
            style={{ border: "2px solid #111827" }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <motion.div
              className="text-6xl mb-3"
              initial={{ scale: 0.3, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            >
              {guessScore}
            </motion.div>
            <h2 className="text-2xl font-playfair font-black text-[#111827] mb-1" style={{ letterSpacing: "-0.02em" }}>{won ? "Correct!" : "Not quite!"}</h2>
            {won
              ? <p className="font-semibold text-sm mb-5" style={{ color: "#65a30d" }}>Got it in {guesses.length} guess{guesses.length !== 1 ? "es" : ""}!</p>
              : <p className="text-gray-500 text-sm mb-5">{guesses.length >= MAX_GUESSES ? "Out of guesses! The answer was:" : "The answer was:"}</p>
            }
            <motion.div
              className="flex items-center gap-4 bg-gray-50 rounded-none p-4 mb-6 text-left border-2 border-[#111827]"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.38 }}
            >
              <PlayerHeadshot
                playerId={answer.id}
                teamColor={answer.teamColor}
                jersey={answer.jersey}
                size={64}
              />
              <div>
                <p className="font-bold text-[#111827] text-base">{answer.name}</p>
                <p className="text-gray-500 text-sm">{answer.team} · {formatHeight(answer.height)}</p>
                <div className="flex gap-3 mt-1 text-xs font-semibold text-gray-400">
                  <span>{answer.ppg} PPG</span>
                  <span>{answer.rpg} RPG</span>
                  <span>{answer.apg} APG</span>
                </div>
              </div>
            </motion.div>
            <motion.button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold border-2 border-[#111827] text-sm tracking-wide transition-all"
              style={{ fontSize: "1.1rem", letterSpacing: "0.15em" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              Next Player →
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-6 py-8 w-full max-w-7xl mx-auto">
      {/* Dark header banner */}
      <div className="w-full border-2 border-[#111827] mb-6">
        <div className="px-6 py-5" style={{ background: "#111827" }}>
          <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">
            {guesses.length === 0 ? "Guess the mystery player" : `${guesses.length} / ${MAX_GUESSES} guesses used`}
          </p>
          <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}>
            Who Am I?
          </h1>
        </div>
        {/* Input row */}
        <div className="flex gap-0" style={{ borderTop: "2px solid #111827" }}>
          <div className="flex-1">
            <PlayerAutocomplete
              players={playerNames}
              value={guess}
              onChange={v => { setGuess(v); setError(""); }}
              onSubmit={checkGuess}
              autoFocus
            />
          </div>
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-8 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-l-2 border-[#111827] transition-colors shrink-0"
            style={guess.trim()
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
        {/* Legend strip */}
        <div className="flex gap-6 px-6 py-3" style={{ borderTop: "2px solid #111827", background: "#f4f0e6" }}>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500"><span className="w-3 h-3 bg-green-500 inline-block" /> Match</span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500"><span className="w-3 h-3 bg-yellow-400 inline-block" /> Close</span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500"><span className="w-3 h-3 bg-gray-300 inline-block" /> Off</span>
          <span className="font-mono text-[10px] text-gray-400">↑↓ = direction</span>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="w-full font-mono text-xs mb-3 border-2 border-[#ef4444] px-4 py-3 text-center"
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

      <div className="w-full overflow-x-auto">
        <div className="flex flex-col gap-1.5" style={{ minWidth: "860px" }}>
          <GuessTableHeader />
          <AnimatePresence initial={false}>
            {guesses.map((g, i) => (
              <motion.div
                key={`${g.id}-${i}`}
                initial={{ opacity: 0, y: -18, scale: 0.97 }}
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
  const searchParams = useSearchParams();
  const [era, setEra] = useState<Era>(
    searchParams.get("era") === "current" ? "current" : "alltime"
  );

  const players = era === "current" ? CURRENT_NBA_PLAYERS : ALL_TIME_GW_PLAYERS;
  const playerNames = era === "current" ? CURRENT_PLAYER_NAMES : ALL_TIME_GW_PLAYER_NAMES;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader title="Guess Who" era={era} />
      <EraTab era={era} setEra={setEra} />
      <WordleGame key={era} players={players} playerNames={playerNames} />
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
