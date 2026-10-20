"use client";

import React from "react";
import { motion } from "framer-motion";

type Props = {
  ballProgress?: number; // 0 = near baseline, 1 = at rim. undefined = no ball
  animateBall?: boolean;
};

// Court SVG coords: 0,0 = far end (basket you shoot at), 0,940 = near end (you stand here)
const CW = 500;
const CH = 940;

function CourtSVG({ ballProgress, animateBall }: Props) {
  const hasBall = ballProgress != null && ballProgress >= 0;
  // Ball travels from y=880 (near, just inbounded) to y=60 (at the far rim)
  const ballY = hasBall ? 880 - (ballProgress ?? 0) * 820 : 880;
  const ballR = 13;

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        {/* Wood floor */}
        <linearGradient id="a3d-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4010" />
          <stop offset="35%" stopColor="#A86820" />
          <stop offset="65%" stopColor="#C87C28" />
          <stop offset="100%" stopColor="#A86820" />
        </linearGradient>
        {/* Center light strip */}
        <linearGradient id="a3d-strip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="rgba(255,220,100,0.06)" />
          <stop offset="50%" stopColor="rgba(255,220,100,0.1)" />
          <stop offset="70%" stopColor="rgba(255,220,100,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        {/* Far basket glow */}
        <radialGradient id="a3d-rimglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(249,115,22,0.5)" />
          <stop offset="100%" stopColor="rgba(249,115,22,0)" />
        </radialGradient>
        {/* Ball glow */}
        <radialGradient id="a3d-ballglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(132,204,22,0.7)" />
          <stop offset="100%" stopColor="rgba(132,204,22,0)" />
        </radialGradient>
        <filter id="a3d-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="a3d-softglow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Wood floor base */}
      <rect x="0" y="0" width={CW} height={CH} fill="url(#a3d-wood)" />

      {/* Wood plank lines */}
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 32} x2={CW} y2={i * 32}
          stroke="#5A3008" strokeWidth="0.7" strokeOpacity="0.35" />
      ))}

      {/* Centre light strip */}
      <rect x="0" y="0" width={CW} height={CH} fill="url(#a3d-strip)" />

      {/* Court boundary */}
      <rect x="14" y="14" width={CW - 28} height={CH - 28}
        fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />

      {/* Half-court line */}
      <line x1="14" y1={CH / 2} x2={CW - 14} y2={CH / 2}
        stroke="rgba(255,255,255,0.55)" strokeWidth="2" />

      {/* Centre circle */}
      <circle cx={CW / 2} cy={CH / 2} r="62"
        fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      <circle cx={CW / 2} cy={CH / 2} r="4"
        fill="rgba(255,255,255,0.4)" />

      {/* ── NEAR END (bottom — where you stand) ── */}
      {/* Near paint */}
      <rect x="168" y="748" width="164" height="192"
        fill="rgba(20,50,110,0.3)" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
      {/* Near free-throw circle */}
      <circle cx={CW / 2} cy="748" r="62"
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="9 6" />
      {/* Near 3pt arc */}
      <path d="M 28 755 A 225 225 0 0 1 472 755"
        fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
      <line x1="28" y1="755" x2="28" y2="926"
        stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
      <line x1="472" y1="755" x2="472" y2="926"
        stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
      {/* Near basket */}
      <circle cx={CW / 2} cy="898" r="22"
        fill="none" stroke="rgba(249,115,22,0.7)" strokeWidth="3" />
      {/* Near backboard */}
      <rect x="195" y="922" width="110" height="6" rx="2"
        fill="rgba(255,255,255,0.35)" />

      {/* ── FAR END (top — the goal) ── */}
      {/* Far paint */}
      <rect x="168" y="0" width="164" height="192"
        fill="rgba(20,50,110,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      {/* Far free-throw circle */}
      <circle cx={CW / 2} cy="192" r="62"
        fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="9 6" />
      {/* Far 3pt arc */}
      <path d="M 28 185 A 225 225 0 0 0 472 185"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="28" y1="185" x2="28" y2="14"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="472" y1="185" x2="472" y2="14"
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

      {/* Far basket ambient glow */}
      <circle cx={CW / 2} cy="42" r="55"
        fill="url(#a3d-rimglow)" filter="url(#a3d-softglow)" />
      {/* Far basket rim */}
      <circle cx={CW / 2} cy="42" r="20"
        fill="none" stroke="rgba(249,115,22,1)" strokeWidth="3"
        filter="url(#a3d-glow)" />
      {/* Far backboard */}
      <rect x="195" y="16" width="110" height="6" rx="2"
        fill="rgba(255,255,255,0.45)" />

      {/* ── BALL ── */}
      {hasBall && (
        <>
          {/* Shadow on floor */}
          <motion.ellipse
            cx={CW / 2} cy={ballY + ballR * 0.9}
            rx={ballR * 1.4} ry={ballR * 0.4}
            fill="rgba(0,0,0,0.4)"
            animate={animateBall ? { cy: ballY + ballR * 0.9 } : {}}
            transition={{ type: "spring", stiffness: 55, damping: 16 }}
          />
          {/* Glow */}
          <motion.circle
            cx={CW / 2} cy={ballY}
            r={ballR * 3}
            fill="url(#a3d-ballglow)"
            animate={animateBall ? { cy: ballY } : {}}
            transition={{ type: "spring", stiffness: 55, damping: 16 }}
          />
          {/* Ball */}
          <motion.circle
            cx={CW / 2} cy={ballY}
            r={ballR}
            fill="#84cc16"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
            filter="url(#a3d-glow)"
            animate={animateBall ? { cy: ballY } : {}}
            transition={{ type: "spring", stiffness: 55, damping: 16 }}
          />
          {/* Seam */}
          <motion.path
            d={`M ${CW / 2 - ballR + 2} ${ballY - 3} Q ${CW / 2} ${ballY - ballR - 2} ${CW / 2 + ballR - 2} ${ballY - 3}`}
            stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" fill="none"
            animate={animateBall ? { d: `M ${CW / 2 - ballR + 2} ${ballY - 3} Q ${CW / 2} ${ballY - ballR - 2} ${CW / 2 + ballR - 2} ${ballY - 3}` } : {}}
            transition={{ type: "spring", stiffness: 55, damping: 16 }}
          />
        </>
      )}
    </svg>
  );
}

