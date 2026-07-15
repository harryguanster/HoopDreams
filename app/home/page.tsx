"use client";

import React from "react";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import { LINEUPS } from "@/lib/lineupData";
import { TRIOS } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import { useEffect, useState } from "react";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

const IMGS = {
  lebron2016:  "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",
  lebronSteph: "https://upload.wikimedia.org/wikipedia/commons/5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg",
  jordan97:    "https://upload.wikimedia.org/wikipedia/commons/4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg",
  kobe81:      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kobe_Bryant_81.jpg",
  dreamTeam:   "https://upload.wikimedia.org/wikipedia/commons/a/a0/Dream_Team_at_the_1992_Summer_Olympics.JPEG",
  rayAllen:    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ray_Allen_Heat.jpg",
  curry:       "https://upload.wikimedia.org/wikipedia/commons/b/b6/Stephen_Curry_shooting.jpg",
  wemby:       "https://upload.wikimedia.org/wikipedia/commons/2/21/Victor_Wembanyama_San_Antonio_Spurs_2025_NBA_Cup.jpg",
};

const HERO_PHOTOS = [
  { src: IMGS.lebron2016,  label: "The Block · 2016 Finals",  pos: "center 30%" },
  { src: IMGS.jordan97,    label: "Michael Jordan · 1997",    pos: "center 35%" },
  { src: IMGS.kobe81,      label: "Kobe 81 Pts · 2006",       pos: "center 25%" },
  { src: IMGS.dreamTeam,   label: "Dream Team · 1992",        pos: "center 20%" },
  { src: IMGS.curry,       label: "Steph Curry · Warriors",   pos: "center 30%" },
  { src: IMGS.wemby,       label: "Wemby · Spurs 2025",       pos: "center 20%" },
  { src: IMGS.lebronSteph, label: "LeBron vs Steph · 2016",   pos: "center 30%" },
  { src: IMGS.rayAllen,    label: "Ray Allen · Heat",          pos: "center 15%" },
];

const PLATE_LAYOUT = [
  { x: -43, y: -24, rx:  14, ry: -28, rz: -13, w: 275, zLayer: 0 },
  { x:  37, y: -27, rx: -11, ry:  24, rz:  11, w: 250, zLayer: 0 },
  { x: -47, y:   9, rx:  20, ry: -18, rz:   8, w: 268, zLayer: 1 },
  { x:  43, y:   7, rx: -16, ry: -24, rz:  -7, w: 248, zLayer: 0 },
  { x: -13, y: -43, rx:   9, ry: -16, rz:  17, w: 205, zLayer: 1 },
  { x:  11, y:  41, rx: -11, ry:  17, rz: -14, w: 225, zLayer: 0 },
  { x:  45, y:  33, rx: -21, ry: -27, rz:  -5, w: 215, zLayer: 1 },
  { x: -40, y:  33, rx:  17, ry:  21, rz:   5, w: 198, zLayer: 0 },
];

