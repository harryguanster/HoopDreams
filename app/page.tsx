import Link from "next/link";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { GUESS_WHO_PLAYERS } from "@/lib/guessWhoData";
import { CURRENT_GUESS_WHO_PLAYERS } from "@/lib/currentGuessWhoData";
import { STAT_LINE_PLAYERS } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";

function GameCard({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  meta: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-400 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="text-4xl">{icon}</div>
        <span className="text-xs bg-teal-100 text-teal-700 border border-teal-300 px-2.5 py-1 rounded-full font-semibold">
          PLAY
        </span>
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
          {title}
        </h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
        {meta}
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-teal-200 bg-white px-6 py-4 flex items-center gap-3 shadow-sm">
        <span className="text-2xl">🏀</span>
        <span className="font-black text-xl tracking-tight text-slate-900">
          Courtside <span className="text-teal-500">Central</span>
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-16">
        <div className="text-center max-w-2xl animate-fade-in mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-100 border border-teal-300 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Season 2025–26
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-tight mb-4">
            Courtside
            <br />
            <span className="text-teal-500">Central</span>
          </h1>
          <p className="text-slate-500 text-lg mb-0">
            Test your NBA knowledge with fun, debate-worthy games.
            <br className="hidden sm:block" />
            Pick your era and play.
          </p>
        </div>

        {/* All-Time Legends Section */}
        <section className="w-full max-w-4xl mb-14 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              🏆 All-Time Legends
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-slate-400 text-sm mb-5">Jordan, Kobe, Shaq, Magic — the greatest of all time.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard
              href="/start-bench-cut?era=alltime"
              icon="🏀"
              title="Start, Bench, Cut"
              description="Pick 3 NBA legends and decide — who starts, who rides the pine, and who gets waived?"
              meta={
                <>
                  <span>{TRIOS.length} rounds</span>
                  <span>·</span>
                  <span>All eras</span>
                  <span>·</span>
                  <span>Opinion-based</span>
                </>
              }
            />
            <GameCard
              href="/guess-who?era=alltime"
              icon="🕵️"
              title="Guess Who"
              description="Clues revealed one by one. Can you name the legend before running out of hints?"
              meta={
                <>
                  <span>{GUESS_WHO_PLAYERS.length} players</span>
                  <span>·</span>
                  <span>All eras</span>
                  <span>·</span>
                  <span>5 clues max</span>
                </>
              }
            />
            <GameCard
              href="/stat-line-guesser?era=alltime"
              icon="📊"
              title="Stat Line Guesser"
              description="See a mystery stat line and guess which legend it belongs to."
              meta={
                <>
                  <span>{STAT_LINE_PLAYERS.length} players</span>
                  <span>·</span>
                  <span>All eras</span>
                  <span>·</span>
                  <span>5 reveals max</span>
                </>
              }
            />
          </div>
        </section>

        {/* Current NBA Section */}
        <section className="w-full max-w-4xl animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-2 bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              ⚡ Current NBA
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-slate-400 text-sm mb-5">Jokic, Wemby, Tatum, SGA — today's best players.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard
              href="/start-bench-cut?era=current"
              icon="🏀"
              title="Start, Bench, Cut"
              description="Today's stars face off — who starts, who sits, and who gets cut from the current crop?"
              meta={
                <>
                  <span>{CURRENT_TRIOS.length} rounds</span>
                  <span>·</span>
                  <span>2025–26</span>
                  <span>·</span>
                  <span>Opinion-based</span>
                </>
              }
            />
            <GameCard
              href="/guess-who?era=current"
              icon="🕵️"
              title="Guess Who"
              description="Clues revealed one by one. Can you ID today's NBA stars before running out of hints?"
              meta={
                <>
                  <span>{CURRENT_GUESS_WHO_PLAYERS.length} players</span>
                  <span>·</span>
                  <span>2025–26</span>
                  <span>·</span>
                  <span>5 clues max</span>
                </>
              }
            />
            <GameCard
              href="/stat-line-guesser?era=current"
              icon="📊"
              title="Stat Line Guesser"
              description="See a mystery stat line from a current star and guess who it belongs to."
              meta={
                <>
                  <span>{CURRENT_STAT_LINE_PLAYERS.length} players</span>
                  <span>·</span>
                  <span>2025–26</span>
                  <span>·</span>
                  <span>5 reveals max</span>
                </>
              }
            />
          </div>
        </section>

        <p className="text-slate-400 text-xs mt-16 text-center">
          Stats are career averages. Accolades are highlights, not exhaustive.
        </p>
      </main>
    </div>
  );
}