export default function Arena3D({ ballProgress, animateBall = false }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

      {/* ── 3D perspective court floor ── */}
      <div
        style={{
          position: "absolute",
          bottom: "-2%",
          left: "50%",
          width: "230%",
          height: "88%",
          transform: "translateX(-50%) perspective(460px) rotateX(61deg)",
          transformOrigin: "50% 100%",
        }}
      >
        <CourtSVG ballProgress={ballProgress} animateBall={animateBall} />
      </div>

      {/* ── Arena atmosphere layers ── */}

      {/* Ceiling darkness + crowd */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "52%",
        background: "linear-gradient(to bottom, rgba(2,3,8,0.97) 0%, rgba(2,3,8,0.75) 55%, transparent 100%)",
      }} />

      {/* Far-end crowd darkness (behind far basket) */}
      <div style={{
        position: "absolute", top: "20%", left: 0, right: 0, height: "20%",
        background: "linear-gradient(to bottom, transparent 0%, rgba(2,3,8,0.35) 100%)",
      }} />

      {/* Arena ceiling spotlights */}
      <div style={{ position: "absolute", top: -80, left: "10%", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,210,75,0.2) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 460, height: 460, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,210,75,0.16) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", top: -80, right: "10%", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,210,75,0.2) 0%, transparent 60%)" }} />

      {/* Light beams */}
      <div style={{ position: "absolute", top: 0, left: "18%", width: 100, height: "62%",
        background: "linear-gradient(to bottom, rgba(255,210,75,0.07) 0%, transparent 100%)",
        transform: "skewX(-8deg)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", top: 0, left: "46%", width: 130, height: "68%",
        background: "linear-gradient(to bottom, rgba(255,210,75,0.06) 0%, transparent 100%)",
        mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", top: 0, right: "18%", width: 100, height: "62%",
        background: "linear-gradient(to bottom, rgba(255,210,75,0.07) 0%, transparent 100%)",
        transform: "skewX(8deg)", mixBlendMode: "screen" }} />

      {/* Side crowd vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 80% at 50% 38%, transparent 15%, rgba(2,3,8,0.78) 80%)",
      }} />

      {/* Bottom content fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "38%",
        background: "linear-gradient(to top, rgba(3,5,8,0.97) 0%, rgba(3,5,8,0.5) 60%, transparent 100%)",
      }} />
    </div>
  );
}
