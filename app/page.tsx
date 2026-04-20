import Link from "next/link";
import { TRIOS } from "@/lib/playerData";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🏀</span>
        <span className="font-black text-xl tracking-tight text-white">
          NBA <span className="text-orange-400">Trivia</span>
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Season 2025–26
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
            NBA Trivia
            <br />
            <span className="text-orange-400">Games</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Test your NBA knowledge with fun, debate-worthy games.
            <br className="hidden sm:block" />
            Who starts, who sits, and who gets cut?
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in">
          {/* Start Bench Cut — active */}
          <Link
            href="/start-bench-cut"
            className="group relative bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 hover:border-orange-500 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/10 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">🏀</div>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-600/40 px-2.5 py-1 rounded-full font-semibold">
                AVAILABLE
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-orange-300 transition-colors">
                Start, Bench, Cut
              </h2>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Pick 3 NBA legends and decide — who starts, who rides the pine, and who gets waived?
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium border-t border-gray-800 pt-4">
              <span>{TRIOS.length} rounds</span>
              <span>·</span>
              <span>All eras</span>
              <span>·</span>
              <span>Opinion-based</span>
            </div>
          </Link>

          {/* Coming soon cards */}
          <ComingSoonCard
            emoji="❓"
            title="NBA Guess Who"
            description="Clues revealed one by one. Can you name the player before running out of hints?"
          />
          <ComingSoonCard
            emoji="📊"
            title="Stat Line Guesser"
            description="See a mystery stat line and guess which player it belongs to across any era."
          />
        </div>

        {/* Footer blurb */}
        <p className="text-gray-600 text-xs mt-16 text-center">
          Stats are career averages. Accolades are highlights, not exhaustive.
        </p>
      </main>
    </div>
  );
}

function ComingSoonCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-6 flex flex-col gap-4 opacity-60">
      <div className="flex items-start justify-between">
        <div className="text-4xl grayscale">{emoji}</div>
        <span className="text-xs bg-gray-800 text-gray-500 border border-gray-700 px-2.5 py-1 rounded-full font-semibold">
          COMING SOON
        </span>
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-400">{title}</h2>
        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
