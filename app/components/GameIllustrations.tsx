"use client";
import { motion } from "framer-motion";

// All images: Wikipedia Commons, freely licensed (see credit strings)
const IMGS = {
  lebron2016:  "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",
  lebronSteph: "https://upload.wikimedia.org/wikipedia/commons/5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg",
  jordan97:    "https://upload.wikimedia.org/wikipedia/commons/4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg",
  kobe81:      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kobe_Bryant_81.jpg",
  dreamTeam:   "https://upload.wikimedia.org/wikipedia/commons/a/a0/Dream_Team_at_the_1992_Summer_Olympics.JPEG",
  rayAllen:    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ray_Allen_Heat.jpg",
};

interface SceneProps {
  img: string;
  sub: string;
  label: string;
  credit: string;
  pos?: string;
  filter?: string;
}

function MomentScene({ img, sub, label, credit, pos = "center center", filter }: SceneProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
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
            color: "rgba(45,212,191,0.92)",
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
    </div>
  );
}

// ── Scenes ────────────────────────────────────────────────────────────────────

export function SBCScene({ era = "alltime" }: { era?: string }) {
  void era;
  return (
    <MomentScene
      img={IMGS.lebron2016}
      sub="2016 NBA Finals · Game 7"
      label="LeBron's Chase-Down Block on Iguodala"
      credit="Photo: Erik Drost · CC BY 2.0"
      pos="center 30%"
    />
  );
}

export function GuessWhoScene({ era = "alltime" }: { era?: string }) {
  void era;
  return (
    <MomentScene
      img={IMGS.jordan97}
      sub="Guess the Legend"
      label="Who Is This NBA Icon?"
      credit="Photo: Steve Lipofsky · CC BY-SA 3.0"
      // grayscale + slight brightness dip for "mystery silhouette" feel
      filter="grayscale(75%) brightness(0.7) contrast(1.1)"
    />
  );
}

export function StatLineScene({ era = "alltime" }: { era?: string }) {
  void era;
  return (
    <MomentScene
      img={IMGS.kobe81}
      sub="Jan 22 2006 · Staples Center"
      label="Kobe Bryant — 81 Points"
      credit="Photo: endlessbender · CC BY 2.0"
      pos="center 25%"
    />
  );
}

export function LineupScene() {
  return (
    <MomentScene
      img={IMGS.dreamTeam}
      sub="1992 Barcelona Olympics"
      label="The Dream Team — Greatest Lineup Ever"
      credit="Photo: Ken Hackman, U.S. Air Force · Public Domain"
      pos="center 20%"
    />
  );
}

export function TimedTeamsScene() {
  return (
    <MomentScene
      img={IMGS.rayAllen}
      sub="Race the Clock · 30 Teams"
      label="Ray Allen — Miami Heat"
      credit="Photo: Keith Allison · CC BY-SA 2.0"
      pos="center 15%"
    />
  );
}

export function TimedPlayersScene() {
  return (
    <MomentScene
      img={IMGS.lebronSteph}
      sub="2016 NBA Finals"
      label="LeBron vs. Steph — Name Every Player"
      credit="Photo: Erik Drost · CC BY 2.0"
      pos="center 30%"
    />
  );
}
