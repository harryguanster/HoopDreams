"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import Arena3D from "@/app/components/Arena3D";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

// ── Floating particles ─────────────────────────────────────────────────────────
function ArenaParticles() {
  const ps = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 3 + (i * 41) % 96,
    delay: (i * 0.6) % 9,
    dur: 9 + (i * 1.1) % 8,
    size: 1 + (i * 0.3) % 2.2,
    opacity: 0.3 + (i * 0.04) % 0.5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {ps.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: -4, width: p.size, height: p.size, background: `rgba(255,210,80,${p.opacity})` }}
          animate={{ y: [0, -900], opacity: [0, p.opacity, p.opacity * 0.5, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [streakCount, setStreakCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function refresh() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refresh();
    window.addEventListener("daily-update", refresh);
    return () => window.removeEventListener("daily-update", refresh);
  }, []);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: "#030508", color: "white", fontFamily: "var(--font-geist-mono)" }}
    >
      {/* 3D arena background */}
      <Arena3D />
      {mounted && <ArenaParticles />}

      {/* ── Header ── */}
      <header className="relative z-30 px-6 flex items-center justify-between shrink-0" style={{ minHeight: 58, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <img src="/logo-green.png" alt="Courtside Central" className="h-9 w-auto" />
          <span className="font-playfair font-black text-white hidden sm:block" style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#84cc16]/70 hidden sm:block">Season 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.p
          className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-[#84cc16] mb-6"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          Daily · {getTodayStr()}
        </motion.p>

        <motion.h1
          className="font-playfair font-black italic"
          style={{
            fontSize: "clamp(64px, 13vw, 190px)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            textShadow: "0 0 100px rgba(132,204,22,0.35), 0 4px 60px rgba(0,0,0,0.9)",
          }}
          initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Courtside<br />Central.
        </motion.h1>

        <motion.p
          className="mt-5 mb-10 text-white/40 text-sm max-w-xs leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          NBA trivia games. Inbound the ball, beat the crowd, go coast to coast.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        >
          <motion.a
            href="/full-court"
            className="inline-flex items-center gap-2 px-10 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm"
            style={{ background: "#84cc16", color: "#030508", boxShadow: "0 0 40px rgba(132,204,22,0.35)" }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(132,204,22,0.55)" }}
            whileTap={{ scale: 0.96 }}
          >
            Play Full Court →
          </motion.a>
          <motion.a
            href="/games"
            className="inline-flex items-center gap-2 px-8 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.6)" }}
            whileHover={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}
          >
            All Games
          </motion.a>
        </motion.div>

        {/* Streak badge */}
        {streakCount > 0 && (
          <motion.div
            className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.2)" }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
          >
            <span className="text-[#84cc16] text-xs font-bold">🔥</span>
            <span className="text-[#84cc16] text-xs font-bold uppercase tracking-widest">{streakCount} Day Streak</span>
          </motion.div>
        )}
      </section>

      {/* ── Bottom stat bar ── */}
      <motion.div
        className="relative z-20 flex items-center justify-center gap-8 sm:gap-16 px-6 py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
      >
        {[
          { val: "7", label: "Prompts per game" },
          { val: "20s", label: "Per answer" },
          { val: "10K", label: "Max score / round" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "1.8rem", lineHeight: 1 }}>{s.val}</p>
            <p className="text-[8px] text-white/30 font-mono uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
