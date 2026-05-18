"use client";
import { motion } from "framer-motion";

// ─── Shared Fall-Guys palette helpers ───────────────────────────────────────
const SKIN = { light: "#fde8c8", mid: "#f5b87a", dark: "#c97848" };
const SHOE = { light: "#2dd4bf", dark: "#0f766e" };
const inf  = { repeat: Infinity, ease: "easeInOut" as const };

// ─── One reusable gradient pack (unique IDs per call-site) ──────────────────
function Grads({
  id, bl, bm, bd,   // body light / mid / dark
}: { id: string; bl: string; bm: string; bd: string }) {
  return (
    <defs>
      {/* body */}
      <radialGradient id={`${id}b`} cx="32%" cy="27%" r="72%">
        <stop offset="0%"   stopColor={bl} />
        <stop offset="52%"  stopColor={bm} />
        <stop offset="100%" stopColor={bd} />
      </radialGradient>
      {/* head / skin */}
      <radialGradient id={`${id}h`} cx="34%" cy="28%" r="70%">
        <stop offset="0%"   stopColor={SKIN.light} />
        <stop offset="62%"  stopColor={SKIN.mid} />
        <stop offset="100%" stopColor={SKIN.dark} />
      </radialGradient>
      {/* shoe */}
      <radialGradient id={`${id}s`} cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor={SHOE.light} />
        <stop offset="100%" stopColor={SHOE.dark} />
      </radialGradient>
    </defs>
  );
}

