import Link from "next/link";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { CURRENT_NBA_PLAYERS } from "@/lib/currentNBAPlayers";
import { STAT_LINE_PLAYERS } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";

function GameCard({
  href, emoji, title, description, meta, tag, playerId,
}: {
  href: string; emoji: string; title: string;
  description: string; meta: string; tag: string; playerId?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-3xl p-7 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.98] overflow-hidden min-h-[220px]"
    >
      {playerId && (
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`}
          alt=""
          aria-hidden="true"
          className="absolute -right-4 -bottom-2 h-[75%] w-auto object-contain pointer-events-none select-none opacity-[0.10]"
        />
      )}
      <div className="flex items-start justify-between mb-4 relative">
        <span className="text-2xl">{emoji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
          {tag}
        </span>
      </div>
      <h2 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-teal-600 transition-colors relative">
        {title}
      </h2>
      <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-5 relative">{description}</p>
      <p className="text-[11px] text-zinc-400 font-medium border-t border-zinc-100 pt-3 relative">
        {meta}
      </p>
    </Link>
  );
}

function SectionHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-zinc-900">{label}</h2>
      <p className="text-sm text-zinc-400 mt-0.5">{sub}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Courtside Central" className="h-11 w-auto" />
          <span className="font-bold text-zinc-900 text-base tracking-tight">Courtside Central</span>
        </div>
        <span className="text-xs text-zinc-400 hidden sm:block">Season 2025–26</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <img src="/logo.svg" alt="" aria-hidden="true" className="w-20 h-20 mx-auto mb-5" />
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-3">
            NBA Knowledge Games
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-3">
            Test Your Game IQ
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Stats, legends, and today's stars — across all eras.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-200 mb-10"/>

        {/* All-Time section */}
        <section className="mb-12">
          <SectionHeading
            label="🏆 All-Time Legends"
            sub="Jordan · Kobe · Shaq · Magic · Bird"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <GameCard
              href="/start-bench-cut?era=alltime"
              emoji="⭐"
              tag="Opinion"
              title="Start, Bench, Cut"
              description="Three NBA legends — who starts, who rides the pine, and who gets waived?"
              meta={`${TRIOS.length} rounds · All eras`}
              playerId={977}
            />
            <GameCard
              href="/guess-who?era=alltime"
              emoji="🔍"
              tag="Puzzle"
              title="Guess Who"
              description="Decode a mystery legend from stat clues. Green = match, yellow = close."
              meta="302 players · 10 guesses"
              playerId={893}
            />
            <GameCard
              href="/stat-line-guesser?era=alltime"
              emoji="📊"
              tag="Stats"
              title="Stat Line Guesser"
              description="A career stat line reveals one clue at a time. Name the player first."
              meta={`${STAT_LINE_PLAYERS.length} players · 5 reveals`}
              playerId={2544}
            />
          </div>
        </section>

        {/* Current section */}
        <section>
          <SectionHeading
            label="⚡ Current NBA"
            sub="Jokic · Wemby · Tatum · SGA"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <GameCard
              href="/start-bench-cut?era=current"
              emoji="⭐"
              tag="Opinion"
              title="Start, Bench, Cut"
              description="Today's stars face off — who starts, who sits, and who gets cut?"
              meta={`${CURRENT_TRIOS.length} rounds · 2025–26`}
              playerId={203507}
            />
            <GameCard
              href="/guess-who?era=current"
              emoji="🔍"
              tag="Puzzle"
              title="Guess Who"
              description="Identify a current NBA player from stats — PPG, team, division, and more."
              meta={`${CURRENT_NBA_PLAYERS.length} players · 10 guesses`}
              playerId={201939}
            />
            <GameCard
              href="/stat-line-guesser?era=current"
              emoji="📊"
              tag="Stats"
              title="Stat Line Guesser"
              description="Current player stats, revealed one at a time. How fast can you name them?"
              meta={`${CURRENT_STAT_LINE_PLAYERS.length} players · 2025–26`}
              playerId={1629029}
            />
          </div>
        </section>

        <p className="text-zinc-400 text-xs text-center mt-14">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
