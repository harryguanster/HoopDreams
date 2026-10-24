"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

export default function GamesPage() {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    function refresh() {
      const s = loadStreak();
      setStreakCount(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
    }
    refresh();
    window.addEventListener("daily-update", refresh);
    return () => window.removeEventListener("daily-update", refresh);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#030508", color: "white", fontFamily: "var(--font-geist-mono)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 flex items-center justify-between" style={{ minHeight: 56, background: "rgba(3,5,8,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <a href="/home" className="text-white/40 hover:text-[#84cc16] transition-colors font-bold mr-1 text-sm">←</a>
          <img src="/logo-green.png" alt="" className="h-8 w-auto" />
          <span className="font-playfair font-black text-white hidden sm:block" style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}>Courtside Central</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#84cc16]/60 hidden sm:block">Season 2025–26</span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-5 py-16 pb-24">

        <div className="text-center mb-14">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.5em] text-[#84cc16] mb-4">Game Modes</p>
          <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}>
            Choose Your Game
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Full Court */}
          <Link href="/full-court" className="group block">
            <motion.div
              className="relative overflow-hidden p-8 flex flex-col justify-between"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(132,204,22,0.3)", minHeight: 320 }}
              whileHover={{ background: "rgba(132,204,22,0.06)", borderColor: "rgba(132,204,22,0.55)" }}
              transition={{ duration: 0.18 }}
            >
              {/* Court texture hint */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-8">
                <svg viewBox="0 0 500 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                  <rect width="500" height="320" fill="#C17F2A" />
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1="0" y1={30 * i} x2="500" y2={30 * i} stroke="#7A520F" strokeWidth="0.8" />
                  ))}
                  <rect x="15" y="15" width="470" height="290" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="250" y1="15" x2="250" y2="305" stroke="white" strokeWidth="1.5" />
                  <circle cx="250" cy="160" r="50" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="15" y="85" width="120" height="150" fill="none" stroke="white" strokeWidth="1.5" />
                  <rect x="365" y="85" width="120" height="150" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10">
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.3em] px-2 py-0.5 border"
                  style={{ borderColor: "#84cc16", color: "#84cc16", background: "rgba(132,204,22,0.1)" }}>
                  Daily
                </span>
                <h2 className="font-playfair font-black italic text-white mt-4"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
                  Full Court
                </h2>
                <p className="text-white/45 text-sm mt-3 leading-relaxed">
                  7 NBA prompts. Beat the crowd — rarer answers travel farther down the court. Inbound at the baseline and go coast to coast.
                </p>
              </div>

              <motion.div
                className="relative z-10 mt-8 self-start px-7 py-3 font-mono font-bold text-xs uppercase tracking-[0.2em]"
                style={{ background: "#84cc16", color: "#030508" }}
                whileHover={{ scale: 1.03 }}
              >
                Inbound →
              </motion.div>
            </motion.div>
          </Link>

          {/* Puffer Party */}
          <Link href="/puffer-party" className="group block">
            <motion.div
              className="relative overflow-hidden p-8 flex flex-col justify-between"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.3)", minHeight: 320 }}
              whileHover={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.55)" }}
              transition={{ duration: 0.18 }}
            >
              {/* Basketball texture hint */}
              <div className="absolute right-6 bottom-6 opacity-6 pointer-events-none">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="#e46209" />
                  <path d="M10,70 Q70,40 130,70" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" />
                  <path d="M70,10 Q100,70 70,130" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" />
                  <path d="M30,20 Q10,70 30,120" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
                  <path d="M110,20 Q130,70 110,120" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="relative z-10">
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.3em] px-2 py-0.5 border"
                  style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                  Hot Potato
                </span>
                <h2 className="font-playfair font-black italic text-white mt-4"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
                  Puffer Party
                </h2>
                <p className="text-white/45 text-sm mt-3 leading-relaxed">
                  A basketball inflates over time. Type NBA answers to deflate it before it pops. Rarer answers deflate more. Don&apos;t let it explode.
                </p>
              </div>

              <motion.div
                className="relative z-10 mt-8 self-start px-7 py-3 font-mono font-bold text-xs uppercase tracking-[0.2em]"
                style={{ background: "#ef4444", color: "white" }}
                whileHover={{ scale: 1.03 }}
              >
                Play →
              </motion.div>
            </motion.div>
          </Link>

        </div>

      </main>
    </div>
  );
}
