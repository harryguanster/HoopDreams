import Link from "next/link";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { CURRENT_NBA_PLAYERS } from "@/lib/currentNBAPlayers";
import { STAT_LINE_PLAYERS } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";

// ── Dark game card ─────────────────────────────────────────────────────────────

function GameCard({
  href,
  tag,
  title,
  description,
  meta,
}: {
  href: string;
  tag: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col border border-zinc-800 hover:border-teal-400/60 bg-zinc-900/40 hover:bg-zinc-900/80 p-7 transition-all duration-200 overflow-hidden active:scale-[0.98]"
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"/>

      {/* Tag + play arrow */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-teal-400 text-[9px] font-bold uppercase tracking-[0.3em] border border-teal-400/30 px-2 py-0.5">
          {tag}
        </span>
        <span className="text-zinc-700 group-hover:text-teal-400 transition-colors text-xs font-black uppercase tracking-wider">
          PLAY →
        </span>
      </div>

      {/* Title */}
      <h2 className="text-white text-xl font-black uppercase tracking-tight mb-2 group-hover:text-teal-400 transition-colors leading-tight">
        {title}
      </h2>

      {/* Description */}
      <p className="text-zinc-500 text-sm leading-relaxed flex-1 mb-5">{description}</p>

      {/* Meta */}
      <p className="text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-medium border-t border-zinc-800 pt-4">
        {meta}
      </p>
    </Link>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 ${
        accent ? "bg-teal-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300"
      }`}>
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-800"/>
    </div>
  );
}

// ── Texture background component ───────────────────────────────────────────────

function DarkTextureBg() {
  return (
    <>
      {/* Grain */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="grain-home">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#grain-home)" opacity="0.07"/>
      </svg>

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.14) 1px, transparent 1px)",
        backgroundSize: "52px 52px"
      }}/>

      {/* Radial glow top-left */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(20,184,166,0.10) 0%, transparent 70%)"
      }}/>

      {/* Radial glow bottom-right */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse 50% 40% at 90% 100%, rgba(20,184,166,0.07) 0%, transparent 60%)"
      }}/>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] relative">
      <DarkTextureBg />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-zinc-900 bg-[#080808]/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="Courtside Central" className="h-14 w-auto"/>
        <span className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-semibold hidden sm:block">
          Season 2025–26
        </span>
      </header>

      <main className="relative z-10 px-4 sm:px-8 pb-20">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto pt-16 pb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 border-b border-zinc-900">
          <div>
            <p className="text-teal-400 text-[10px] font-bold uppercase tracking-[0.5em] mb-5">
              NBA Knowledge Games
            </p>
            <h1 className="text-white font-black uppercase leading-[0.88] tracking-tight">
              <span className="block text-6xl sm:text-8xl lg:text-[7rem]">KNOW</span>
              <span className="block text-6xl sm:text-8xl lg:text-[7rem] text-teal-400">THE</span>
              <span className="block text-6xl sm:text-8xl lg:text-[7rem]">GAME.</span>
            </h1>
          </div>
          <div className="sm:text-right max-w-xs">
            <img src="/logo.png" alt="" className="h-24 w-auto mb-4 opacity-20 sm:ml-auto hidden sm:block"/>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Test your NBA knowledge across all eras. Stats, legends, and today's best players.
            </p>
          </div>
        </section>

        {/* ── All-Time Legends ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto pt-14 mb-14">
          <SectionLabel>🏆 All-Time Legends</SectionLabel>
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-7">
            Jordan · Kobe · Shaq · Magic · Bird — the greatest of all time
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <GameCard
              href="/start-bench-cut?era=alltime"
              tag="Opinion"
              title="Start, Bench, Cut"
              description="Pick 3 NBA legends and decide — who starts, who rides the pine, and who gets waived?"
              meta={`${TRIOS.length} rounds · All eras · Opinion-based`}
            />
            <GameCard
              href="/guess-who?era=alltime"
              tag="Stat Puzzle"
              title="Guess Who"
              description="Decode a mystery legend using stat comparisons. Green = match, yellow = close, arrows guide you."
              meta="302 all-time players · 10 guesses"
            />
            <GameCard
              href="/stat-line-guesser?era=alltime"
              tag="Stats"
              title="Stat Line Guesser"
              description="A career stat line flashes on screen. How fast can you name the legend?"
              meta={`${STAT_LINE_PLAYERS.length} players · All eras · 5 reveals`}
            />
          </div>
        </section>

        {/* ── Current NBA ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto">
          <SectionLabel accent>⚡ Current NBA</SectionLabel>
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-7">
            Jokic · Wemby · Tatum · SGA — today's best
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <GameCard
              href="/start-bench-cut?era=current"
              tag="Opinion"
              title="Start, Bench, Cut"
              description="Today's stars face off — who starts, who sits, and who gets cut from the current crop?"
              meta={`${CURRENT_TRIOS.length} rounds · 2025–26`}
            />
            <GameCard
              href="/guess-who?era=current"
              tag="Stat Puzzle"
              title="Guess Who"
              description="Decode a current NBA player using stats. PPG, RPG, APG, team, division — piece it together."
              meta={`${CURRENT_NBA_PLAYERS.length} current players · 10 guesses`}
            />
            <GameCard
              href="/stat-line-guesser?era=current"
              tag="Stats"
              title="Stat Line Guesser"
              description="A current player's stat line appears one stat at a time. Name them before the full reveal."
              meta={`${CURRENT_STAT_LINE_PLAYERS.length} players · 2025–26`}
            />
          </div>
        </section>

        <p className="text-zinc-800 text-[10px] uppercase tracking-widest text-center mt-16">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
