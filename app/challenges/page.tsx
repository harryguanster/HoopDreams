import Link from "next/link";
import GameHeader from "@/app/components/GameHeader";
import { NBA_TEAMS, TEAM_ROSTERS } from "@/lib/challengeData";

function ChallengeCard({
  href, emoji, title, description, meta, tag,
}: {
  href: string; emoji: string; title: string;
  description: string; meta: string; tag: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-3xl p-7 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 active:scale-[0.98] min-h-[200px]"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{emoji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
          {tag}
        </span>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-teal-600 transition-colors">
        {title}
      </h2>
      <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-5">{description}</p>
      <p className="text-[11px] text-zinc-400 font-medium border-t border-zinc-100 pt-3">{meta}</p>
    </Link>
  );
}

export default function ChallengesPage() {
  const totalPlayers = Object.values(TEAM_ROSTERS).reduce((sum, r) => sum + r.length, 0);
  return (
    <div className="min-h-screen">
      <GameHeader title="Challenges" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="text-center mb-12 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-3">
            Listing Challenges
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-3">
            How Much Do You Know?
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Race the clock — type as many answers as you can before time runs out.
          </p>
        </div>

        <div className="h-px bg-zinc-200 mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ChallengeCard
            href="/challenges/name-teams"
            emoji="🏟️"
            tag="5 min"
            title="Name All NBA Teams"
            description="Can you name all 30 current NBA franchises before time runs out? Type the city or nickname."
            meta={`${NBA_TEAMS.length} teams · 5:00 timer`}
          />
          <ChallengeCard
            href="/challenges/name-players"
            emoji="👕"
            tag="10 min"
            title="Name the Starters"
            description="For each of the 30 NBA teams, name the 5 current starters plus 1 bench player. Skip teams you're stuck on."
            meta={`30 teams · 6 players per team · 10:00 timer`}
          />
        </div>

        <p className="text-zinc-400 text-xs text-center mt-14">
          Nicknames and abbreviations accepted · Full name always works
        </p>
      </main>
    </div>
  );
}
