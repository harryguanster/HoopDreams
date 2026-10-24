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
    <div className="min-h-screen" style={{ background: "transparent", color: "white" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between"
        style={{
          minHeight: 52,
          background: "rgba(5,10,25,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "2px solid #1a2a4a",
          boxShadow: "0 2px 0 #000",
        }}
      >
        <div className="flex items-center gap-3">
          <a href="/home" style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.4)" }}>
            &lt; BACK
          </a>
          <img src="/logo-green.png" alt="" className="h-7 w-auto" style={{ imageRendering: "pixelated" }} />
          <span
            className="hidden sm:block"
            style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.55rem", color: "white", letterSpacing: "0.05em", lineHeight: 1.5 }}
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

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-5 py-12 pb-20">

        {/* Page title */}
        <div className="text-center mb-10">
          <div
            style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.9rem",
              color: "#84cc16",
              letterSpacing: "0.3em",
              marginBottom: "0.75rem",
            }}
          >
            SELECT MODE
          </div>
          <h1
            style={{
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "clamp(18px, 4vw, 36px)",
              color: "white",
              textShadow: "3px 3px 0 #000",
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
            }}
          >
            CHOOSE<br />YOUR GAME
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Full Court */}
          <Link href="/full-court" className="block">
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                background: "rgba(5,15,5,0.8)",
                border: "3px solid #2a5010",
                boxShadow: "4px 4px 0 #000, 0 0 20px rgba(132,204,22,0.1)",
                padding: "1.5rem",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              {/* Court pixel art preview */}
              <div style={{ marginBottom: "1rem", opacity: 0.25 }}>
                <svg viewBox="0 0 200 80" width="100%" height="50px">
                  <rect width="200" height="80" fill="#5a3010" />
                  {[12, 24, 36, 48, 60, 72].map(y => (
                    <rect key={y} x="0" y={y} width="200" height="1" fill="#3a1e08" />
                  ))}
                  <rect x="4" y="4" width="192" height="72" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="100" y1="4" x2="100" y2="76" stroke="white" strokeWidth="1" />
                  <circle cx="100" cy="40" r="18" fill="none" stroke="white" strokeWidth="1" />
                  <rect x="4" y="20" width="45" height="40" fill="none" stroke="white" strokeWidth="1" />
                  <rect x="151" y="20" width="45" height="40" fill="none" stroke="white" strokeWidth="1" />
                </svg>
              </div>

              <div>
                <div style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "0.75rem",
                  color: "#84cc16",
                  letterSpacing: "0.2em",
                  marginBottom: "0.5rem",
                  border: "1px solid #2a5010",
                  display: "inline-block",
                  padding: "2px 8px",
                }}>
                  DAILY
                </div>
                <h2 style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "clamp(14px, 2.5vw, 20px)",
                  color: "#84cc16",
                  textShadow: "2px 2px 0 #1a3000",
                  lineHeight: 1.4,
                  marginBottom: "0.75rem",
                }}>
                  FULL<br />COURT
                </h2>
                <p style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.5,
                  letterSpacing: "0.05em",
                }}>
                  7 NBA prompts. Beat the crowd — rarer answers travel farther down court.
                </p>
              </div>

              <div style={{
                marginTop: "1.5rem",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.55rem",
                color: "#030508",
                background: "#84cc16",
                padding: "10px 18px",
                display: "inline-block",
                border: "2px solid #5a8a0a",
                boxShadow: "3px 3px 0 #1a3000",
                letterSpacing: "0.1em",
              }}>
                INBOUND &gt;
              </div>
            </motion.div>
          </Link>

          {/* Puffer Party */}
          <Link href="/puffer-party" className="block">
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                background: "rgba(15,5,5,0.8)",
                border: "3px solid #801010",
                boxShadow: "4px 4px 0 #000, 0 0 20px rgba(239,68,68,0.1)",
                padding: "1.5rem",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              {/* Pixel basketball */}
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", opacity: 0.3 }}>
                <svg viewBox="0 0 60 60" width="50" height="50">
                  <circle cx="30" cy="30" r="26" fill="#e04010" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#000" strokeWidth="2" />
                  <line x1="4" y1="30" x2="56" y2="30" stroke="#000" strokeWidth="2" />
                  <line x1="30" y1="4" x2="30" y2="56" stroke="#000" strokeWidth="2" />
                  <path d="M16,6 Q4,30 16,54" fill="none" stroke="#000" strokeWidth="2" />
                  <path d="M44,6 Q56,30 44,54" fill="none" stroke="#000" strokeWidth="2" />
                </svg>
              </div>

              <div>
                <div style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "0.75rem",
                  color: "#ef4444",
                  letterSpacing: "0.2em",
                  marginBottom: "0.5rem",
                  border: "1px solid #801010",
                  display: "inline-block",
                  padding: "2px 8px",
                }}>
                  HOT POTATO
                </div>
                <h2 style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "clamp(14px, 2.5vw, 20px)",
                  color: "#ef4444",
                  textShadow: "2px 2px 0 #400000",
                  lineHeight: 1.4,
                  marginBottom: "0.75rem",
                }}>
                  PUFFER<br />PARTY
                </h2>
                <p style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.5,
                  letterSpacing: "0.05em",
                }}>
                  Ball inflates over time. Type NBA answers to deflate it before it pops.
                </p>
              </div>

              <div style={{
                marginTop: "1.5rem",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.55rem",
                color: "white",
                background: "#ef4444",
                padding: "10px 18px",
                display: "inline-block",
                border: "2px solid #801010",
                boxShadow: "3px 3px 0 #400000",
                letterSpacing: "0.1em",
              }}>
                PLAY &gt;
              </div>
            </motion.div>
          </Link>

        </div>
      </main>
    </div>
  );
}
