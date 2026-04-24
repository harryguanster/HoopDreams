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
      className="group relative bg-white rounded-3xl border border-amber-100 p-7 flex flex-col hover:shadow-xl hover:border-amber-200 transition-all duration-200 active:scale-[0.98] overflow-hidden min-h-[220px]"
    >
      {/* Semi-transparent player image */}
      {playerId && (
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`}
          alt=""
          aria-hidden="true"
          className="absolute -right-4 -bottom-2 h-[75%] w-auto object-contain pointer-events-none select-none opacity-[0.13]"
        />
      )}

      <div className="flex items-start justify-between mb-4 relative">
        <span className="text-2xl">{emoji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          {tag}
        </span>
      </div>
      <h2 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors relative">
        {title}
      </h2>
      <p className="text-sm text-stone-500 leading-relaxed flex-1 mb-5 relative">{description}</p>
      <p className="text-[11px] text-stone-400 font-medium border-t border-amber-50 pt-3 relative">
        {meta}
      </p>
    </Link>
  );
}

function SectionHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-stone-900">{label}</h2>
      <p className="text-sm text-stone-400 mt-0.5">{sub}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdf6ec]">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 z-50"/>

      {/* Header */}
      <header className="bg-[#fffdf8] border-b border-amber-100 px-6 py-4 flex items-center justify-between sticky top-1 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
            <span className="text-base">🏀</span>
          </div>
          <span className="font-bold text-stone-900 text-base tracking-tight">Courtside Central</span>
        </div>
        <span className="text-xs text-stone-400 hidden sm:block">Season 2025–26</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">
            NBA Knowledge Games
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-3">
            Test Your Game IQ
          </h1>
          <p className="text-stone-500 text-base max-w-md mx-auto">
            Stats, legends, and today's stars — across all eras.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-amber-100 mb-10"/>

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

        <p className="text-stone-400 text-xs text-center mt-14">
          Stats are career averages · Accolades are highlights, not exhaustive
        </p>
      </main>
    </div>
  );
}