// ─── Fall-Guy character as an SVG <g> group, fits a 200×250 local space ─────
// Callers use <g transform="translate(cx,cy)"> around it
interface FGProps {
  id: string;
  num?: string;
  eyes?: "happy" | "squint" | "sad" | "wide";
  pose?: "stand" | "sit" | "cut" | "point";
  bl: string; bm: string; bd: string;
}
function FG({ id, num = "23", eyes = "happy", bl, bm, bd }: FGProps) {
  const eb = `url(#${id}b)`;
  const eh = `url(#${id}h)`;
  const es = `url(#${id}s)`;

  // eye shape by mood
  const leftEye  = eyes === "squint" ? <ellipse cx="-18" cy="0" rx="13" ry="9" fill="white" /> : <ellipse cx="-18" cy="0" rx="13" ry="16" fill="white" />;
  const rightEye = eyes === "squint" ? <ellipse cx="18"  cy="0" rx="13" ry="9" fill="white" /> : <ellipse cx="18"  cy="0" rx="13" ry="16" fill="white" />;
  const smilePath = eyes === "sad"
    ? "M-18 9 Q0 3 18 9"
    : "M-18 9 Q0 22 18 9";

  return (
    <g>
      <Grads id={id} bl={bl} bm={bm} bd={bd} />

      {/* ── Floor shadow ── */}
      <ellipse cx="0" cy="118" rx="50" ry="9" fill="rgba(0,0,0,0.32)" />

      {/* ── Shoes ── */}
      <ellipse cx="-22" cy="103" rx="24" ry="10" fill={es} />
      <ellipse cx="22"  cy="103" rx="24" ry="10" fill={es} />
      <path d="M-34 102 Q-22 96 -10 102" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 102 Q22 96 34 102" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* ── Legs ── */}
      <ellipse cx="-22" cy="82" rx="19" ry="24" fill={eb} />
      <ellipse cx="22"  cy="82" rx="19" ry="24" fill={eb} />

      {/* ── Body ── */}
      <ellipse cx="0" cy="22" rx="60" ry="70" fill={eb} />
      {/* AO at hip */}
      <ellipse cx="0" cy="78" rx="55" ry="10" fill="rgba(0,0,0,0.13)" />
      {/* Specular */}
      <ellipse cx="-24" cy="-14" rx="20" ry="13" fill="rgba(255,255,255,0.27)" transform="rotate(-22,-24,-14)" />

      {/* Jersey number */}
      <text x="0" y="32" textAnchor="middle" fill="rgba(255,255,255,0.88)"
        fontSize="26" fontWeight="900" fontFamily="Arial Black, sans-serif">{num}</text>

      {/* ── Arms ── */}
      {/* Left */}
      <ellipse cx="-68" cy="8"  rx="17" ry="11" fill={eb} transform="rotate(-30,-68,8)" />
      <circle  cx="-76" cy="20" r="13" fill={eb} />
      <ellipse cx="-74" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(-20,-74,13)" />
      {/* Right */}
      <ellipse cx="68"  cy="8"  rx="17" ry="11" fill={eb} transform="rotate(30,68,8)" />
      <circle  cx="76"  cy="20" r="13" fill={eb} />
      <ellipse cx="74"  cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(20,74,13)" />

      {/* ── Head ── */}
      <circle cx="0" cy="-56" r="44" fill={eh} />
      <ellipse cx="-16" cy="-70" rx="16" ry="11" fill="rgba(255,255,255,0.32)" transform="rotate(-22,-16,-70)" />

      {/* Headband */}
      <path d="M-40 -74 Q0 -88 40 -74" stroke="#0f766e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-40 -74 Q0 -88 40 -74" stroke="#14b8a6" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-40 -74 Q0 -88 40 -74" stroke="#5eead4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.55" />

      {/* Eyes */}
      <g transform="translate(0,-56)">
        {leftEye}
        {rightEye}
        {/* pupils */}
        <circle cx="-15" cy="2"  r="7.5" fill="#1a2744" />
        <circle cx="21"  cy="2"  r="7.5" fill="#1a2744" />
        {/* shine */}
        <circle cx="-10" cy="-3" r="3.5" fill="white" />
        <circle cx="26"  cy="-3" r="3.5" fill="white" />
        <circle cx="-18" cy="6"  r="1.5" fill="rgba(255,255,255,0.5)" />
        <circle cx="18"  cy="6"  r="1.5" fill="rgba(255,255,255,0.5)" />
      </g>

      {/* Cheeks */}
      <circle cx="-32" cy="-44" r="8" fill="rgba(239,68,68,0.30)" />
      <circle cx="32"  cy="-44" r="8" fill="rgba(239,68,68,0.30)" />

      {/* Smile */}
      <path d={`M-18 ${-56+9+9} Q0 ${-56+9+9+12} 18 ${-56+9+9}`}
        stroke="#7c2d12" strokeWidth="2.8" fill="none" strokeLinecap="round"
        style={{ display: eyes === "sad" ? "none" : undefined }} />
      <path d={smilePath} transform={`translate(0,${-56+9})`}
        stroke="#7c2d12" strokeWidth="2.8" fill="none" strokeLinecap="round"
        style={{ display: eyes === "sad" ? undefined : "none" }} />
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Start Bench Cut
// Three players: standing (start ⭐), sitting (bench 🪑), walking away (cut ✂️)
// ════════════════════════════════════════════════════════════════════════════
export function SBCScene({ era = "alltime" }: { era?: string }) {
  const accent = era === "current" ? { bl: "#67e8f9", bm: "#0ea5e9", bd: "#075985" }
                                   : { bl: "#fdba74", bm: "#f97316", bd: "#c2400c" };
  const benchY = 220;
  return (
    <svg viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sbc-bench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c4882a" />
          <stop offset="100%" stopColor="#7c4b14" />
        </linearGradient>
        <radialGradient id="sbc-glow-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <filter id="sbc-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Floor ── */}
      <rect x="0" y="380" width="720" height="100" fill="rgba(255,255,255,0.03)" rx="4" />
      <line x1="0" y1="382" x2="720" y2="382" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* ── Bench ── */}
      {/* Legs */}
      <rect x="220" y={benchY+30} width="12" height="70" rx="6" fill="#6b4020" />
      <rect x="488" y={benchY+30} width="12" height="70" rx="6" fill="#6b4020" />
      {/* Seat */}
      <rect x="200" y={benchY} width="320" height="32" rx="8" fill="url(#sbc-bench)" />
      <rect x="200" y={benchY+26} width="320" height="6" rx="3" fill="#6b4020" />
      {/* Back rest */}
      <rect x="200" y={benchY-55} width="320" height="20" rx="6" fill="url(#sbc-bench)" />
      {/* Vertical supports */}
      <rect x="222" y={benchY-55} width="10" height="87" rx="5" fill="#8b5c2a" />
      <rect x="488" y={benchY-55} width="10" height="87" rx="5" fill="#8b5c2a" />

      {/* ══ Player 1: START — green jersey, standing triumphant ══ */}
      <motion.g transform="translate(130,300)"
        animate={{ y: [0, -14, 0] }} transition={{ ...inf, duration: 2.6 }}>
        <FG id="sbc1" num="1" bl="#86efac" bm="#22c55e" bd="#166534" />
        {/* Arms up — override default arms */}
        {/* Star halo */}
        <circle cx="0" cy="-110" r="22" fill="url(#sbc-glow-star)" />
        <text x="0" y="-100" textAnchor="middle" fontSize="28" style={{ filter: "drop-shadow(0 0 8px #fbbf24)" }}>⭐</text>
      </motion.g>

      {/* ══ Player 2: BENCH — yellow jersey, sitting, feet swing ══ */}
      {/* Body sits ON bench – shift player up so hips are at bench height */}
      <motion.g transform={`translate(360,${benchY-50})`}
        animate={{ y: [0, -6, 0] }} transition={{ ...inf, duration: 3.1, delay: 0.4 }}>
        <FG id="sbc2" num="7" eyes="happy" bl="#fde047" bm="#eab308" bd="#854d0e" />
        {/* Dangling feet (separate animated group) */}
        <motion.g transform="translate(0,100)"
          animate={{ rotate: [12, -12, 12] }}
          transition={{ ...inf, duration: 1.5 }}
          style={{ transformOrigin: "0px 0px" }}>
          <ellipse cx="-18" cy="22" rx="15" ry="20" fill="url(#sbc2b)" />
          <ellipse cx="18"  cy="22" rx="15" ry="20" fill="url(#sbc2b)" />
          <ellipse cx="-18" cy="38" rx="20" ry="9" fill="url(#sbc2s)" />
          <ellipse cx="18"  cy="38" rx="20" ry="9" fill="url(#sbc2s)" />
          <defs>
            <radialGradient id="sbc2b" cx="32%" cy="27%" r="72%">
              <stop offset="0%"   stopColor="#fde047" />
              <stop offset="52%"  stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
            <radialGradient id="sbc2s" cx="35%" cy="30%" r="70%">
              <stop offset="0%"   stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
            </radialGradient>
          </defs>
        </motion.g>
        <text x="0" y="-116" textAnchor="middle" fontSize="22">🪑</text>
      </motion.g>

      {/* ══ Player 3: CUT — red jersey, walking away, sad ══ */}
      <motion.g transform="translate(590,300)"
        animate={{ y: [0, -8, 0] }} transition={{ ...inf, duration: 2.2, delay: 0.8 }}>
        <FG id="sbc3" num="0" eyes="sad" bl="#fca5a5" bm="#ef4444" bd="#991b1b" />
        <text x="0" y="-116" textAnchor="middle" fontSize="22">✂️</text>
      </motion.g>

      {/* Labels */}
      <text x="130" y="440" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">START</text>
      <text x="360" y="440" textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">BENCH</text>
      <text x="590" y="440" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">CUT</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Guess Who
// Player with magnifying glass; mystery silhouette behind glass; floating ?'s
// ════════════════════════════════════════════════════════════════════════════
export function GuessWhoScene({ era = "alltime" }: { era?: string }) {
  const col = era === "current"
    ? { bl: "#c4b5fd", bm: "#8b5cf6", bd: "#4c1d95" }
    : { bl: "#fcd34d", bm: "#f59e0b", bd: "#78350f" };

  const qPos = [
    { x: 510, y: 90,  s: 1.2, d: 0 },
    { x: 560, y: 190, s: 0.9, d: 0.5 },
    { x: 490, y: 280, s: 1.0, d: 1.0 },
    { x: 100, y: 110, s: 0.8, d: 0.3 },
    { x: 60,  y: 240, s: 1.1, d: 0.7 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="gw-glass" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="rgba(167,243,208,0.18)" />
          <stop offset="100%" stopColor="rgba(20,184,166,0.05)" />
        </radialGradient>
        <filter id="gw-blur"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id="gw-glow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Floating question marks */}
      {qPos.map((q, i) => (
        <motion.text key={i} x={q.x} y={q.y}
          fontSize={28 * q.s} fill="rgba(255,255,255,0.22)" fontWeight="900" textAnchor="middle"
          animate={{ y: [q.y, q.y - 14, q.y], opacity: [0.22, 0.55, 0.22] }}
          transition={{ ...inf, duration: 2.4 + i * 0.4, delay: q.d }}>?</motion.text>
      ))}

      {/* Mystery silhouette (blurred body shape) */}
      <g filter="url(#gw-blur)" opacity="0.35">
        <ellipse cx="430" cy="210" rx="50" ry="65" fill="#94a3b8" />
        <circle cx="430" cy="130" r="38" fill="#94a3b8" />
      </g>

      {/* Magnifying glass */}
      <motion.g transform="translate(320,240)"
        animate={{ rotate: [-6, 6, -6] }} transition={{ ...inf, duration: 3.5 }}>
        {/* Handle */}
        <rect x="70" y="85" width="18" height="110" rx="9" fill="#374151"
          transform="rotate(40,70,85)" />
        <rect x="70" y="85" width="18" height="110" rx="9" fill="url(#gw-glass)"
          transform="rotate(40,70,85)" style={{ mixBlendMode: "screen" }} />
        {/* Glass circle */}
        <circle cx="0" cy="0" r="95" fill="url(#gw-glass)" />
        <circle cx="0" cy="0" r="95" fill="none" stroke="#14b8a6" strokeWidth="10" opacity="0.7" filter="url(#gw-glow)" />
        <circle cx="0" cy="0" r="95" fill="none" stroke="#2dd4bf" strokeWidth="4" opacity="0.9" />
        {/* Glass specular */}
        <ellipse cx="-30" cy="-35" rx="28" ry="20" fill="rgba(255,255,255,0.12)" transform="rotate(-25,-30,-35)" />
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(230,310)"
        animate={{ y: [0, -12, 0] }} transition={{ ...inf, duration: 2.8 }}>
        <FG id="gw1" num="?" eyes="squint" bl={col.bl} bm={col.bm} bd={col.bd} />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Stat Line Guesser
// Player at a floating stats board; clues reveal one by one
// ════════════════════════════════════════════════════════════════════════════
export function StatLineScene({ era = "alltime" }: { era?: string }) {
  const col = era === "current"
    ? { bl: "#6ee7b7", bm: "#10b981", bd: "#065f46" }
    : { bl: "#93c5fd", bm: "#3b82f6", bd: "#1e3a8a" };

  const stats = [
    { label: "PPG", value: "28.4", delay: 0 },
    { label: "RPG", value: "7.2",  delay: 0.3 },
    { label: "APG", value: "6.8",  delay: 0.6 },
    { label: "ERA", value: "• • •", delay: 0.9 },
    { label: "TEAM", value: "• • •", delay: 1.2 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sl-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
        <filter id="sl-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Floating stats board */}
      <motion.g transform="translate(340,120)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 3.2 }}>
        {/* Board shadow */}
        <rect x="-160" y="30" width="320" height="8" rx="4" fill="rgba(0,0,0,0.3)" />
        {/* Board */}
        <rect x="-160" y="-20" width="320" height="220" rx="16" fill="url(#sl-board)" />
        <rect x="-160" y="-20" width="320" height="220" rx="16" fill="none"
          stroke="#14b8a6" strokeWidth="1.5" opacity="0.5" />
        {/* Header */}
        <rect x="-160" y="-20" width="320" height="42" rx="16" fill="rgba(20,184,166,0.15)" />
        <text x="0" y="10" textAnchor="middle" fill="#2dd4bf" fontSize="13"
          fontWeight="800" fontFamily="monospace" letterSpacing="4">CAREER AVERAGES</text>
        {/* Scan line */}
        <rect x="-160" y="20" width="320" height="1" fill="rgba(20,184,166,0.3)" />

        {/* Stat rows */}
        {stats.map((s, i) => (
          <motion.g key={s.label} transform={`translate(0,${44 + i * 36})`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.delay, duration: 0.4 }}>
            <text x="-130" y="14" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700" fontFamily="monospace">{s.label}</text>
            <text x="140"  y="14" fill={s.value.includes("•") ? "rgba(255,255,255,0.25)" : "#f0fdf4"} fontSize="14"
              fontWeight="900" fontFamily="monospace" textAnchor="end">{s.value}</text>
            {i < stats.length - 1 && (
              <line x1="-145" y1="22" x2="145" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            )}
          </motion.g>
        ))}
      </motion.g>

      {/* Pointer stick */}
      <motion.g transform="translate(480,270)"
        animate={{ rotate: [-8, 2, -8] }} transition={{ ...inf, duration: 2.0 }}>
        <rect x="-4" y="-90" width="8" height="95" rx="4" fill="#374151" />
        <circle cx="0" cy="-90" r="6" fill="#14b8a6" />
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(200,340)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 2.6, delay: 0.3 }}>
        <FG id="sl1" num="99" eyes="squint" bl={col.bl} bm={col.bm} bd={col.bd} />
        {/* Glasses */}
        <g transform="translate(0,-56)">
          <rect x="-35" y="-10" width="26" height="18" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="9"   y="-10" width="26" height="18" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="-9" y1="-1" x2="9" y2="-1" stroke="#94a3b8" strokeWidth="2" />
          {/* Lens glare */}
          <ellipse cx="-25" cy="-5" rx="5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-20,-25,-5)" />
          <ellipse cx="19"  cy="-5" rx="5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-20,19,-5)" />
        </g>
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Lineup Guesser
// Five small players in basketball formation on a court diagram
// ════════════════════════════════════════════════════════════════════════════
export function LineupScene() {
  // 5 positions: PG, SG, SF, PF, C — colors vary
  const players = [
    { x: 320, y: 400, col: { bl: "#fde047", bm: "#eab308", bd: "#713f12" }, num: "PG", label: "PG" },
    { x: 180, y: 320, col: { bl: "#86efac", bm: "#22c55e", bd: "#14532d" }, num: "SG", label: "SG" },
    { x: 460, y: 320, col: { bl: "#93c5fd", bm: "#3b82f6", bd: "#1e3a8a" }, num: "SF", label: "SF" },
    { x: 230, y: 200, col: { bl: "#f9a8d4", bm: "#ec4899", bd: "#831843" }, num: "PF", label: "PF" },
    { x: 410, y: 200, col: { bl: "#fdba74", bm: "#f97316", bd: "#7c2d12" }, num: "C",  label: "C"  },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <filter id="lu-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* ── Half-court diagram (simplified isometric view) ── */}
      {/* Court floor */}
      <ellipse cx="320" cy="340" rx="300" ry="120" fill="rgba(255,255,255,0.025)" />
      {/* Center circle */}
      <ellipse cx="320" cy="340" rx="80" ry="32" fill="none" stroke="rgba(20,184,166,0.20)" strokeWidth="2" />
      {/* 3-point arc (ellipse, foreshortened) */}
      <path d="M100 420 Q320 220 540 420" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="2" strokeDasharray="6 4" />
      {/* Key / lane */}
      <path d="M240 220 L240 370 Q320 390 400 370 L400 220" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5" />
      {/* Free-throw line */}
      <path d="M240 250 Q320 268 400 250" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5" />
      {/* Basket */}
      <ellipse cx="320" cy="175" rx="18" ry="8" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="2.5" />
      <rect x="300" y="165" width="40" height="4" rx="2" fill="rgba(251,146,60,0.25)" />

      {/* Position lines connecting to positions */}
      {players.map((p, i) =>
        <line key={`l${i}`} x1="320" y1="300" x2={p.x} y2={p.y}
          stroke="rgba(20,184,166,0.10)" strokeWidth="1" strokeDasharray="4 4" />
      )}

      {/* Players — scaled down to fit the court */}
      {players.map((p, i) => (
        <motion.g key={p.label}
          transform={`translate(${p.x},${p.y}) scale(0.5)`}
          animate={{ y: [0, -10, 0] }}
          transition={{ ...inf, duration: 2.2 + i * 0.3, delay: i * 0.2 }}>
          <FG id={`lu${i}`} num={p.num} bl={p.col.bl} bm={p.col.bm} bd={p.col.bd} />
        </motion.g>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Timed: Name All Teams
// Player juggling a basketball, team badges orbiting, big stopwatch
// ════════════════════════════════════════════════════════════════════════════
export function TimedTeamsScene() {
  const badges = [
    { label: "LAL", color: "#FDB927", x: 480, y: 130, d: 0 },
    { label: "GSW", color: "#006BB6", x: 530, y: 250, d: 0.4 },
    { label: "BOS", color: "#007A33", x: 470, y: 360, d: 0.8 },
    { label: "NYK", color: "#F58426", x: 110, y: 140, d: 0.2 },
    { label: "CHI", color: "#CE1141", x: 80,  y: 280, d: 0.6 },
    { label: "MIA", color: "#98002E", x: 130, y: 390, d: 1.0 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      {/* Floating team badges */}
      {badges.map((b, i) => (
        <motion.g key={b.label}
          animate={{ y: [b.y, b.y - 14, b.y], rotate: [-5, 5, -5] }}
          transition={{ ...inf, duration: 2.5 + i * 0.3, delay: b.d }}>
          <rect x={b.x - 28} y={b.y - 18} width="56" height="36" rx="10"
            fill={b.color} opacity="0.85" />
          <rect x={b.x - 28} y={b.y - 18} width="56" height="36" rx="10"
            fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          {/* Specular */}
          <ellipse cx={b.x - 10} cy={b.y - 10} rx="14" ry="6" fill="rgba(255,255,255,0.25)" transform={`rotate(-20,${b.x - 10},${b.y - 10})`} />
          <text x={b.x} y={b.y + 5} textAnchor="middle" fill="white"
            fontSize="11" fontWeight="900" fontFamily="monospace">{b.label}</text>
        </motion.g>
      ))}

      {/* Stopwatch */}
      <motion.g transform="translate(510,80)"
        animate={{ rotate: [-3, 3, -3] }} transition={{ ...inf, duration: 2.0 }}>
        <circle cx="0" cy="0" r="48" fill="rgba(255,255,255,0.06)" />
        <circle cx="0" cy="0" r="48" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.6" />
        {/* Crown */}
        <rect x="-8" y="-54" width="16" height="10" rx="5" fill="#374151" />
        <rect x="-14" y="-60" width="28" height="8" rx="4" fill="#374151" />
        {/* Hands */}
        <motion.line x1="0" y1="0" x2="0" y2="-32" stroke="#f97316" strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: [0, 360] }} transition={{ ...inf, duration: 2, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }} />
        <line x1="0" y1="0" x2="22" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="4" fill="#14b8a6" />
        {/* Tick marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return <line key={i}
            x1={Math.cos(a) * 36} y1={Math.sin(a) * 36}
            x2={Math.cos(a) * 42} y2={Math.sin(a) * 42}
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" />;
        })}
      </motion.g>

      {/* Basketball floating above player */}
      <motion.g transform="translate(315,140)"
        animate={{ y: [0, -30, 0], rotate: [0, 360] }}
        transition={{ y: { ...inf, duration: 0.9, ease: "easeInOut" }, rotate: { ...inf, duration: 0.9, ease: "linear" } }}>
        <defs>
          <radialGradient id="tt-ball" cx="35%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="30" fill="url(#tt-ball)" />
        <ellipse cx="0" cy="0" rx="30" ry="30" fill="none" stroke="#7c2d12" strokeWidth="2" opacity="0.6" />
        <path d="M-30 0 Q0 -15 30 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M-30 0 Q0 15 30 0"  stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <line x1="0" y1="-30" x2="0" y2="30" stroke="#7c2d12" strokeWidth="2" opacity="0.6" />
        <ellipse cx="-10" cy="-10" rx="9" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-25,-10,-10)" />
      </motion.g>

      {/* Player with arms up */}
      <motion.g transform="translate(315,350)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 2.4 }}>
        <FG id="tt1" num="30" eyes="wide" bl="#c4b5fd" bm="#8b5cf6" bd="#4c1d95" />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Timed: Name Players Per Team
// Player at a roster board; player silhouettes getting checked off
// ════════════════════════════════════════════════════════════════════════════
export function TimedPlayersScene() {
  const roster = [
    { name: "LeBron James",     done: true },
    { name: "Anthony Davis",    done: true },
    { name: "Austin Reaves",    done: false },
    { name: "• • • • • • •",   done: false },
    { name: "• • • • • •",     done: false },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="tp-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
      </defs>

      {/* Clipboard / roster board */}
      <motion.g transform="translate(400,200)"
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ ...inf, duration: 3.0 }}>
        {/* Board */}
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="url(#tp-board)" />
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="none"
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Clip */}
        <rect x="-30" y="-118" width="60" height="28" rx="8" fill="#374151" />
        <rect x="-20" y="-113" width="40" height="18" rx="6" fill="#4b5563" />
        {/* Header */}
        <text x="0" y="-70" textAnchor="middle" fill="#14b8a6" fontSize="11"
          fontWeight="800" fontFamily="monospace" letterSpacing="3">ROSTER</text>
        <line x1="-110" y1="-56" x2="110" y2="-56" stroke="rgba(20,184,166,0.3)" strokeWidth="1" />

        {/* Roster rows */}
        {roster.map((r, i) => (
          <g key={i} transform={`translate(0,${-38 + i * 44})`}>
            {/* Check box */}
            <rect x="-110" y="-12" width="22" height="22" rx="6"
              fill={r.done ? "#22c55e" : "rgba(255,255,255,0.08)"}
              stroke={r.done ? "#16a34a" : "rgba(255,255,255,0.15)"} strokeWidth="1.5" />
            {r.done && <text x="-99" y="5" fill="white" fontSize="13" fontWeight="900" textAnchor="middle">✓</text>}
            {/* Name */}
            <text x="-78" y="5" fill={r.done ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)"}
              fontSize="12" fontWeight={r.done ? "700" : "400"} fontFamily="sans-serif">{r.name}</text>
            {i < roster.length - 1 &&
              <line x1="-110" y1="18" x2="110" y2="18" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />}
          </g>
        ))}
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(220,350)"
        animate={{ y: [0, -12, 0] }} transition={{ ...inf, duration: 2.5 }}>
        <FG id="tp1" num="10" eyes="happy" bl="#fdba74" bm="#f97316" bd="#c2400c" />
      </motion.g>

      {/* Floating team badge (Lakers) */}
      <motion.g
        animate={{ y: [80, 65, 80], rotate: [3, -3, 3] }}
        transition={{ ...inf, duration: 2.8 }}>
        <rect x="480" y="80" width="80" height="50" rx="14"
          fill="#FDB927" opacity="0.85" />
        <rect x="480" y="80" width="80" height="50" rx="14"
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <ellipse cx="497" cy="97" rx="12" ry="7" fill="rgba(255,255,255,0.28)" transform="rotate(-20,497,97)" />
        <text x="520" y="112" textAnchor="middle" fill="white"
          fontSize="12" fontWeight="900" fontFamily="monospace">LAL</text>
      </motion.g>
    </svg>
  );
}