function PhotoPlate3D({ src, label, pos, x, y, rx, ry, rz, w, idx, zLayer }: {
  src: string; label: string; pos: string;
  x: number; y: number; rx: number; ry: number; rz: number;
  w: number; idx: number; zLayer: number;
}) {
  return (
    <motion.div
      style={{
        position: "absolute", width: w, aspectRatio: "4/3",
        left: `calc(50% + ${x}vw)`, top: `calc(50% + ${y}vh)`,
        translateX: "-50%", translateY: "-50%",
        rotateX: rx, rotateY: ry, rotateZ: rz, transformPerspective: 950,
        borderRadius: 16, overflow: "hidden",
        zIndex: zLayer === 0 ? 5 : 15,
        boxShadow: "0 50px 130px rgba(0,0,0,0.88), 0 24px 65px rgba(0,0,0,0.6)",
        willChange: "transform", pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1, scale: 1,
        x: [0, (idx % 2 === 0 ? 1 : -1) * (28 + (idx * 13) % 42), (idx % 2 === 0 ? -1 : 1) * (14 + (idx * 7) % 28), 0],
        y: [0, -(20 + (idx * 9) % 35), -(8 + (idx * 5) % 22), 0],
        rotateZ: [rz - 3, rz + 3, rz - 1.5, rz + 3],
        rotateX: [rx - 1.5, rx + 1.5, rx - 1.5],
        rotateY: [ry - 2, ry + 2, ry - 2],
      }}
      transition={{
        opacity: { duration: 1.1, delay: 0.08 + idx * 0.13 },
        scale: { duration: 1.1, delay: 0.08 + idx * 0.13, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 17 + idx * 2.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.8 },
        y: { duration: 13 + idx * 2.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.6 },
        rotateZ: { duration: 11 + idx * 1.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: idx * 0.5 },
        rotateX: { duration: 19 + idx * 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: idx * 0.7 },
        rotateY: { duration: 15 + idx * 2.1, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: idx * 0.9 },
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: pos }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 48%, rgba(0,0,0,0.08) 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)" }}>
        <p style={{ color: "rgba(163,230,53,0.9)", fontSize: "7.5px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{label}</p>
      </div>
    </motion.div>
  );
}

function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}>
      <p className="font-playfair font-black text-[#84cc16] tabular-nums" style={{ fontSize: "2.2rem", lineHeight: 1 }}>{value}</p>
      <p className="text-[9px] text-white/50 font-mono uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    function refreshStreak() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refreshStreak();
    window.addEventListener("daily-update", refreshStreak);
    return () => window.removeEventListener("daily-update", refreshStreak);
  }, []);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#030803" }}>
      <style>{`
        @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(40px,-30px) scale(1.08)} 70%{transform:translate(-20px,20px) scale(0.95)} }
        @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-50px,25px) scale(1.06)} 65%{transform:translate(30px,-20px) scale(0.97)} }
      `}</style>

      {/* Header */}
      <header className="relative z-50 px-6 flex items-center justify-between shrink-0" style={{ minHeight: 56, borderBottom: "1px solid rgba(132,204,22,0.15)" }}>
        <div className="flex items-center gap-3">
          <img src="/logo-green.png" alt="Courtside Central" className="h-10 w-auto" />
          <span className="font-playfair font-black text-white" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em", lineHeight: 1 }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#84cc16] hidden sm:block">Season 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      {/* Hero — fills remaining height, no scroll */}
      <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden text-white">
        <div className="absolute pointer-events-none" style={{ width: 780, height: 620, bottom: "-140px", left: "-160px", background: "radial-gradient(ellipse, rgba(251,146,60,0.28) 0%, rgba(234,88,12,0.12) 45%, transparent 70%)", filter: "blur(60px)", animation: "floatA 9s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        <div className="absolute pointer-events-none" style={{ width: 720, height: 580, top: "-120px", right: "-140px", background: "radial-gradient(ellipse, rgba(132,204,22,0.25) 0%, rgba(101,163,13,0.10) 50%, transparent 70%)", filter: "blur(65px)", animation: "floatB 11s ease-in-out infinite", borderRadius: "50%", zIndex: 1 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(3,8,3,0.85) 100%)", zIndex: 2 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(132,204,22,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 2 }} />

        {PLATE_LAYOUT.map((pl, i) => (
          <PhotoPlate3D key={i} src={HERO_PHOTOS[i].src} label={HERO_PHOTOS[i].label} pos={HERO_PHOTOS[i].pos} x={pl.x} y={pl.y} rx={pl.rx} ry={pl.ry} rz={pl.rz} w={pl.w} idx={i} zLayer={pl.zLayer} />
        ))}

        <motion.div className="relative text-center pointer-events-none px-6" style={{ zIndex: 10 }} initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: "easeOut" }}>
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.45em] text-[#84cc16] mb-8">Test Your NBA IQ</p>
          <h1 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(64px, 12vw, 180px)", lineHeight: 0.92, letterSpacing: "-0.03em", textShadow: "0 0 80px rgba(132,204,22,0.4), 0 4px 40px rgba(0,0,0,0.9)" }}>
            Courtside<br />Central.
          </h1>
        </motion.div>

        <motion.div className="relative mt-12" style={{ zIndex: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <motion.a
            href="/games#daily-challenges"
            className="inline-block px-12 py-4 text-[#111827] font-mono font-bold uppercase tracking-[0.2em] text-sm"
            style={{ background: "#84cc16", border: "2px solid #84cc16", boxShadow: "0 0 40px rgba(132,204,22,0.4)" }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(132,204,22,0.65)" }}
            whileTap={{ scale: 0.96 }}
          >
            Start Playing →
          </motion.a>
        </motion.div>

        <motion.div className="absolute bottom-7 flex items-center gap-10" style={{ zIndex: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <StatCounter value={`${TRIOS.length + CURRENT_TRIOS.length}+`} label="Start Bench Cut Rounds" />
          <div className="h-8 w-px bg-lime-500/20" />
          <StatCounter value={`${LINEUPS.length}+`} label="Lineup Puzzles" />
          <div className="h-8 w-px bg-lime-500/20" />
          <StatCounter value="500+" label="Players" />
        </motion.div>
      </section>
    </div>
  );
}
