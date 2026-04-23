"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";
import { ALL_TIME_GW_PLAYERS } from "@/lib/allTimePlayersGW";
import { CURRENT_PLAYER_NAMES, ALL_TIME_GW_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Wordle helpers ────────────────────────────────────────────────────────────

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

function compareDraftPick(guess: number | null, answer: number | null): CellColor {
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
  gray: "bg-slate-100 text-slate-600 border-slate-200",
};

// ── Team / Division helpers ────────────────────────────────────────────────────

const TEAM_DIVISION: Record<string, string> = {
  // East – Atlantic
  "Boston Celtics": "Atlantic", "Brooklyn Nets": "Atlantic",
  "New Jersey Nets": "Atlantic", "New York Nets": "Atlantic",
  "New York Knicks": "Atlantic", "Philadelphia 76ers": "Atlantic",
  "Syracuse Nationals": "Atlantic", "Philadelphia Warriors": "Atlantic",
  "Buffalo Braves": "Atlantic", "Toronto Raptors": "Atlantic",
  "Rochester Royals": "Atlantic",
  // East – Central
  "Chicago Bulls": "Central", "Chicago Stags": "Central",
  "Cleveland Cavaliers": "Central", "Detroit Pistons": "Central",
  "Fort Wayne Pistons": "Central", "Indiana Pacers": "Central",
  "Milwaukee Bucks": "Central", "Milwaukee Hawks": "Central",
  "Cincinnati Royals": "Central",
  // East – Southeast
  "Atlanta Hawks": "Southeast", "St. Louis Hawks": "Southeast",
  "Tri-Cities Blackhawks": "Southeast",
  "Charlotte Hornets": "Southeast", "Charlotte Bobcats": "Southeast",
  "Miami Heat": "Southeast", "Orlando Magic": "Southeast",
  "Washington Wizards": "Southeast", "Washington Bullets": "Southeast",
  "Capital Bullets": "Southeast", "Baltimore Bullets": "Southeast",
  // West – Northwest
  "Denver Nuggets": "Northwest", "Minnesota Timberwolves": "Northwest",
  "Oklahoma City Thunder": "Northwest", "Seattle SuperSonics": "Northwest",
  "Portland Trail Blazers": "Northwest", "Utah Jazz": "Northwest",
  "Vancouver Grizzlies": "Northwest", "Minneapolis Lakers": "Northwest",
  // West – Pacific
  "Golden State Warriors": "Pacific", "San Francisco Warriors": "Pacific",
  "LA Clippers": "Pacific", "Los Angeles Clippers": "Pacific",
  "San Diego Clippers": "Pacific", "Los Angeles Lakers": "Pacific",
  "Phoenix Suns": "Pacific", "Sacramento Kings": "Pacific",
  "Kansas City Kings": "Pacific", "Kansas City-Omaha Kings": "Pacific",
  // West – Southwest
  "Dallas Mavericks": "Southwest", "Houston Rockets": "Southwest",
  "San Diego Rockets": "Southwest", "Memphis Grizzlies": "Southwest",
  "New Orleans Pelicans": "Southwest", "New Orleans Hornets": "Southwest",
  "New Orleans Jazz": "Southwest", "San Antonio Spurs": "Southwest",
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
  "Houston Rockets": "HOU", "San Diego Rockets": "SDR",
  "Indiana Pacers": "IND", "LA Clippers": "LAC", "Los Angeles Clippers": "LAC",
  "San Diego Clippers": "SDC", "Buffalo Braves": "BUF",
  "Los Angeles Lakers": "LAL", "Minneapolis Lakers": "MNL",
  "Memphis Grizzlies": "MEM", "Vancouver Grizzlies": "VAN",
  "Miami Heat": "MIA", "Milwaukee Bucks": "MIL", "Milwaukee Hawks": "MLH",
  "Minnesota Timberwolves": "MIN", "New Orleans Pelicans": "NOP",
  "New Orleans Hornets": "NOH", "New Orleans Jazz": "NOJ",
  "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC",
  "Seattle SuperSonics": "SEA", "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI", "Syracuse Nationals": "SYR",
  "Rochester Royals": "ROC", "Cincinnati Royals": "CIN",
  "Sacramento Kings": "SAC", "Kansas City Kings": "KCK",
  "Kansas City-Omaha Kings": "KCO", "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR", "Utah Jazz": "UTA",
  "Washington Wizards": "WAS", "Washington Bullets": "WSB",
  "Capital Bullets": "CAP", "Baltimore Bullets": "BAL",
  "St. Louis Hawks": "STL", "Tri-Cities Blackhawks": "TRI",
  "Chicago Stags": "CHG", "Portland Trail Blazers": "POR",
};

function getDivision(team: string): string {
  return TEAM_DIVISION[team] ?? "Unknown";
}
function getConference(team: string): string {
  return DIV_CONFERENCE[getDivision(team)] ?? "Unknown";
}
function getTeamAbbr(team: string): string {
  return TEAM_ABBR[team] ?? team.slice(0, 3).toUpperCase();
}
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

function StatCell({ value, color, label }: { value: string; color: CellColor; label: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border text-center py-2.5 px-1 ${CELL_BG[color]}`}>
      <span className="text-[9px] font-semibold opacity-70 uppercase tracking-wide leading-none mb-0.5">{label}</span>
      <span className="text-[11px] font-black leading-tight">{value}</span>
    </div>
  );
}

// ── NBA headshot IDs (cdn.nba.com/headshots/nba/latest/260x190/{id}.png) ──────

const NBA_HEADSHOT_IDS: Record<string, number> = {
  // Atlanta Hawks
  trae: 1629027, jjohnson: 1630553, dehunter: 1629631,
  capela: 203991, okongwu: 1630168, bogdan: 203992, lnance: 1626204, ddaniels: 1631101,
  // Boston Celtics
  tatum: 1628369, jbrown: 1627759, holiday: 201950,
  horford: 201143, porzingis: 204001, dwhite: 1628401, ppritchard: 1630202, shauser: 1630554,
  // Brooklyn Nets
  camthomas: 1630560, nclaxton: 1629651, bsimmons: 1627732, schroder: 203471, cjohnson: 1629011,
  // Charlotte Hornets
  lamelo: 1630163, bmiller: 1631109, mbridges: 1628970,
  // Chicago Bulls
  lavine: 203897, vucevic: 202696, cwhite: 1629632, giddey: 1630581,
  // Cleveland Cavaliers
  dmitchell: 1628378, garland: 1629636, mobley: 1630596, jallen: 1628386,
  // Dallas Mavericks
  kyrie: 202681, kthompson: 202691, pjwash: 1629023, dlively: 1641706, dgafford: 1629655,
  // Denver Nuggets
  jokic: 203999, jmurray: 1627750, mporter: 1629008, agordon: 203932,
  kcpp: 203484, cbraun: 1631248,
  // Golden State Warriors
  curry: 201939, dgreen: 203110, awiggins: 203952, kuminga: 1630228, mmoody: 1630541,
  jbutler: 202710,
  // Houston Rockets
  sengun: 1641706, jgreen2: 1630224, fvv: 1627832,
  // Indiana Pacers
  haliburton: 1630169, siakam: 1627783, mturner: 1626167, bmathurin: 1631109,
  // LA Clippers
  kawhi: 202695, harden: 201935,
  // LA Lakers
  lebron: 2544, luka: 1629029, areaves: 1630559, hachimura: 1629637, dlrussell: 1626156,
  // Memphis Grizzlies
  ja: 1629630, dbane: 1630217, jjackson: 1628991, msmart: 203935,
  // Miami Heat
  bam: 1628389, therro: 1629639,
  // Milwaukee Bucks
  giannis: 203507, dame: 203081, kmiddleton: 203114, blopez: 201572, bportis: 1626172,
  // Minnesota Timberwolves
  ant: 1630162, gobert: 203497, jrandle: 203944, mconley: 1626192,
  // New Orleans Pelicans
  zion: 1629627, bingram: 1627742, cjmcc: 203468,
  // New York Knicks
  brunson: 1628973, kat: 1626157, oganunoby: 1628384, jhart: 1628404,
  mikalbridg: 1628969, ddivincenzo: 1628976,
  // OKC Thunder
  sga: 1628983, cholmgren: 1631096, ihartenstein: 1628432, acaruso: 1627936,
  // Orlando Magic
  banchero: 1631094, fwagner: 1631011, jsuggs: 1630580,
  // Philadelphia 76ers
  embiid: 203954, pgeorge: 202331, tmaxey: 1630178,
  // Phoenix Suns
  durant: 201142, booker: 1626164, bbeal: 203078,
  // Sacramento Kings
  defox: 1628368, sabonis: 1627734, lmarkkanen: 1628374,
  // San Antonio Spurs
  wemby: 1641705, dvassell: 1630170,
  // Toronto Raptors
  sbarnes: 1630567, rjbarrett: 1629628, iquickley: 1630193,
  // Utah Jazz
  jclarkson: 203546,
  // Washington Wizards
  kuzma: 1628398,
};

function PlayerSilhouette({ teamColor }: { teamColor: string }) {
  return (
    <svg width="30" height="40" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="30" cy="11" rx="10" ry="11" fill={teamColor} opacity="0.9"/>
      <path d="M14 25 L16 22 L30 28 L44 22 L46 25 L50 52 L10 52 Z" fill={teamColor} opacity="0.9"/>
      <path d="M14 25 L5 42 L9 44 L16 32 Z" fill={teamColor} opacity="0.85"/>
      <path d="M46 25 L55 42 L51 44 L44 32 Z" fill={teamColor} opacity="0.85"/>
      <path d="M18 52 L14 76 L22 76 L28 56 Z" fill={teamColor} opacity="0.8"/>
      <path d="M42 52 L46 76 L38 76 L32 56 Z" fill={teamColor} opacity="0.8"/>
    </svg>
  );
}

function PlayerHeadshot({ player }: { player: CurrentNBAPlayer }) {
  const [failed, setFailed] = useState(false);
  const nbaId = NBA_HEADSHOT_IDS[player.id];
  if (!nbaId || failed) return <PlayerSilhouette teamColor={player.teamColor} />;
  return (
    <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
      <img
        src={`https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`}
        alt={player.name}
        className="w-full h-auto -mt-0.5"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: CurrentNBAPlayer; answer: CurrentNBAPlayer }) {
  const isCorrect = guess.id === answer.id;
  return (
    <div className={`w-full rounded-xl p-3 border ${isCorrect ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <PlayerHeadshot player={guess} />
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-[11px] shrink-0 shadow-sm" style={{ backgroundColor: guess.teamColor }}>
          {guess.jersey}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{guess.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{guess.team}</p>
        </div>
        {isCorrect && <span className="ml-auto text-green-600 text-xs font-bold shrink-0">✓ Correct!</span>}
      </div>
      <div className="grid grid-cols-10 gap-1">
        <StatCell label="PPG" value={`${guess.ppg}`} color={compareStat(guess.ppg, answer.ppg, 4)} />
        <StatCell label="RPG" value={`${guess.rpg}`} color={compareStat(guess.rpg, answer.rpg, 2)} />
        <StatCell label="APG" value={`${guess.apg}`} color={compareStat(guess.apg, answer.apg, 2)} />
        <StatCell label="SPG" value={`${guess.spg}`} color={compareStat(guess.spg, answer.spg, 0.5)} />
        <StatCell label="BPG" value={`${guess.bpg}`} color={compareStat(guess.bpg, answer.bpg, 0.5)} />
        <StatCell label="AGE" value={`${guess.age}`} color={compareAge(guess.age, answer.age)} />
        <StatCell label="HT" value={formatHeight(guess.height)} color={compareHeight(guess.height, answer.height)} />
        <StatCell label="DRAFT" value={guess.draftYear ? `'${String(guess.draftYear).slice(2)}` : "UD"} color={compareDraftYear(guess.draftYear, answer.draftYear)} />
        <StatCell label="TEAM" value={getTeamAbbr(guess.team)} color={compareTeam(guess.team, answer.team)} />
        <StatCell label="DIV" value={DIVISION_ABBR[getDivision(guess.team)] ?? "?"} color={compareDivisionFn(guess.team, answer.team)} />
      </div>
    </div>
  );
}

const MAX_GUESSES = 10;

// ── Shared Wordle game component ──────────────────────────────────────────────

function WordleGame({ players, playerNames, era }: {
  players: CurrentNBAPlayer[];
  playerNames: string[];
  era: string;
}) {
  const [shuffled] = useState(() => shuffleArray(players));
  const [answerIndex, setAnswerIndex] = useState(0);
  const [guesses, setGuesses] = useState<CurrentNBAPlayer[]>([]);
  const [guess, setGuess] = useState("");
  const [won, setWon] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState("");

  const answer = shuffled[answerIndex % shuffled.length];

  const checkGuess = useCallback(() => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;

    const guessedPlayer = players.find(
      (p) => p.name.toLowerCase() === trimmed || p.aliases.some((a) => a.toLowerCase() === trimmed)
    );

    if (!guessedPlayer) {
      setError("Player not found — try another name.");
      return;
    }

    if (guesses.some((g) => g.id === guessedPlayer.id)) {
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
    setAnswerIndex((i) => i + 1);
    setGuesses([]);
    setGuess("");
    setWon(false);
    setGaveUp(false);
    setError("");
  };

  if (won || gaveUp) {
    return (
      <div className="min-h-screen flex flex-col bg-teal-50">
        <Header era={era} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-4xl mx-auto w-full animate-fade-in">
          <div className={`w-full rounded-3xl border-2 p-8 text-center shadow-lg bg-white ${won ? "border-teal-300" : "border-red-200"}`}>
            <div className="text-6xl mb-4">{won ? "🎉" : "😬"}</div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{won ? "Correct!" : "Not quite!"}</h2>
            {won
              ? <p className="text-slate-500 mb-4">Got it in {guesses.length} guess{guesses.length !== 1 ? "es" : ""}!</p>
              : <p className="text-slate-500 mb-4">{guesses.length >= MAX_GUESSES ? "Out of guesses! The answer was:" : "The answer was:"}</p>
            }
            <div className="flex items-center gap-4 bg-teal-50 rounded-2xl p-4 mb-6 text-left">
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white text-xl shadow-md shrink-0" style={{ backgroundColor: answer.teamColor }}>
                <span className="leading-none">{answer.jersey}</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{answer.name}</p>
                <p className="text-slate-500 text-sm">{answer.team} · {formatHeight(answer.height)}</p>
                <p className="text-slate-400 text-xs mt-0.5">{answer.ppg} PPG · {answer.rpg} RPG · {answer.apg} APG</p>
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-md shadow-teal-200">
              Next Player →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Header era={era} />
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-5 animate-fade-in">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-1">
            {guesses.length === 0 ? "Start guessing" : `${guesses.length} / ${MAX_GUESSES} guesses used`}
          </p>
          <h1 className="text-3xl font-black text-slate-900">Who Am I?</h1>
          <p className="text-slate-400 text-sm mt-1">Guess a player — green = match, yellow = close</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[11px] text-slate-500 font-semibold mb-5">
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-green-500 rounded inline-block" /> Match</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-yellow-400 rounded inline-block" /> Close</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-slate-200 rounded inline-block" /> Off</span>
        </div>

        {/* Input */}
        <div className="w-full flex gap-2 mb-4">
          <PlayerAutocomplete
            players={playerNames}
            value={guess}
            onChange={(v) => { setGuess(v); setError(""); }}
            onSubmit={checkGuess}
            autoFocus
          />
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3 font-medium animate-fade-in">{error}</p>
        )}

        {/* Guess history */}
        {guesses.length > 0 && (
          <div className="w-full flex flex-col gap-2 mb-4">
            {guesses.map((g, i) => (
              <GuessRow key={i} guess={g} answer={answer} />
            ))}
          </div>
        )}

        {guesses.length === 0 && (
          <div className="w-full rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-300">
            <p className="text-4xl mb-2">❓</p>
            <p className="text-sm font-medium">Your guesses will appear here</p>
          </div>
        )}

        <button
          onClick={() => setGaveUp(true)}
          className="mt-4 py-2 px-4 bg-white hover:bg-red-50 text-slate-400 hover:text-red-400 border border-slate-200 font-bold rounded-xl transition-all text-sm"
        >
          Give Up
        </button>
      </main>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

function GuessWhoGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";

  if (era === "current") {
    return <WordleGame players={CURRENT_NBA_PLAYERS} playerNames={CURRENT_PLAYER_NAMES} era="current" />;
  }
  return <WordleGame players={ALL_TIME_GW_PLAYERS} playerNames={ALL_TIME_GW_PLAYER_NAMES} era="alltime" />;
}

export default function GuessWhoPage() {
  return (
    <Suspense>
      <GuessWhoGame />
    </Suspense>
  );
}

function Header({ era }: { era: string }) {
  return (
    <header className="border-b border-teal-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <a href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 transition-colors">
        <span className="text-lg">🏀</span>
        <span className="font-black text-sm tracking-wide">COURTSIDE CENTRAL</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current"
          ? <span className="text-xs bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">Current NBA</span>
          : <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full font-semibold">All-Time</span>
        }
        <span className="text-xs text-slate-400 uppercase tracking-widest">Guess Who</span>
      </div>
    </header>
  );
}
