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
      className="group flex flex-col min-h-[200px] p-6 transition-colors duration-200"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{emoji}</span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1" style={{ color: "#84cc16", background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.25)" }}>
          {tag}
        </span>
      </div>
      <h2 className="font-playfair font-black italic text-white text-xl mb-2 group-hover:text-[#84cc16] transition-colors">
        {title}
      </h2>
      <p className="text-sm text-white/40 leading-relaxed flex-1 mb-5">{description}</p>
      <p className="text-[11px] text-white/25 font-mono" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>{meta}</p>
    </Link>
  );
}

export default function ChallengesPage() {
  const totalPlayers = Object.values(TEAM_ROSTERS).reduce((sum, r) => sum + r.length, 0);
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-geist-mono)" }}>
      <GameHeader title="Challenges" />
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="text-center mb-12 pt-4">
          <p className="text-xs font-mono font-bold uppercase tracking-widest mb-3" style={{ color: "#84cc16" }}>
            Timed Challenges
          </p>
          <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "-0.02em", lineHeight: 0.95 }}>
            How Much Do You Know?
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto mt-3">
            Race the clock — type as many answers as you can before time runs out.
          </p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 40 }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <ChallengeCard
            href="/challenges/draft-class"
            emoji="🎓"
            tag="12 min"
            title="Draft Class Challenge"
            description="For each NBA draft class from 2010 to 2025, name 3 players. One hint player is shown — they don't count."
            meta="16 draft classes · 3 per class · 8:00 timer"
          />
          <ChallengeCard
            href="/challenges/champions"
            emoji="🏆"
            tag="6 min"
            title="Champions by Year"
            description="Name every NBA champion from 1990 to 2024. Type a team name and all their titles fill in at once."
            meta="35 years · 13 unique champions · 6:00 timer"
          />
        </div>

        <p className="text-white/25 text-xs text-center mt-14 font-mono">
          Nicknames and abbreviations accepted · Full name always works
        </p>
      </main>
    </div>
  );
}
