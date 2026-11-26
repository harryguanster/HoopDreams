"use client";

import React, { useState, useEffect } from "react";
import AuthButton from "@/app/components/AuthButton";
import { loadStreak, getTodayStr } from "@/lib/dailyUtils";

function useTimeUntilMidnight() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setSecs(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function GameCard({
  title,
  tagline,
  color,
  href,
  disabled,
}: {
  title: string;
  tagline: string;
  color: string;
  href?: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      style={{
        background: color,
        padding: "22px 16px 16px",
        position: "relative",
        height: "100%",
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.72 : 1,
        transition: "filter 0.15s",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
    >
      {!disabled && (
        <span style={{
          position: "absolute", top: 8, right: 10,
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "0.75rem", color: "rgba(255,255,255,0.6)",
        }}>+</span>
      )}
      <p style={{
        fontFamily: "var(--font-press-start), monospace",
        fontSize: "0.6rem", color: "white",
        letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.7,
      }}>{title}</p>
      <p style={{
        fontFamily: "var(--font-vt323), monospace",
        fontSize: "0.9rem", color: "rgba(255,255,255,0.5)",
        letterSpacing: "0.1em", textAlign: "center",
      }}>{disabled ? "coming soon" : tagline}</p>
    </div>
  );

  if (disabled) return <div style={{ flex: 1 }}>{inner}</div>;
  return (
    <a href={href} style={{ flex: 1, display: "block", textDecoration: "none" }}>
      {inner}
    </a>
  );
}

export default function HomePage() {
  const timeStr = useTimeUntilMidnight();
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadStreak();
    setStreak(s.count > 0 && s.lastDate === getTodayStr() ? s.count : 0);
  }, []);

  const panelStyle: React.CSSProperties = {
    background: "rgba(10,16,30,0.97)",
    border: "2px solid rgba(255,255,255,0.07)",
  };

  const monoSm: React.CSSProperties = {
    fontFamily: "var(--font-vt323), monospace",
    fontSize: "0.8rem",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.35)",
  };

  return (
    <div className="h-screen overflow-hidden relative" style={{ color: "white" }}>

      {/* Title at top-center */}
      <div style={{
        position: "absolute", top: "4%", left: "50%", transform: "translateX(-50%)",
        textAlign: "center", zIndex: 20, pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        <h1 style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(14px, 2.8vw, 44px)",
          color: "white",
          textShadow: "4px 4px 0 #000, 0 0 40px rgba(0,0,0,0.5)",
          letterSpacing: "0.03em", lineHeight: 1.5,
        }}>COURTSIDE</h1>
        <h1 style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(14px, 2.8vw, 44px)",
          color: "#84cc16",
          textShadow: "4px 4px 0 #1a3000",
          letterSpacing: "0.03em",
        }}>CENTRAL</h1>
      </div>

      {/* Center panel */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -38%)",
        width: "min(460px, 92vw)",
        zIndex: 20,
        ...panelStyle,
      }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.09)",
            padding: "5px 10px",
          }}>
            <span style={{ fontSize: "0.9rem" }}>🔥</span>
            <span style={{
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "0.55rem", color: "white",
            }}>{mounted ? streak : 0}</span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.09)",
            padding: "5px 12px", cursor: "pointer",
          }}>
            <span style={{ fontSize: "0.75rem" }}>📊</span>
            <span style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em",
            }}>MY STATS</span>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <AuthButton />
          </div>
        </div>

        {/* 2×2 game card grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2,
          background: "rgba(255,255,255,0.04)",
        }}>
          <GameCard title="FULL COURT"   tagline="the rarest answer" color="#1c2d58" href="/full-court" />
          <GameCard title="SURFACE"      tagline="the crowd answer"   color="#1a3828" disabled />
          <GameCard title="VETERAN"      tagline="the oldest player"  color="#28183e" disabled />
          <GameCard title="ROOKIE"       tagline="the newest player"  color="#2a1a40" disabled />
        </div>

        {/* Link row */}
        <div style={{
          display: "flex", alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.25)",
        }}>
          {["UNLIMITED", "ARCHIVE", "SEASON PACKS"].map(label => (
            <button key={label} style={{
              flex: 1, padding: "9px 4px",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
              background: "none", border: "none", cursor: "not-allowed",
              letterSpacing: "0.08em",
            }}>{label}</button>
          ))}
        </div>

        {/* Leaderboard / League row */}
        <div style={{
          display: "flex", gap: 2, padding: "2px",
          background: "rgba(0,0,0,0.25)",
        }}>
          {[
            { label: "📊 LEADERBOARD", href: "/higher-lower" },
            { label: "👥 LEAGUE",      href: "/games" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              flex: 1, padding: "10px 4px",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.9rem", color: "rgba(255,255,255,0.65)",
              background: "rgba(255,255,255,0.05)",
              textAlign: "center", textDecoration: "none",
              letterSpacing: "0.1em",
            }}>{label}</a>
          ))}
        </div>

        {/* Footer bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={monoSm}>? HELP</span>
          <span style={{ ...monoSm, fontFamily: "var(--font-vt323), monospace", fontSize: "0.75rem" }}>
            SEASON 2025-26
          </span>
          <span style={monoSm}>🎨 CUSTOMIZE</span>
        </div>
      </div>

      {/* Bottom-left: countdown */}
      <div style={{
        position: "absolute", bottom: "5%", left: "5%",
        zIndex: 20, pointerEvents: "none",
      }}>
        <p style={{ ...monoSm, marginBottom: 4, color: "rgba(255,255,255,0.45)" }}>
          NEXT RESET IN
        </p>
        <p style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(10px, 1.6vw, 18px)",
          color: "#84cc16",
          textShadow: "2px 2px 0 #1a3000",
        }}>{mounted ? timeStr : "--:--:--"}</p>
        <div style={{ marginTop: 10, fontSize: "1.8rem" }}>🏆</div>
      </div>

      {/* Bottom-right: stats panel */}
      <div style={{
        position: "absolute", bottom: "5%", right: "5%",
        width: 210, zIndex: 20, ...panelStyle, padding: "12px 14px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[
            { label: "⬆ FULL COURT", pts: 0 },
            { label: "⬆ PUFFER",     pts: 0 },
            { label: "⬆ VETERAN",    pts: 0 },
            { label: "⬆ ROOKIE",     pts: 0 },
          ].map(({ label, pts }) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-vt323)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-press-start)", fontSize: "0.75rem", color: "white", lineHeight: 1.4 }}>
                {pts}<span style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.35)", marginLeft: 2 }}>pts</span>
              </p>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 8,
          fontFamily: "var(--font-vt323)",
          fontSize: "0.8rem",
          color: "#ffd060",
          letterSpacing: "0.1em",
        }}>🔥 {mounted ? streak : 0} DAY STREAK</div>
        <p style={{ ...monoSm, marginTop: 6, color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>
          YOUR BEST GAME
        </p>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
          — pts
        </p>
      </div>
    </div>
  );
}
