"use client";
import { useState, useMemo, useCallback } from "react";
import GameHeader from "@/app/components/GameHeader";
import {
  LEAGUE_TEAMS, simulateSeason, simulatePlayoffs, computeUserRating,
  generateDraftClass, generateFreeAgents,
  type LeagueTeam, type StandingEntry, type RosterPlayer,
  type Prospect, type FreeAgent, type PlayoffResult, type Conference,
} from "@/lib/franchiseData";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";

// ─── Salary helpers ────────────────────────────────────────────────────────────
const SALARY_CAP = 100;

const RINGER_RANKINGS: Record<string, number> = {
  jokic: 1, sga: 2, giannis: 3, luka: 4, ant: 5, wemby: 6,
  curry: 7, brunson: 8, dmitchell: 9, cade: 10,
  lebron: 11, ad: 12, durant: 13, jwilliams2: 14, mobley: 15, tatum: 16,
  jbrown: 17, booker: 18, banchero: 19, siakam: 20,
  kat: 21, kawhi: 22, harden: 23, jbutler: 24, bam: 25, defox: 26,
  trae: 27, sengun: 28, jjackson: 29, cholmgren: 30,
  sabonis: 31, tmaxey: 32, garland: 33, ja: 34, fwagner: 35, jmurray: 36,
  embiid: 37, sbarnes: 38, oganunoby: 39, haliburton: 40,
  athompson: 41, dame: 42, dbane: 43, agordon: 44, jrandle: 45, therro: 46,
  lmarkkanen: 47, lamelo: 48, jallen: 49, mikalbridg: 50,
  areaves: 51, lavine: 52, kyrie: 53, dwhite: 54, dgreen: 55, zubac: 56,
  zion: 57, jjohnson: 58, gobert: 59, mturner: 60,
  npowell: 61, ddaniels: 62, pgeorge: 63, mporter: 64, jhart: 65, acaruso: 66,
  porzingis: 67, cjohnson: 68, ihartenstein: 69, cwhite: 70,
  tmurphy: 71, jmcdaniels: 72, ldort: 73, jsuggs: 74, bingram: 75, nreid: 76,
  cbraun: 77, ppritchard: 78, giddey: 79, bmiller: 80,
  holiday: 81, anembhard: 82, cflagg: 83, rjbarrett: 84, dehunter: 85, anesmith: 86,
  vucevic: 87, cjmcc: 88, tcamara: 89, dlively: 90,
  jgreen2: 91, asimons: 92, tharris: 93, dvassell: 94, kthompson: 95, jsmith: 96,
};

const RANK_TIERS = [
  { max: 6,   price: 28 }, { max: 16,  price: 20 }, { max: 26, price: 15 },
  { max: 36,  price: 11 }, { max: 46,  price:  8 }, { max: 56, price:  6 },
  { max: 66,  price:  5 }, { max: 76,  price:  4 }, { max: 86, price:  3 },
  { max: 96,  price:  2 }, { max: 100, price:  2 }, { max: Infinity, price: 1 },
];

