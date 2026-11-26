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

// Simple SVG icons for each game card
function IconCourt() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
      <rect x="1" y="1" width="50" height="36" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <line x1="26" y1="1" x2="26" y2="37" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="26" cy="19" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M1 19 Q9 10 17 19 Q9 28 1 19Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M51 19 Q43 10 35 19 Q43 28 51 19Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="26" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function IconBall() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <ellipse cx="20" cy="20" rx="16" ry="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L23.5 15.5 H35.5 L25.5 22.5 L29 34 L20 27 L11 34 L14.5 22.5 L4.5 15.5 H16.5 Z" stroke="currentColor" strokeWidth="1.8" opacity="0.65" />
    </svg>
  );
}

function IconRookie() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 8 L20 32 M12 20 L28 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function GameCard({
  title, tagline, color, textColor = "white", href, disabled, icon,
}: {
  title: string; tagline: string; color: string; textColor?: string;
  href?: string; disabled?: boolean; icon: React.ReactNode;
}) {
  const content = (
    <div
      style={{
        background: color,
        padding: "22px 16px 20px",
        position: "relative",
        height: "100%",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.75 : 1,
        transition: "filter 0.15s, transform 0.12s",
        color: textColor,
      }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
    >
      {/* + icon top-center */}
      {!disabled && (
        <span style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "0.7rem", color: textColor, opacity: 0.5,
        }}>+</span>
      )}

      {/* SVG icon */}
      <div style={{ opacity: 0.75, marginTop: 8 }}>{icon}</div>

      {/* Title */}
      <p style={{
        fontFamily: "var(--font-press-start), monospace",
        fontSize: "clamp(10px, 1.4vw, 14px)",
        color: textColor, letterSpacing: "0.06em",
        textAlign: "center", lineHeight: 1.5,
      }}>{title}</p>

      {/* Tagline */}
      <p style={{
        fontFamily: "var(--font-vt323), monospace",
        fontSize: "0.95rem", color: textColor,
        opacity: disabled ? 0.4 : 0.6,
        letterSpacing: "0.08em", textAlign: "center",
      }}>{disabled ? "coming soon" : tagline}</p>
    </div>
  );

  if (disabled) return <div style={{ flex: 1, minWidth: 0 }}>{content}</div>;
  return <a href={href} style={{ flex: 1, minWidth: 0, display: "block", textDecoration: "none" }}>{content}</a>;
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

  return (
    <div className="h-screen overflow-hidden relative" style={{ color: "white" }}>

      {/* ── TITLE ── */}
      <div style={{
        position: "absolute", top: "5%", left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center", zIndex: 20, pointerEvents: "none",
        whiteSpace: "nowrap",
      }}>
        <h1 style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(22px, 4vw, 58px)",
          color: "white",
          WebkitTextStroke: "3px #000",
          paintOrder: "stroke fill",
          textShadow: "4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.3)",
          letterSpacing: "0.04em",
          lineHeight: 1.3,
        }}>
          Courtside
        </h1>
        <h1 style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(22px, 4vw, 58px)",
          color: "#84cc16",
          WebkitTextStroke: "3px #1a3000",
          paintOrder: "stroke fill",
          textShadow: "4px 4px 0 #1a3000, 6px 6px 0 rgba(0,0,0,0.3)",
          letterSpacing: "0.04em",
          lineHeight: 1.3,
        }}>
          Central
        </h1>
      </div>

      {/* ── CENTER PANEL ── */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -38%)",
        width: "min(500px, 92vw)",
        zIndex: 20,
      }}>

        {/* Streak + stats bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 10px",
          background: "rgba(10,16,26,0.92)",
          border: "2px solid rgba(255,255,255,0.09)",
          borderBottom: "none",
        }}>
          {/* Streak chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,140,0,0.15)",
            border: "1px solid rgba(255,140,0,0.3)",
            padding: "5px 10px",
            borderRadius: 2,
          }}>
            <span style={{ fontSize: "1rem" }}>🔥</span>
            <span style={{
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "0.6rem", color: "#ffa040",
            }}>{mounted ? streak : 0}</span>
          </div>

          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "5px 12px", borderRadius: 2, cursor: "pointer",
          }}>
            <span style={{ fontSize: "0.9rem" }}>📊</span>
            <span style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "1rem", color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.1em",
            }}>My stats</span>
          </button>

          <div style={{ marginLeft: "auto" }}>
            <AuthButton />
          </div>
        </div>

        {/* 2×2 card grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
          background: "rgba(0,0,0,0.5)",
          padding: 3,
          border: "2px solid rgba(255,255,255,0.09)",
          borderTop: "none", borderBottom: "none",
        }}>
          <GameCard
            title="FULL COURT"
            tagline="the rarest answer"
            color="#1e3a62"
            href="/full-court"
            icon={<IconCourt />}
          />
          <GameCard
            title="SURFACE"
            tagline="the crowd answer"
            color="#b87a3a"
            disabled
            icon={<IconBall />}
          />
          <GameCard
            title="VETERAN"
            tagline="the oldest player"
            color="#7a3030"
            disabled
            icon={<IconStar />}
          />
          <GameCard
            title="ROOKIE"
            tagline="the newest player"
            color="#2a5a4a"
            disabled
            icon={<IconRookie />}
          />
        </div>

        {/* Link row */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(10,16,26,0.92)",
          border: "2px solid rgba(255,255,255,0.09)",
          borderTop: "none", borderBottom: "none",
        }}>
          {[
            { label: "∞ UNLIMITED", icon: "∞" },
            { label: "📁 ARCHIVE" },
            { label: "🗂 SEASON PACKS" },
          ].map(({ label }) => (
            <button key={label} style={{
              flex: 1, padding: "9px 4px",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.8rem", color: "rgba(255,255,255,0.35)",
              background: "none", border: "none", cursor: "not-allowed",
              letterSpacing: "0.06em",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}>{label}</button>
          ))}
        </div>

        {/* Leaderboard + League */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2,
          padding: "2px",
          background: "rgba(10,16,26,0.92)",
          border: "2px solid rgba(255,255,255,0.09)",
          borderTop: "2px solid rgba(255,255,255,0.09)",
          borderBottom: "none",
        }}>
          {[
            { label: "📊 LEADERBOARD", href: "/higher-lower" },
            { label: "👥 LEAGUE", href: "/games" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              padding: "11px 4px",
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "1rem", color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.06)",
              textAlign: "center", textDecoration: "none",
              letterSpacing: "0.1em",
              border: "none",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            >{label}</a>
          ))}
        </div>

        {/* Footer bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 14px",
          background: "rgba(10,16,26,0.92)",
          border: "2px solid rgba(255,255,255,0.09)",
        }}>
          <span style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
          }}>? HELP</span>
          <span style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em",
          }}>SEASON 2025-26</span>
          <span style={{
            fontFamily: "var(--font-vt323), monospace",
            fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
          }}>🎨 CUSTOMIZE</span>
        </div>
      </div>

      {/* ── BOTTOM LEFT: countdown + trophy ── */}
      <div style={{
        position: "absolute", bottom: "5%", left: "5%",
        zIndex: 20, pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "0.42rem", color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.14em", marginBottom: 6,
        }}>NEXT RESET IN</p>
        <p style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "clamp(13px, 1.8vw, 22px)",
          color: "#ffa040",
          textShadow: "2px 2px 0 #5a2800",
          letterSpacing: "0.04em",
        }}>{mounted ? timeStr : "--:--:--"}</p>
        <div style={{ marginTop: 12, fontSize: "2rem" }}>🏆</div>
      </div>

      {/* ── BOTTOM RIGHT: stats panel ── */}
      <div style={{
        position: "absolute", bottom: "5%", right: "5%",
        width: 230, zIndex: 20,
        background: "rgba(10,16,26,0.92)",
        border: "2px solid rgba(255,255,255,0.09)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[
            { label: "↑ FULL COURT", color: "#6090d0" },
            { label: "↑ SURFACE",    color: "#c09050" },
            { label: "↑ VETERAN",    color: "#c06060" },
            { label: "↑ ROOKIE",     color: "#50a080" },
          ].map(({ label, color }) => (
            <div key={label}>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "0.65rem", color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em", marginBottom: 2,
              }}>{label}</p>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.9rem", color: "white", lineHeight: 1,
              }}>
                0<span style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>pts</span>
              </p>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 10, marginBottom: 8,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,100,0,0.2)", border: "1px solid rgba(255,100,0,0.35)",
            padding: "4px 10px", borderRadius: 2,
          }}>
            <span style={{ fontSize: "0.9rem" }}>🔥</span>
            <span style={{
              fontFamily: "var(--font-press-start), monospace",
              fontSize: "0.5rem", color: "#ffa040",
            }}>{mounted ? streak : 0} DAY STREAK</span>
          </div>
        </div>

        <p style={{
          fontFamily: "var(--font-vt323), monospace",
          fontSize: "0.65rem", color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.1em", marginBottom: 4,
        }}>YOUR BEST GAMES</p>
        <p style={{
          fontFamily: "var(--font-vt323), monospace",
          fontSize: "0.9rem", color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.06em",
        }}>— pts</p>
      </div>
    </div>
  );
}
