"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AuthButton from "@/app/components/AuthButton";
import DailyBadge from "@/app/components/DailyBadge";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

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
      style={{ background: "transparent", color: "white" }}
    >
      {/* ── Header ── */}
      <header
        className="relative z-30 px-4 sm:px-6 flex items-center justify-between shrink-0"
        style={{
          minHeight: 52,
          background: "rgba(5,10,25,0.85)",
          borderBottom: "2px solid #1a2a4a",
          boxShadow: "0 2px 0 #000",
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo-green.png" alt="Courtside Central" className="h-8 w-auto" style={{ imageRendering: "pixelated" }} />
          <span
            className="hidden sm:block text-white"
            style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.6rem", letterSpacing: "0.05em", lineHeight: 1.4 }}
          >
            COURTSIDE<br />CENTRAL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:block"
            style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.85rem", color: "#84cc16", letterSpacing: "0.15em" }}
          >
            SEASON 2025-26
          </span>
          <DailyBadge count={streakCount} />
          <AuthButton />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6" style={{ isolation: "isolate" }}>

        {/* Pixel date tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "1.1rem",
            color: "#84cc16",
            letterSpacing: "0.25em",
            marginBottom: "1.5rem",
            background: "rgba(10,30,10,0.6)",
            border: "2px solid #2a5010",
            padding: "4px 12px",
            display: "inline-block",
          }}
        >
          {mounted ? `> ${getTodayStr()}` : "> ..."}
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: "clamp(22px, 5vw, 72px)",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textShadow: "4px 4px 0 #000, 0 0 40px rgba(132,204,22,0.4)",
            marginBottom: "0.5rem",
          }}
        >
          COURTSIDE
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: "clamp(22px, 5vw, 72px)",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            color: "#84cc16",
            textShadow: "4px 4px 0 #1a3000, 0 0 40px rgba(132,204,22,0.5)",
            marginBottom: "2rem",
          }}
        >
          CENTRAL
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "1.2rem",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.1em",
            marginBottom: "2.5rem",
            maxWidth: 380,
          }}
        >
          2 GAME MODES. BEAT THE CROWD OR BEAT THE CLOCK.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Full Court */}
          <motion.a
            href="/full-court"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96, y: 0 }}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              color: "#030508",
              background: "#84cc16",
              padding: "14px 28px",
              border: "3px solid #5a8a0a",
              boxShadow: "4px 4px 0 #1a3000, 0 0 20px rgba(132,204,22,0.35)",
              cursor: "pointer",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            FULL COURT &gt;
          </motion.a>

          {/* Puffer Party */}
          <motion.a
            href="/puffer-party"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96, y: 0 }}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              color: "#ef4444",
              background: "rgba(30,5,5,0.7)",
              padding: "14px 28px",
              border: "3px solid #801010",
              boxShadow: "4px 4px 0 #400000",
              cursor: "pointer",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            PUFFER PARTY &gt;
          </motion.a>
        </motion.div>

        {/* Streak badge */}
        {streakCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              marginTop: "2rem",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "1.1rem",
              color: "#ffd060",
              background: "rgba(40,30,0,0.7)",
              border: "2px solid #5a4010",
              padding: "6px 16px",
              letterSpacing: "0.15em",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            * {streakCount} DAY STREAK *
          </motion.div>
        )}
      </section>

      {/* ── Bottom stat bar ── */}
      <motion.div
        className="relative z-20 flex items-center justify-center gap-8 sm:gap-16 px-6 py-4"
        style={{
          background: "rgba(5,10,25,0.85)",
          borderTop: "2px solid #1a2a4a",
          boxShadow: "0 -2px 0 #000",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[
          { val: "2", label: "GAME MODES" },
          { val: "10K", label: "MAX SCORE" },
          { val: "3", label: "LIVES" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p
              style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(14px, 3vw, 22px)",
                color: "#84cc16",
                textShadow: "2px 2px 0 #1a3000",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.2em",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