function playerSalary(p: CurrentNBAPlayer): number {
  const rank = RINGER_RANKINGS[p.id] ?? 999;
  return RANK_TIERS.find(t => rank <= t.max)!.price;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Phase =
  | "setup"        // pick team
  | "build"        // build roster
  | "simulating"   // season in progress (visual)
  | "standings"    // show standings
  | "playoffs"     // playoff bracket + results
  | "champion"     // won the title
  | "eliminated"   // lost in playoffs
  | "offseason";   // draft + FA between seasons

type SlotEntry = {
  player: CurrentNBAPlayer | RosterPlayer;
  minutes: number;
  isNBA: boolean; // true = CurrentNBAPlayer, false = prospect/FA signed
};

// ─── Mini helpers ─────────────────────────────────────────────────────────────
function fmt1(n: number) { return n.toFixed(1); }
function fmtRecord(w: number, l: number) { return `${w}–${l}`; }

function getSeedEmoji(seed: number) {
  if (seed === 1) return "🥇";
  if (seed <= 3) return "🌟";
  if (seed <= 6) return "✅";
  if (seed <= 8) return "⚠️";
  return "❌";
}

function confStandings(all: StandingEntry[], conf: Conference) {
  return all.filter(e => e.conf === conf).sort((a, b) => b.wins - a.wins);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TeamPill({ abbr, color, name, isUser }: { abbr: string; color: string; name: string; isUser?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: isUser ? "rgba(132,204,22,0.18)" : "rgba(0,0,0,0.06)",
        border: isUser ? "1px solid #84cc16" : "1px solid rgba(0,0,0,0.1)",
        borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 700,
        color: isUser ? "#3a5a00" : "#374151",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {abbr}
    </span>
  );
}

function StandingsTable({ entries, userAbbr }: { entries: StandingEntry[]; userAbbr: string }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 52px 52px", gap: 0, background: "#f8f8f6", borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "6px 12px" }}>
        {["#","Team","W","L"].map(h => (
          <span key={h} style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>
      {entries.map((e, i) => {
        const isUser = e.abbr === userAbbr;
        const inPlayoffs = i < 8;
        return (
          <div
            key={e.abbr}
            style={{
              display: "grid", gridTemplateColumns: "28px 1fr 52px 52px",
              gap: 0, padding: "7px 12px", alignItems: "center",
              background: isUser ? "rgba(132,204,22,0.10)" : i % 2 === 0 ? "white" : "#fafaf8",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              borderLeft: isUser ? "3px solid #84cc16" : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: inPlayoffs ? "#374151" : "#9ca3af" }}>{i + 1}</span>
            <span style={{ fontSize: 12, fontWeight: isUser ? 800 : 600, color: isUser ? "#1a3a00" : "#374151", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, display: "inline-block", flexShrink: 0 }} />
              {e.abbr}
              {!inPlayoffs && <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 400 }}>lottery</span>}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{e.wins}</span>
            <span style={{ fontSize: 12, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{e.losses}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function FranchisePage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [season, setSeason] = useState(1);
  const [chosenTeam, setChosenTeam] = useState<LeagueTeam | null>(null);
  const [roster, setRoster] = useState<SlotEntry[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [standingsData, setStandingsData] = useState<{ east: StandingEntry[]; west: StandingEntry[] } | null>(null);
  const [playoffResults, setPlayoffResults] = useState<PlayoffResult | null>(null);
  const [champion, setChampion] = useState<StandingEntry | null>(null);
  const [draftClass, setDraftClass] = useState<Prospect[]>([]);
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([]);
  const [offMsg, setOffMsg] = useState("");
  const [totalWins, setTotalWins] = useState(0);
  const [titles, setTitles] = useState(0);
  const [confTeam, setConfTeam] = useState<"East" | "West">("East");

  // ── Salary math ──
  const usedSalary = roster.reduce((s, e) => s + (e.isNBA ? playerSalary(e.player as CurrentNBAPlayer) : (e.player as RosterPlayer).salary), 0);
  const capLeft = SALARY_CAP - usedSalary;

  // ── Rating ──
  const userRating = useMemo(() => {
    const rp: RosterPlayer[] = roster.map(e => {
      const p = e.player as CurrentNBAPlayer;
      return {
        name: p.name,
        ppg: e.isNBA ? (p.ppg ?? 12) : (p as unknown as RosterPlayer).ppg,
        rpg: e.isNBA ? (p.rpg ?? 5) : (p as unknown as RosterPlayer).rpg,
        apg: e.isNBA ? (p.apg ?? 3) : (p as unknown as RosterPlayer).apg,
        salary: e.isNBA ? playerSalary(p) : (p as unknown as RosterPlayer).salary,
        minutes: e.minutes,
      };
    });
    return computeUserRating(rp);
  }, [roster]);

  // ── Player search results ──
  const searchResults = useMemo(() => {
    if (playerSearch.length < 2) return [];
    const q = playerSearch.toLowerCase();
    return CURRENT_NBA_PLAYERS
      .filter(p => p.name.toLowerCase().includes(q) && !roster.some(r => (r.player as CurrentNBAPlayer).id === p.id))
      .slice(0, 8);
  }, [playerSearch, roster]);

  // ── Add player ──
  function addPlayer(p: CurrentNBAPlayer) {
    const sal = playerSalary(p);
    if (capLeft < sal) return;
    setRoster(prev => [...prev, { player: p, minutes: 20, isNBA: true }]);
    setPlayerSearch("");
  }

  function removePlayer(idx: number) {
    setRoster(prev => prev.filter((_, i) => i !== idx));
  }

  function setMins(idx: number, mins: number) {
    setRoster(prev => prev.map((e, i) => i === idx ? { ...e, minutes: mins } : e));
  }

  // ── Sign free agent ──
  function signFA(fa: FreeAgent) {
    if (capLeft < fa.salary || roster.length >= 15) return;
    const rp: RosterPlayer = { name: fa.name, ppg: fa.ppg, rpg: fa.rpg, apg: fa.apg, salary: fa.salary, minutes: 20 };
    setRoster(prev => [...prev, { player: rp as unknown as CurrentNBAPlayer, minutes: 20, isNBA: false }]);
    setFreeAgents(prev => prev.filter(f => f.name !== fa.name));
  }

  // ── Draft prospect ──
  function draftProspect(p: Prospect) {
    if (roster.length >= 15) return;
    const rp: RosterPlayer = { name: p.name, ppg: p.ppg, rpg: p.rpg, apg: p.apg, salary: p.salary, minutes: 15 };
    setRoster(prev => [...prev, { player: rp as unknown as CurrentNBAPlayer, minutes: 15, isNBA: false }]);
    setDraftClass(prev => prev.filter(d => d.name !== p.name));
  }

  // ── Simulate season ──
  const runSeason = useCallback(() => {
    if (!chosenTeam) return;
    setPhase("simulating");
    setTimeout(() => {
      const result = simulateSeason(
        userRating,
        chosenTeam.name,
        chosenTeam.abbr,
        chosenTeam.conf,
        chosenTeam.color,
      );
      const allEntries = [...result.east, ...result.west];
      const userEntry = allEntries.find(e => e.isUser)!;
      setTotalWins(w => w + userEntry.wins);
      setStandingsData(result);
      setPhase("standings");
    }, 1800);
  }, [chosenTeam, userRating]);

  // ── Run playoffs ──
  function runPlayoffs() {
    if (!standingsData || !chosenTeam) return;
    const { results, champion: champ } = simulatePlayoffs(standingsData.east, standingsData.west);
    setPlayoffResults(results);
    setChampion(champ);

    const userInPost = [...standingsData.east, ...standingsData.west]
      .filter(e => e.conf === chosenTeam.conf)
      .slice(0, 8)
      .some(e => e.isUser);

    if (!userInPost) {
      setPhase("eliminated");
      return;
    }

    setPhase("playoffs");
  }

  // ── Advance to offseason ──
  function goOffseason() {
    const won = champion?.abbr === chosenTeam?.abbr;
    if (won) setTitles(t => t + 1);
    setDraftClass(generateDraftClass(2025 + season));
    setFreeAgents(generateFreeAgents(season));
    setOffMsg(won ? "🏆 Champions! Use the offseason to reload." : "Better luck next season. Reload your roster.");
    setSeason(s => s + 1);
    setStandingsData(null);
    setPlayoffResults(null);
    setChampion(null);
    setPhase("offseason");
  }

  // ── Find user seed ──
  function userSeed(): number | null {
    if (!standingsData || !chosenTeam) return null;
    const conf = chosenTeam.conf === "East" ? standingsData.east : standingsData.west;
    const idx = conf.findIndex(e => e.isUser);
    return idx >= 0 ? idx + 1 : null;
  }

  // ── User playoff fate ──
  function userPlayoffOutcome(): { round: string; won: boolean } | null {
    if (!playoffResults || !chosenTeam) return null;
    for (const r of [...playoffResults].reverse()) {
      for (const s of r.series) {
        if (s.winner.abbr === chosenTeam.abbr) return { round: r.round, won: true };
        if (s.loser.abbr === chosenTeam.abbr) return { round: r.round, won: false };
      }
    }
    return null;
  }

  // ════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Franchise Mode" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* ── Season indicator ─────────────────────────── */}
        {phase !== "setup" && chosenTeam && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 16px", background: "white", borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: chosenTeam.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.08em", color: "#111827" }}>
              {chosenTeam.name}
            </span>
            <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: "auto" }}>
              Season {season} · {titles > 0 ? `${titles} Title${titles > 1 ? "s" : ""}` : "0 Titles"} · {totalWins} Career Wins
            </span>
          </div>
        )}

        {/* ════════ SETUP ════════ */}
        {phase === "setup" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,6vw,48px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>
                Franchise Mode
              </p>
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                Pick a team, build your roster, and simulate seasons. Can you win a championship?
              </p>
            </div>

            {/* Conference tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["East","West"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setConfTeam(c)}
                  style={{
                    padding: "6px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    background: confTeam === c ? "#84cc16" : "white",
                    color: confTeam === c ? "#111827" : "#6b7280",
                    border: confTeam === c ? "1.5px solid #65a30d" : "1.5px solid #e5e7eb",
                  }}
                >{c}ern Conference</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {LEAGUE_TEAMS.filter(t => t.conf === confTeam).map(t => (
                <button
                  key={t.abbr}
                  onClick={() => { setChosenTeam(t); setPhase("build"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    background: "white", border: "1.5px solid #e5e7eb",
                    textAlign: "left", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#84cc16")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>Rating {t.rating}</p>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                    background: t.rating >= 85 ? "#fef3c7" : t.rating >= 75 ? "#dcfce7" : "#f3f4f6",
                    color: t.rating >= 85 ? "#92400e" : t.rating >= 75 ? "#14532d" : "#6b7280",
                    border: t.rating >= 85 ? "1px solid #f59e0b" : t.rating >= 75 ? "1px solid #4ade80" : "1px solid #e5e7eb",
                  }}>
                    {t.rating >= 85 ? "Elite" : t.rating >= 75 ? "Good" : "Rebuild"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════ BUILD ROSTER ════════ */}
        {phase === "build" && chosenTeam && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(24px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>
                Build Your Roster
              </p>
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>Search for players · Stay under the $100M cap · Min 5 players to simulate</p>
            </div>

            {/* Cap bar */}
            <div style={{ background: "white", borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: "1px solid rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>Salary Cap</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: capLeft < 10 ? "#ef4444" : "#374151" }}>
                  ${usedSalary}M / $100M · ${capLeft}M left
                </span>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", background: capLeft < 10 ? "#ef4444" : "#84cc16", width: `${(usedSalary / SALARY_CAP) * 100}%`, borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{roster.length} players</span>
                <span style={{ fontSize: 10, color: "#65a30d", fontWeight: 700 }}>Team Rating: {userRating.toFixed(0)}</span>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                placeholder="Search players by name…"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  border: "2px solid #e5e7eb", outline: "none", background: "white",
                  color: "#111827", boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#84cc16")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              {searchResults.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: "white", border: "1.5px solid #84cc16", borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", marginTop: 4,
                }}>
                  {searchResults.map(p => {
                    const sal = playerSalary(p);
                    const canAfford = capLeft >= sal;
                    return (
                      <button
                        key={p.id}
                        onClick={() => canAfford && addPlayer(p)}
                        disabled={!canAfford}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%",
                          padding: "9px 14px", background: "transparent", border: "none",
                          cursor: canAfford ? "pointer" : "not-allowed",
                          borderBottom: "1px solid #f3f4f6", textAlign: "left",
                          opacity: canAfford ? 1 : 0.45,
                        }}
                        onMouseEnter={e => canAfford && (e.currentTarget.style.background = "#f0fdf4")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</p>
                          <p style={{ fontSize: 10, color: "#9ca3af" }}>{p.position} · {p.team} · {p.ppg}p {p.rpg}r {p.apg}a</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: canAfford ? "#65a30d" : "#ef4444", flexShrink: 0 }}>${sal}M</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Roster list */}
            {roster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13 }}>
                Your roster is empty — search for players above
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {roster.map((entry, i) => {
                  const p = entry.player as CurrentNBAPlayer;
                  const sal = entry.isNBA ? playerSalary(p) : (entry.player as unknown as RosterPlayer).salary;
                  const ppg = entry.isNBA ? (p.ppg ?? 12) : (entry.player as unknown as RosterPlayer).ppg;
                  const rpg = entry.isNBA ? (p.rpg ?? 5) : (entry.player as unknown as RosterPlayer).rpg;
                  const apg = entry.isNBA ? (p.apg ?? 3) : (entry.player as unknown as RosterPlayer).apg;
                  return (
                    <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af" }}>
                          {fmt1(ppg)}p {fmt1(rpg)}r {fmt1(apg)}a · ${sal}M
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>Min:</span>
                        <input
                          type="number" min={5} max={48} value={entry.minutes}
                          onChange={e => setMins(i, Math.min(48, Math.max(5, parseInt(e.target.value) || 5)))}
                          style={{ width: 44, padding: "3px 6px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700, textAlign: "center", color: "#374151" }}
                        />
                      </div>
                      <button
                        onClick={() => removePlayer(i)}
                        style={{ width: 24, height: 24, borderRadius: 6, background: "#fee2e2", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={runSeason}
              disabled={roster.length < 5}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, fontWeight: 800, fontSize: 15,
                background: roster.length >= 5 ? "#84cc16" : "#e5e7eb",
                color: roster.length >= 5 ? "#111827" : "#9ca3af",
                border: "none", cursor: roster.length >= 5 ? "pointer" : "not-allowed",
                fontFamily: "var(--font-bebas)", letterSpacing: "0.12em",
              }}
            >
              {roster.length < 5 ? `Add ${5 - roster.length} more player${5 - roster.length !== 1 ? "s" : ""} to simulate` : "Simulate Season →"}
            </button>
          </div>
        )}

        {/* ════════ SIMULATING ════════ */}
        {phase === "simulating" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(132,204,22,0.1)", border: "3px solid #84cc16", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1.2s linear infinite" }} >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="14" cy="14" r="11" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.1em", color: "#111827" }}>Simulating Season {season}</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Running 82 games…</p>
          </div>
        )}

        {/* ════════ STANDINGS ════════ */}
        {phase === "standings" && standingsData && chosenTeam && (
          <div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,38px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>
                Season {season} Standings
              </p>
              {userSeed() !== null && (
                <span style={{ fontSize: 13, color: "#65a30d", fontWeight: 700 }}>
                  {getSeedEmoji(userSeed()!)} Seed #{userSeed()}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Eastern Conference</p>
                <StandingsTable entries={standingsData.east} userAbbr={chosenTeam.abbr} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Western Conference</p>
                <StandingsTable entries={standingsData.west} userAbbr={chosenTeam.abbr} />
              </div>
            </div>

            {(() => {
              const seed = userSeed();
              const madePlayoffs = seed !== null && seed <= 8;
              return (
                <div style={{ background: madePlayoffs ? "rgba(132,204,22,0.08)" : "rgba(239,68,68,0.06)", border: madePlayoffs ? "1px solid rgba(132,204,22,0.3)" : "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, color: madePlayoffs ? "#1a3a00" : "#7f1d1d", marginBottom: 4 }}>
                    {madePlayoffs ? `✅ Playoff bound — Seed #${seed}` : "❌ Missed the playoffs (lottery pick incoming)"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    {madePlayoffs ? "Run the playoffs to see how far you go" : "Head to offseason to rebuild"}
                  </p>
                </div>
              );
            })()}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={runPlayoffs}
                style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}
              >
                Run Playoffs →
              </button>
              <button
                onClick={goOffseason}
                style={{ padding: "13px 20px", borderRadius: 12, background: "white", color: "#6b7280", fontWeight: 700, fontSize: 13, border: "1.5px solid #e5e7eb", cursor: "pointer" }}
              >
                Skip to Offseason
              </button>
            </div>
          </div>
        )}

        {/* ════════ PLAYOFFS ════════ */}
        {phase === "playoffs" && playoffResults && chosenTeam && (
          <div>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,38px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1, marginBottom: 20 }}>
              Playoff Results
            </p>

            {playoffResults.map(r => (
              <div key={r.round} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{r.round}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {r.series.map((s, i) => {
                    const userInvolved = s.winner.abbr === chosenTeam.abbr || s.loser.abbr === chosenTeam.abbr;
                    const userWon = s.winner.abbr === chosenTeam.abbr;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 14px", borderRadius: 10,
                          background: userInvolved ? (userWon ? "rgba(132,204,22,0.1)" : "rgba(239,68,68,0.06)") : "white",
                          border: userInvolved ? (userWon ? "1px solid rgba(132,204,22,0.35)" : "1px solid rgba(239,68,68,0.25)") : "1px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        <TeamPill abbr={s.winner.abbr} color={s.winner.color} name={s.winner.name} isUser={s.winner.isUser} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#374151" }}>{s.winsW}–{s.winsL}</span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>def.</span>
                        <TeamPill abbr={s.loser.abbr} color={s.loser.color} name={s.loser.name} isUser={s.loser.isUser} />
                        <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>G{s.games}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* User outcome */}
            {(() => {
              const outcome = userPlayoffOutcome();
              const isChamp = champion?.abbr === chosenTeam.abbr;
              return (
                <div style={{
                  marginTop: 8, padding: "20px 20px", borderRadius: 14, textAlign: "center",
                  background: isChamp ? "rgba(132,204,22,0.12)" : "rgba(239,68,68,0.06)",
                  border: isChamp ? "1.5px solid rgba(132,204,22,0.4)" : "1.5px solid rgba(239,68,68,0.2)",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{isChamp ? "🏆" : "💔"}</div>
                  <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#111827" }}>
                    {isChamp ? "NBA Champions!" : `Eliminated in the ${outcome?.round ?? "Playoffs"}`}
                  </p>
                  {champion && !isChamp && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {champion.name} won the title
                    </p>
                  )}
                  <button
                    onClick={goOffseason}
                    style={{ marginTop: 16, padding: "11px 28px", borderRadius: 10, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}
                  >
                    Go to Offseason →
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ════════ ELIMINATED (missed playoffs) ════════ */}
        {phase === "eliminated" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😤</div>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.1em", color: "#111827" }}>Missed the Playoffs</p>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 8, marginBottom: 4 }}>
              {champion?.name} won the title this year.
            </p>
            <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 24 }}>Head to the offseason and reload your roster.</p>
            <button
              onClick={goOffseason}
              style={{ padding: "12px 28px", borderRadius: 10, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}
            >
              Offseason →
            </button>
          </div>
        )}

        {/* ════════ CHAMPION ════════ */}
        {phase === "champion" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.1em", color: "#111827" }}>NBA Champions!</p>
            <button
              onClick={goOffseason}
              style={{ marginTop: 24, padding: "12px 28px", borderRadius: 10, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}
            >
              Next Season →
            </button>
          </div>
        )}

        {/* ════════ OFFSEASON ════════ */}
        {phase === "offseason" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,38px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>
                Offseason · Season {season}
              </p>
              {offMsg && (
                <div style={{ marginTop: 10, padding: "10px 16px", borderRadius: 10, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.3)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a3a00" }}>{offMsg}</p>
                </div>
              )}
            </div>

            {/* Current roster */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Current Roster ({roster.length}) · ${usedSalary}M / $100M
              </p>
              {roster.map((entry, i) => {
                const p = entry.player as CurrentNBAPlayer;
                const sal = entry.isNBA ? playerSalary(p) : (entry.player as unknown as RosterPlayer).salary;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 6 }}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>${sal}M</span>
                    <button onClick={() => removePlayer(i)} style={{ width: 22, height: 22, borderRadius: 5, background: "#fee2e2", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: 900, fontSize: 12 }}>×</button>
                  </div>
                );
              })}
            </div>

            {/* Draft Class */}
            {draftClass.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Draft Class · {2024 + season}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {draftClass.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af" }}>{p.pos} · Age {p.age} · {fmt1(p.ppg)}p {fmt1(p.rpg)}r</p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                        background: p.potential === "Star" ? "#fef3c7" : p.potential === "Starter" ? "#dcfce7" : p.potential === "Rotation" ? "#ede9fe" : "#f1f5f9",
                        color: p.potential === "Star" ? "#92400e" : p.potential === "Starter" ? "#14532d" : p.potential === "Rotation" ? "#4c1d95" : "#6b7280",
                        border: p.potential === "Star" ? "1px solid #f59e0b" : "1px solid rgba(0,0,0,0.1)",
                      }}>{p.potential}</span>
                      <button
                        onClick={() => draftProspect(p)}
                        disabled={roster.length >= 15}
                        style={{ padding: "5px 12px", borderRadius: 7, background: roster.length < 15 ? "#84cc16" : "#e5e7eb", color: roster.length < 15 ? "#111827" : "#9ca3af", border: "none", cursor: roster.length < 15 ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11 }}
                      >
                        Draft · ${p.salary}M
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free Agents */}
            {freeAgents.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Free Agents
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {freeAgents.map((fa, i) => {
                    const canAfford = capLeft >= fa.salary && roster.length < 15;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.08)", opacity: canAfford ? 1 : 0.5 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{fa.name}</p>
                          <p style={{ fontSize: 10, color: "#9ca3af" }}>{fa.pos} · Age {fa.age} · {fmt1(fa.ppg)}p {fmt1(fa.rpg)}r</p>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                          background: fa.tier === "Max" ? "#fef3c7" : fa.tier === "Mid" ? "#dcfce7" : "#f1f5f9",
                          color: fa.tier === "Max" ? "#92400e" : fa.tier === "Mid" ? "#14532d" : "#6b7280",
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}>{fa.tier}</span>
                        <button
                          onClick={() => signFA(fa)}
                          disabled={!canAfford}
                          style={{ padding: "5px 12px", borderRadius: 7, background: canAfford ? "#84cc16" : "#e5e7eb", color: canAfford ? "#111827" : "#9ca3af", border: "none", cursor: canAfford ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11 }}
                        >
                          Sign · ${fa.salary}M
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setPhase("build")}
              style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}
            >
              Finalize Roster → Simulate Season {season} →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
