"use client";
import { motion } from "framer-motion";

// All images: Wikipedia Commons, freely licensed (see credit strings)
const IMGS = {
  // All-time legends
  lebron2016:  "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",
  lebronSteph: "https://upload.wikimedia.org/wikipedia/commons/5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg",
  jordan97:    "https://upload.wikimedia.org/wikipedia/commons/4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg",
  kobe81:      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kobe_Bryant_81.jpg",
  dreamTeam:   "https://upload.wikimedia.org/wikipedia/commons/a/a0/Dream_Team_at_the_1992_Summer_Olympics.JPEG",
  rayAllen:    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ray_Allen_Heat.jpg",
  // Current era
  curry:       "https://upload.wikimedia.org/wikipedia/commons/b/b6/Stephen_Curry_shooting.jpg",
  jokic:       "https://upload.wikimedia.org/wikipedia/commons/6/6b/Nikola_Jokic_%2840980299891%29.jpg",
  luka:        "https://upload.wikimedia.org/wikipedia/commons/7/73/Luka_Doncic_%28cropped%29.jpg",
  wemby:       "https://upload.wikimedia.org/wikipedia/commons/2/21/Victor_Wembanyama_San_Antonio_Spurs_2025_NBA_Cup.jpg",
};

interface SceneProps {
  img: string;
  sub: string;
  label: string;
  credit: string;
  pos?: string;
  filter?: string;
  accentColor?: string;
}

function MomentScene({ img, sub, label, credit, pos = "center center", filter, accentColor }: SceneProps) {
  const subColor = accentColor ?? "rgba(45,212,191,0.92)";
  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "4/3" }}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ken Burns slow zoom */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: pos,
          filter: filter ?? "none",
        }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dark vignette gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.28) 52%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 select-none">
        <p
          style={{
            color: subColor,
            fontSize: "9px",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {sub}
        </p>
        <p style={{ color: "white", fontWeight: 800, fontSize: "13px", lineHeight: 1.3 }}>
          {label}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "8.5px",
            fontFamily: "monospace",
            marginTop: 4,
          }}
        >
          {credit}
        </p>
      </div>
    </motion.div>
  );
}

// ── Scenes ────────────────────────────────────────────────────────────────────

export function SBCScene({ era = "alltime", accentColor }: { era?: string; accentColor?: string }) {
  if (era === "current") {
    return (
      <MomentScene
        img={IMGS.wemby}
        sub="2025–26 Season · Spurs"
        label="Victor Wembanyama — The Future Is Now"
        credit="Photo: Daiei Onoguchi · CC BY 4.0"
        pos="center 20%"
        accentColor={accentColor}
      />
    );
  }
  return (
    <MomentScene
      img={IMGS.lebron2016}
      sub="2016 NBA Finals · Game 7"
      label="LeBron's Chase-Down Block on Iguodala"
      credit="Photo: Erik Drost · CC BY 2.0"
      pos="center 30%"
      accentColor={accentColor}
    />
  );
}

export function GuessWhoScene({ era = "alltime", accentColor }: { era?: string; accentColor?: string }) {
  if (era === "current") {
    return (
      <MomentScene
        img={IMGS.jokic}
        sub="Guess the Star"
        label="Who Is This Current NBA Star?"
        credit="Photo: Keith Allison · CC BY-SA 2.0"
        filter="grayscale(75%) brightness(0.7) contrast(1.1)"
        accentColor={accentColor}
      />
    );
  }
  return (
    <MomentScene
      img={IMGS.jordan97}
      sub="Guess the Legend"
      label="Who Is This NBA Icon?"
      credit="Photo: Steve Lipofsky · CC BY-SA 3.0"
      filter="grayscale(75%) brightness(0.7) contrast(1.1)"
      accentColor={accentColor}
    />
  );
}

export function StatLineScene({ era = "alltime", accentColor }: { era?: string; accentColor?: string }) {
  if (era === "current") {
    return (
      <MomentScene
        img={IMGS.curry}
        sub="Golden State Warriors"
        label="Stephen Curry — Greatest Shooter Ever"
        credit="via Wikimedia Commons · CC BY-SA 2.0"
        pos="center 25%"
        accentColor={accentColor}
      />
    );
  }
  return (
    <MomentScene
      img={IMGS.kobe81}
      sub="Jan 22 2006 · Staples Center"
      label="Kobe Bryant — 81 Points"
      credit="Photo: endlessbender · CC BY 2.0"
      pos="center 25%"
      accentColor={accentColor}
    />
  );
}

export function LineupScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.dreamTeam}
      sub="1992 Barcelona Olympics"
      label="The Dream Team — Greatest Lineup Ever"
      credit="Photo: Ken Hackman, U.S. Air Force · Public Domain"
      pos="center 20%"
      accentColor={accentColor}
    />
  );
}

export function TimedTeamsScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.rayAllen}
      sub="Race the Clock · 30 Teams"
      label="Ray Allen — Miami Heat"
      credit="Photo: Keith Allison · CC BY-SA 2.0"
      pos="center 15%"
      accentColor={accentColor}
    />
  );
}

export function TimedPlayersScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.lebronSteph}
      sub="2016 NBA Finals"
      label="LeBron vs. Steph — Name Every Player"
      credit="Photo: Erik Drost · CC BY 2.0"
      pos="center 30%"
      accentColor={accentColor}
    />
  );
}

export function DraftClassScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.wemby}
      sub="2010–2025 Draft Classes"
      label="Wembanyama — 2023 #1 Pick"
      credit="Photo: Wikimedia Commons · CC BY-SA 4.0"
      pos="center 20%"
      accentColor={accentColor}
    />
  );
}

export function ConnectionsScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.dreamTeam}
      sub="NBA Connections · Daily Puzzle"
      label="Group the Players — 4 Hidden Categories"
      credit="Photo: Ken Hackman, U.S. Air Force · Public Domain"
      pos="center 20%"
      accentColor={accentColor}
    />
  );
}

export function HigherLowerScene({ accentColor }: { accentColor?: string }) {
  return (
    <MomentScene
      img={IMGS.jokic}
      sub="Higher or Lower · Career Stats"
      label="Which Player Has the Better Numbers?"
      credit="Photo: Keith Allison · CC BY-SA 2.0"
      pos="center 25%"
      accentColor={accentColor}
    />
  );
}
