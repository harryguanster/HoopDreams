import Link from "next/link";
import { TRIOS } from "@/lib/playerData";
import { GUESS_WHO_PLAYERS } from "@/lib/guessWhoData";

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
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-teal-100 border border-teal-300 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Season 2025–26
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-tight mb-4">
            Courtside
            <br />
            <span className="text-teal-500">Central</span>
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Test your NBA knowledge with fun, debate-worthy games.
            <br className="hidden sm:block" />
            Who starts, who sits, and can you guess who?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in">
          <Link
            href="/start-bench-cut"
            className="group bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-400 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">🏀</div>
              <span className="text-xs bg-teal-100 text-teal-700 border border-teal-300 px-2.5 py-1 rounded-full font-semibold">
                AVAILABLE
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                Start, Bench, Cut
              </h2>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Pick 3 NBA legends and decide — who starts, who rides the pine, and who gets waived?
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
              <span>{TRIOS.length} rounds</span>
              <span>·</span>
              <span>All eras</span>
              <span>·</span>
              <span>Opinion-based</span>
            </div>
          </Link>

          <Link
            href="/guess-who"
            className="group bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-400 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">🕵️</div>
              <span className="text-xs bg-teal-100 text-teal-700 border border-teal-300 px-2.5 py-1 rounded-full font-semibold">
                AVAILABLE
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                Guess Who
              </h2>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Clues revealed one by one. Can you name the player before running out of hints?
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
              <span>{GUESS_WHO_PLAYERS.length} players</span>
              <span>·</span>
              <span>All eras</span>
              <span>·</span>
              <span>5 clues max</span>
            </div>
          </Link>

          <div className="bg-white/50 border-2 border-slate-200 rounded-2xl p-6 flex flex-col gap-4 opacity-50">
            <div className="flex items-start justify-between">
              <div className="text-4xl grayscale">📊</div>
              <span className="text-xs bg-slate-100 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                COMING SOON
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-400">Stat Line Guesser</h2>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                See a mystery stat line and guess which player it belongs to across any era.
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-xs mt-16 text-center">
          Stats are career averages. Accolades are highlights, not exhaustive.
        </p>
      </main>
    </div>
  );
}
