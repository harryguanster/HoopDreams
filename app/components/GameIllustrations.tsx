"use client";
import { motion } from "framer-motion";

const inf = { repeat: Infinity, ease: "easeInOut" as const };

// ─── NBA 2K-style chibi player ───────────────────────────────────────────────
// viewBox local space: 160 × 240. Origin at top-left of bounding box.
// cx=80 is horizontal center. Head sits 0–90, torso 90–160, legs 160–220, shoes 220–240.
interface ChibiProps {
  id: string;
  // Jersey
  jerseyTop: string;      // main jersey color
  jerseyBot: string;      // jersey shadow
  jerseyText: string;     // number + team text color
  number: string;
  teamText: string;
  // Shorts
  shortsTop: string;
  shortsBot: string;
  // Skin tone
  skinLight: string;
  skinMid: string;
  skinDark: string;
  // Hair
  hairColor?: string;
  hairStyle?: "none" | "short" | "locs" | "curly" | "fade";
  // Facial features
  beard?: boolean;
  // Pose
  pose?: "idle" | "arms-up" | "left-arm-up" | "dribble" | "sit" | "point-right";
}

function ChibiPlayer({
  id, jerseyTop, jerseyBot, jerseyText, number, teamText,
  shortsTop, shortsBot, skinLight, skinMid, skinDark,
  hairColor = "#1a0a00", hairStyle = "short",
  beard = false, pose = "idle",
}: ChibiProps) {
  const jg = `url(#${id}-j)`;
  const sg = `url(#${id}-s)`;
  const sk = `url(#${id}-sk)`;
  const shg = `url(#${id}-sh)`;

  // Arm positions by pose
  const arms = {
    idle: {
      lx: 18, ly: 108, lrx: 8, lry: 12, lrot: -30,
      rx: 142, ry: 108, rrx: 8, rry: 12, rrot: 30,
      lHandX: 10, lHandY: 122, rHandX: 150, rHandY: 122,
    },
    "arms-up": {
      lx: 18, ly: 88, lrx: 8, lry: 12, lrot: -60,
      rx: 142, ry: 88, rrx: 8, rry: 12, rrot: 60,
      lHandX: 6, lHandY: 72, rHandX: 154, rHandY: 72,
    },
    "left-arm-up": {
      lx: 18, ly: 88, lrx: 8, lry: 12, lrot: -60,
      rx: 142, ry: 108, rrx: 8, rry: 12, rrot: 30,
      lHandX: 6, lHandY: 72, rHandX: 150, rHandY: 122,
    },
    dribble: {
      lx: 18, ly: 108, lrx: 8, lry: 12, lrot: -30,
      rx: 142, ry: 118, rrx: 8, rry: 12, rrot: 50,
      lHandX: 10, lHandY: 122, rHandX: 154, rHandY: 134,
    },
    sit: {
      lx: 20, ly: 115, lrx: 8, lry: 12, lrot: -20,
      rx: 140, ry: 115, rrx: 8, rry: 12, rrot: 20,
      lHandX: 12, lHandY: 128, rHandX: 148, rHandY: 128,
    },
    "point-right": {
      lx: 18, ly: 108, lrx: 8, lry: 12, lrot: -30,
      rx: 148, ry: 98, rrx: 14, rry: 8, rrot: -5,
      lHandX: 10, lHandY: 122, rHandX: 165, rHandY: 95,
    },
  }[pose] ?? {
    lx: 18, ly: 108, lrx: 8, lry: 12, lrot: -30,
    rx: 142, ry: 108, rrx: 8, rry: 12, rrot: 30,
    lHandX: 10, lHandY: 122, rHandX: 150, rHandY: 122,
  };

  const isSit = pose === "sit";

  return (
    <g>
      <defs>
        {/* Jersey gradient */}
        <linearGradient id={`${id}-j`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={jerseyTop} />
          <stop offset="100%" stopColor={jerseyBot} />
        </linearGradient>
        {/* Shorts gradient */}
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shortsTop} />
          <stop offset="100%" stopColor={shortsBot} />
        </linearGradient>
        {/* Skin gradient */}
        <radialGradient id={`${id}-sk`} cx="38%" cy="32%" r="66%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="55%" stopColor={skinMid} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        {/* Shoe gradient */}
        <radialGradient id={`${id}-sh`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
      </defs>

      {/* ── Floor shadow ── */}
      {!isSit && <ellipse cx="80" cy="242" rx="46" ry="10" fill="rgba(0,0,0,0.28)" />}

      {/* ── Shoes ── */}
      {!isSit && (
        <>
          <ellipse cx="58" cy="230" rx="26" ry="11" fill={shg} />
          <ellipse cx="102" cy="230" rx="26" ry="11" fill={shg} />
          {/* Shoe sole stripe */}
          <path d="M34 229 Q58 222 82 229" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M78 229 Q102 222 126 229" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* White ankle socks */}
          <rect x="44" y="208" width="28" height="14" rx="7" fill="#e2e8f0" />
          <rect x="88" y="208" width="28" height="14" rx="7" fill="#e2e8f0" />
        </>
      )}

      {/* ── Legs / Shorts ── */}
      {!isSit ? (
        <>
          <rect x="44" y="165" width="30" height="48" rx="12" fill={sg} />
          <rect x="86" y="165" width="30" height="48" rx="12" fill={sg} />
          {/* Shorts seam */}
          <line x1="80" y1="165" x2="80" y2="180" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
          {/* Shorts hem */}
          <rect x="42" y="196" width="34" height="6" rx="3" fill={shortsBot} opacity="0.7" />
          <rect x="84" y="196" width="34" height="6" rx="3" fill={shortsBot} opacity="0.7" />
        </>
      ) : (
        /* Sitting — legs dangle forward */
        <>
          <rect x="46" y="162" width="28" height="40" rx="10" fill={sg} transform="rotate(15 60 182)" />
          <rect x="86" y="162" width="28" height="40" rx="10" fill={sg} transform="rotate(-15 100 182)" />
        </>
      )}

      {/* ── Arms (behind torso drawn before) ── */}
      <ellipse cx={arms.lx} cy={arms.ly} rx={arms.lrx} ry={arms.lry} fill={sk} transform={`rotate(${arms.lrot} ${arms.lx} ${arms.ly})`} />
      <circle cx={arms.lHandX} cy={arms.lHandY} r="10" fill={sk} />
      <ellipse cx={arms.rx} cy={arms.ry} rx={arms.rrx} ry={arms.rry} fill={sk} transform={`rotate(${arms.rrot} ${arms.rx} ${arms.ry})`} />
      <circle cx={arms.rHandX} cy={arms.rHandY} r="10" fill={sk} />

      {/* ── Jersey / Torso ── */}
      <rect x="38" y="102" width="84" height="68" rx="14" fill={jg} />
      {/* Jersey collar */}
      <path d="M60 102 Q80 114 100 102" fill="none" stroke={jerseyBot} strokeWidth="3" strokeLinecap="round" />
      {/* Jersey number */}
      <text x="80" y="148" textAnchor="middle" fill={jerseyText}
        fontSize="26" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif"
        opacity="0.9">{number}</text>
      {/* Team name on chest */}
      <text x="80" y="120" textAnchor="middle" fill={jerseyText}
        fontSize="9" fontWeight="800" fontFamily="'Arial Black', Arial, sans-serif"
        letterSpacing="1.5" opacity="0.75">{teamText}</text>
      {/* Jersey side stripes */}
      <rect x="38" y="108" width="10" height="56" rx="5" fill="rgba(255,255,255,0.08)" />
      <rect x="112" y="108" width="10" height="56" rx="5" fill="rgba(255,255,255,0.08)" />
      {/* Jersey specular */}
      <ellipse cx="58" cy="112" rx="16" ry="9" fill="rgba(255,255,255,0.14)" transform="rotate(-18 58 112)" />

      {/* ── Neck ── */}
      <rect x="70" y="88" width="20" height="18" rx="8" fill={sk} />

      {/* ── Big cartoon head ── */}
      <ellipse cx="80" cy="62" rx="46" ry="48" fill={sk} />
      {/* Head specular */}
      <ellipse cx="60" cy="44" rx="18" ry="12" fill="rgba(255,255,255,0.18)" transform="rotate(-22 60 44)" />

      {/* ── Hair ── */}
      {hairStyle === "short" && (
        <path d="M34 55 Q38 20 80 16 Q122 20 126 55 Q110 30 80 28 Q50 30 34 55 Z"
          fill={hairColor} />
      )}
      {hairStyle === "fade" && (
        <>
          <path d="M36 58 Q40 22 80 18 Q120 22 124 58 Q108 32 80 30 Q52 32 36 58 Z"
            fill={hairColor} />
          <path d="M36 58 Q40 46 50 42" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M124 58 Q120 46 110 42" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {hairStyle === "locs" && (
        <>
          <path d="M36 60 Q40 22 80 18 Q120 22 124 60 Q108 34 80 30 Q52 34 36 60 Z"
            fill={hairColor} />
          {/* Individual locs */}
          {[34, 42, 52, 68, 80, 92, 108, 118, 126].map((x, i) => (
            <path key={i} d={`M${x} ${52 + (i % 3) * 4} Q${x - 4 + i} ${72 + i * 3} ${x - 2 + i} ${86 + i * 2}`}
              stroke={hairColor} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          ))}
        </>
      )}
      {hairStyle === "curly" && (
        <>
          <path d="M34 60 Q38 20 80 16 Q122 20 126 60 Q110 28 80 26 Q50 28 34 60 Z"
            fill={hairColor} />
          {/* Curly texture */}
          {[42, 56, 70, 84, 98, 112].map((x, i) => (
            <circle key={i} cx={x} cy={22 + (i % 2) * 6} r="8"
              fill={hairColor} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
        </>
      )}
      {/* hairStyle === "none" → bald, no hair drawn */}

      {/* ── Ears ── */}
      <ellipse cx="34" cy="64" rx="8" ry="10" fill={sk} />
      <ellipse cx="126" cy="64" rx="8" ry="10" fill={sk} />
      <ellipse cx="34" cy="64" rx="4" ry="6" fill={skinDark} opacity="0.3" />
      <ellipse cx="126" cy="64" rx="4" ry="6" fill={skinDark} opacity="0.3" />

      {/* ── Eyes ── */}
      {/* Eye whites */}
      <ellipse cx="62" cy="62" rx="13" ry="14" fill="white" />
      <ellipse cx="98" cy="62" rx="13" ry="14" fill="white" />
      {/* Irises */}
      <circle cx="64" cy="64" r="8" fill="#1a2744" />
      <circle cx="100" cy="64" r="8" fill="#1a2744" />
      {/* Pupils */}
      <circle cx="65" cy="65" r="4.5" fill="#050a14" />
      <circle cx="101" cy="65" r="4.5" fill="#050a14" />
      {/* Eye shine */}
      <circle cx="68" cy="60" r="3" fill="white" />
      <circle cx="104" cy="60" r="3" fill="white" />
      <circle cx="62" cy="67" r="1.5" fill="rgba(255,255,255,0.45)" />
      <circle cx="98" cy="67" r="1.5" fill="rgba(255,255,255,0.45)" />
      {/* Eyebrows */}
      <path d="M50 50 Q62 44 74 50" stroke={hairColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M86 50 Q98 44 110 50" stroke={hairColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* ── Nose ── */}
      <path d="M76 70 Q80 78 84 70" stroke={skinDark} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* ── Mouth / smile ── */}
      <path d="M64 82 Q80 94 96 82" stroke={skinDark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M68 82 Q80 90 92 82" fill="white" stroke="none" />
      <line x1="80" y1="82" x2="80" y2="89" stroke={skinDark} strokeWidth="1" opacity="0.4" />

      {/* ── Cheeks ── */}
      <circle cx="48" cy="74" r="10" fill="rgba(239,68,68,0.22)" />
      <circle cx="112" cy="74" r="10" fill="rgba(239,68,68,0.22)" />

      {/* ── Beard (optional) ── */}
      {beard && (
        <path d="M52 80 Q56 96 80 100 Q104 96 108 80 Q98 90 80 92 Q62 90 52 80 Z"
          fill={hairColor} opacity="0.7" />
      )}
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Start Bench Cut
// Michael Jordan (START), random bench player, cut player walking off
// ════════════════════════════════════════════════════════════════════════════
export function SBCScene({ era = "alltime" }: { era?: string }) {
  const benchY = 310;

  const players = era === "current"
    ? [
        // Start: Luka Doncic — Mavs blue #77
        { id: "sbc-a", jerseyTop: "#0053BC", jerseyBot: "#003d8a", jerseyText: "#C4CED4",
          number: "77", teamText: "MAVS", shortsTop: "#0053BC", shortsBot: "#003d8a",
          skinLight: "#ffe0bc", skinMid: "#e8b88a", skinDark: "#c48a5c",
          hairColor: "#3a1f0a", hairStyle: "short" as const, beard: false, pose: "arms-up" as const },
        // Bench: random player — Warriors blue
        { id: "sbc-b", jerseyTop: "#1D428A", jerseyBot: "#152e5e", jerseyText: "#FFC72C",
          number: "11", teamText: "GSW", shortsTop: "#1D428A", shortsBot: "#152e5e",
          skinLight: "#fddcb0", skinMid: "#e0a870", skinDark: "#b87840",
          hairColor: "#1a0a00", hairStyle: "fade" as const, beard: false, pose: "sit" as const },
        // Cut: player walking off
        { id: "sbc-c", jerseyTop: "#CE1141", jerseyBot: "#8b0d2c", jerseyText: "white",
          number: "0", teamText: "CHI", shortsTop: "#CE1141", shortsBot: "#8b0d2c",
          skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
          hairColor: "#0a0504", hairStyle: "fade" as const, beard: false, pose: "idle" as const },
      ]
    : [
        // Start: Michael Jordan — Bulls red #23
        { id: "sbc-a", jerseyTop: "#CE1141", jerseyBot: "#8b0d2c", jerseyText: "white",
          number: "23", teamText: "BULLS", shortsTop: "#CE1141", shortsBot: "#8b0d2c",
          skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
          hairColor: "#0a0504", hairStyle: "none" as const, beard: false, pose: "arms-up" as const },
        // Bench: Scottie Pippen — Bulls #33
        { id: "sbc-b", jerseyTop: "#CE1141", jerseyBot: "#8b0d2c", jerseyText: "white",
          number: "33", teamText: "BULLS", shortsTop: "#CE1141", shortsBot: "#8b0d2c",
          skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
          hairColor: "#0a0504", hairStyle: "fade" as const, beard: false, pose: "sit" as const },
        // Cut
        { id: "sbc-c", jerseyTop: "#1D428A", jerseyBot: "#152e5e", jerseyText: "#FFC72C",
          number: "8", teamText: "LAL", shortsTop: "#552583", shortsBot: "#3a1a5e",
          skinLight: "#fddcb0", skinMid: "#e0a870", skinDark: "#b87840",
          hairColor: "#1a0a00", hairStyle: "short" as const, beard: false, pose: "idle" as const },
      ];

  return (
    <svg viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sbc-bench-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4882a" />
          <stop offset="100%" stopColor="#7c4b14" />
        </linearGradient>
        <radialGradient id="sbc-star-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor */}
      <rect x="0" y="420" width="720" height="60" fill="rgba(255,255,255,0.025)" rx="4" />
      <line x1="0" y1="422" x2="720" y2="422" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Bench */}
      <rect x="230" y={benchY + 32} width="12" height="70" rx="6" fill="#6b4020" />
      <rect x="478" y={benchY + 32} width="12" height="70" rx="6" fill="#6b4020" />
      <rect x="210" y={benchY} width="300" height="32" rx="8" fill="url(#sbc-bench-g)" />
      <rect x="210" y={benchY - 55} width="300" height="20" rx="6" fill="url(#sbc-bench-g)" />
      <rect x="230" y={benchY - 55} width="10" height="87" rx="5" fill="#8b5c2a" />
      <rect x="480" y={benchY - 55} width="10" height="87" rx="5" fill="#8b5c2a" />

      {/* START player */}
      <motion.g transform="translate(80,200) scale(0.72)"
        animate={{ y: [0, -16, 0] }} transition={{ ...inf, duration: 2.6 }}>
        <ChibiPlayer {...players[0]} />
        <circle cx="80" cy="-30" r="28" fill="url(#sbc-star-g)" />
        <text x="80" y="-15" textAnchor="middle" fontSize="34" style={{ filter: "drop-shadow(0 0 10px #fbbf24)" }}>⭐</text>
      </motion.g>

      {/* BENCH player — sitting on bench */}
      <motion.g transform={`translate(240,${benchY - 110}) scale(0.68)`}
        animate={{ y: [0, -8, 0] }} transition={{ ...inf, duration: 3.1, delay: 0.4 }}>
        <ChibiPlayer {...players[1]} />
        {/* Swinging feet */}
        <motion.g transform="translate(0,190)"
          animate={{ rotate: [14, -14, 14] }}
          transition={{ ...inf, duration: 1.6 }}
          style={{ transformOrigin: "80px 0px" }}>
          <ellipse cx="55" cy="30" rx="16" ry="28" fill={players[1].shortsTop} />
          <ellipse cx="105" cy="30" rx="16" ry="28" fill={players[1].shortsTop} />
          <ellipse cx="55" cy="55" rx="22" ry="10" fill="#222" />
          <ellipse cx="105" cy="55" rx="22" ry="10" fill="#222" />
        </motion.g>
        <text x="80" y="-25" textAnchor="middle" fontSize="24">🪑</text>
      </motion.g>

      {/* CUT player */}
      <motion.g transform="translate(490,200) scale(0.72)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 2.2, delay: 0.8 }}>
        <ChibiPlayer {...players[2]} />
        <text x="80" y="-25" textAnchor="middle" fontSize="24">✂️</text>
      </motion.g>

      {/* Labels */}
      <text x="138" y="455" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">START</text>
      <text x="404" y="455" textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">BENCH</text>
      <text x="633" y="455" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">CUT</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Guess Who
// ════════════════════════════════════════════════════════════════════════════
export function GuessWhoScene({ era = "alltime" }: { era?: string }) {
  const player = era === "current"
    ? { id: "gw-p", jerseyTop: "#1D428A", jerseyBot: "#152e5e", jerseyText: "#FFC72C",
        number: "30", teamText: "GSW", shortsTop: "#1D428A", shortsBot: "#152e5e",
        skinLight: "#fddcb0", skinMid: "#e0a870", skinDark: "#b87840",
        hairColor: "#1a0a00", hairStyle: "fade" as const, beard: false, pose: "idle" as const }
    : { id: "gw-p", jerseyTop: "#FDB927", jerseyBot: "#c48a10", jerseyText: "#552583",
        number: "23", teamText: "LAKERS", shortsTop: "#552583", shortsBot: "#3a1a5e",
        skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
        hairColor: "#0a0504", hairStyle: "none" as const, beard: false, pose: "idle" as const };

  const qPos = [
    { x: 520, y: 80,  s: 1.3, d: 0 },
    { x: 570, y: 200, s: 0.9, d: 0.5 },
    { x: 500, y: 310, s: 1.0, d: 1.0 },
    { x: 90,  y: 100, s: 0.85, d: 0.3 },
    { x: 55,  y: 250, s: 1.1, d: 0.7 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="gw-glass" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(167,243,208,0.18)" />
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
          fontSize={30 * q.s} fill="rgba(255,255,255,0.22)" fontWeight="900" textAnchor="middle"
          animate={{ y: [q.y, q.y - 14, q.y], opacity: [0.22, 0.55, 0.22] }}
          transition={{ ...inf, duration: 2.4 + i * 0.4, delay: q.d }}>?</motion.text>
      ))}

      {/* Mystery silhouette behind magnifying glass */}
      <g filter="url(#gw-blur)" opacity="0.3">
        <ellipse cx="430" cy="220" rx="55" ry="70" fill="#94a3b8" />
        <circle cx="430" cy="130" r="45" fill="#94a3b8" />
      </g>

      {/* Magnifying glass */}
      <motion.g transform="translate(320,240)"
        animate={{ rotate: [-6, 6, -6] }} transition={{ ...inf, duration: 3.5 }}>
        <rect x="65" y="80" width="18" height="115" rx="9" fill="#374151" transform="rotate(40,65,80)" />
        <circle cx="0" cy="0" r="98" fill="url(#gw-glass)" />
        <circle cx="0" cy="0" r="98" fill="none" stroke="#14b8a6" strokeWidth="10" opacity="0.7" filter="url(#gw-glow)" />
        <circle cx="0" cy="0" r="98" fill="none" stroke="#2dd4bf" strokeWidth="4" opacity="0.9" />
        <ellipse cx="-32" cy="-36" rx="30" ry="20" fill="rgba(255,255,255,0.11)" transform="rotate(-25,-32,-36)" />
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(136,230) scale(0.76)"
        animate={{ y: [0, -14, 0] }} transition={{ ...inf, duration: 2.8 }}>
        <ChibiPlayer {...player} />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Stat Line Guesser
// ════════════════════════════════════════════════════════════════════════════
export function StatLineScene({ era = "alltime" }: { era?: string }) {
  const player = era === "current"
    ? { id: "sl-p", jerseyTop: "#1D428A", jerseyBot: "#152e5e", jerseyText: "white",
        number: "15", teamText: "DEN", shortsTop: "#FFC72C", shortsBot: "#c49a10",
        skinLight: "#ffe0c0", skinMid: "#e8b888", skinDark: "#c08850",
        hairColor: "#5a3010", hairStyle: "curly" as const, beard: true, pose: "point-right" as const }
    : { id: "sl-p", jerseyTop: "#007A33", jerseyBot: "#004d20", jerseyText: "white",
        number: "34", teamText: "BUCKS", shortsTop: "#007A33", shortsBot: "#004d20",
        skinLight: "#1a1006", skinMid: "#140c04", skinDark: "#0e0802",
        hairColor: "#0a0403", hairStyle: "locs" as const, beard: false, pose: "point-right" as const };

  const stats = [
    { label: "PPG", value: "32.1", delay: 0 },
    { label: "RPG", value: "9.4",  delay: 0.25 },
    { label: "APG", value: "5.6",  delay: 0.5 },
    { label: "ERA", value: "• • •", delay: 0.75 },
    { label: "TEAM", value: "• • •", delay: 1.0 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sl-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
        <filter id="sl-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Stats board */}
      <motion.g transform="translate(410,130)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 3.2 }}>
        <rect x="-145" y="20" width="290" height="8" rx="4" fill="rgba(0,0,0,0.3)" />
        <rect x="-145" y="-20" width="290" height="215" rx="16" fill="url(#sl-board)" />
        <rect x="-145" y="-20" width="290" height="215" rx="16" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5" />
        <rect x="-145" y="-20" width="290" height="44" rx="16" fill="rgba(20,184,166,0.15)" />
        <text x="0" y="12" textAnchor="middle" fill="#2dd4bf" fontSize="13"
          fontWeight="800" fontFamily="monospace" letterSpacing="4">CAREER STATS</text>
        <rect x="-145" y="22" width="290" height="1" fill="rgba(20,184,166,0.3)" />
        {stats.map((s, i) => (
          <motion.g key={s.label} transform={`translate(0,${46 + i * 36})`}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.delay, duration: 0.4 }}>
            <text x="-120" y="14" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700" fontFamily="monospace">{s.label}</text>
            <text x="130" y="14" fill={s.value.includes("•") ? "rgba(255,255,255,0.22)" : "#f0fdf4"} fontSize="14"
              fontWeight="900" fontFamily="monospace" textAnchor="end">{s.value}</text>
            {i < stats.length - 1 && <line x1="-130" y1="22" x2="130" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />}
          </motion.g>
        ))}
      </motion.g>

      {/* Pointer stick */}
      <motion.g transform="translate(265,278)"
        animate={{ rotate: [-8, 2, -8] }} transition={{ ...inf, duration: 2.0 }}>
        <rect x="-4" y="-80" width="8" height="85" rx="4" fill="#374151" />
        <circle cx="0" cy="-80" r="6" fill="#14b8a6" />
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(112,220) scale(0.80)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 2.6, delay: 0.3 }}>
        <ChibiPlayer {...player} />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Lineup Guesser
// ════════════════════════════════════════════════════════════════════════════
export function LineupScene() {
  const players = [
    { x: 320, y: 390, scale: 0.48, delay: 0,
      p: { id: "lu-0", jerseyTop: "#CE1141", jerseyBot: "#8b0d2c", jerseyText: "white",
           number: "PG", teamText: "POINT", shortsTop: "#CE1141", shortsBot: "#8b0d2c",
           skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
           hairColor: "#0a0504", hairStyle: "none" as const, pose: "idle" as const } },
    { x: 175, y: 315, scale: 0.46, delay: 0.15,
      p: { id: "lu-1", jerseyTop: "#007A33", jerseyBot: "#004d20", jerseyText: "white",
           number: "SG", teamText: "SHOOT", shortsTop: "#007A33", shortsBot: "#004d20",
           skinLight: "#fddcb0", skinMid: "#e0a870", skinDark: "#b87840",
           hairColor: "#1a0a00", hairStyle: "fade" as const, pose: "idle" as const } },
    { x: 465, y: 315, scale: 0.46, delay: 0.3,
      p: { id: "lu-2", jerseyTop: "#1D428A", jerseyBot: "#152e5e", jerseyText: "#FFC72C",
           number: "SF", teamText: "SMALL", shortsTop: "#1D428A", shortsBot: "#152e5e",
           skinLight: "#ffe0bc", skinMid: "#e8b88a", skinDark: "#c48a5c",
           hairColor: "#3a1f0a", hairStyle: "short" as const, pose: "idle" as const } },
    { x: 225, y: 195, scale: 0.44, delay: 0.45,
      p: { id: "lu-3", jerseyTop: "#F58426", jerseyBot: "#b85e10", jerseyText: "white",
           number: "PF", teamText: "POWER", shortsTop: "#006BB6", shortsBot: "#004a80",
           skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
           hairColor: "#0a0504", hairStyle: "short" as const, pose: "idle" as const } },
    { x: 415, y: 195, scale: 0.44, delay: 0.6,
      p: { id: "lu-4", jerseyTop: "#FDB927", jerseyBot: "#c48a10", jerseyText: "#552583",
           number: "C", teamText: "CENTER", shortsTop: "#552583", shortsBot: "#3a1a5e",
           skinLight: "#ffe0c0", skinMid: "#e8b888", skinDark: "#c08850",
           hairColor: "#5a3010", hairStyle: "curly" as const, beard: true, pose: "idle" as const } },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <filter id="lu-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Court diagram */}
      <ellipse cx="320" cy="340" rx="290" ry="110" fill="rgba(255,255,255,0.025)" />
      <ellipse cx="320" cy="340" rx="75" ry="30" fill="none" stroke="rgba(20,184,166,0.20)" strokeWidth="2" />
      <path d="M100 420 Q320 215 540 420" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M245 215 L245 370 Q320 390 395 370 L395 215" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5" />
      <ellipse cx="320" cy="170" rx="18" ry="8" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="2.5" />
      {players.map((p, i) => (
        <line key={`l${i}`} x1="320" y1="295" x2={p.x} y2={p.y}
          stroke="rgba(20,184,166,0.10)" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      {players.map((p, i) => (
        <motion.g key={p.p.id} transform={`translate(${p.x - 80 * p.scale}, ${p.y - 120 * p.scale}) scale(${p.scale})`}
          animate={{ y: [0, -10, 0] }}
          transition={{ ...inf, duration: 2.2 + i * 0.3, delay: p.delay }}>
          <ChibiPlayer {...p.p} beard={p.p.beard ?? false} />
        </motion.g>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Timed: Name All Teams
// ════════════════════════════════════════════════════════════════════════════
export function TimedTeamsScene() {
  const badges = [
    { label: "LAL", color: "#FDB927", x: 490, y: 120, d: 0 },
    { label: "GSW", color: "#006BB6", x: 545, y: 245, d: 0.4 },
    { label: "BOS", color: "#007A33", x: 480, y: 365, d: 0.8 },
    { label: "NYK", color: "#F58426", x: 98,  y: 130, d: 0.2 },
    { label: "CHI", color: "#CE1141", x: 70,  y: 270, d: 0.6 },
    { label: "MIA", color: "#98002E", x: 120, y: 390, d: 1.0 },
  ];

  const player = {
    id: "tt-p", jerseyTop: "#552583", jerseyBot: "#3a1a5e", jerseyText: "#FDB927",
    number: "23", teamText: "LAKERS", shortsTop: "#FDB927", shortsBot: "#c48a10",
    skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
    hairColor: "#0a0504", hairStyle: "none" as const, beard: false, pose: "arms-up" as const,
  };

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="tt-ball" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>

      {/* Team badges */}
      {badges.map((b, i) => (
        <motion.g key={b.label}
          animate={{ y: [b.y, b.y - 14, b.y], rotate: [-5, 5, -5] }}
          transition={{ ...inf, duration: 2.5 + i * 0.3, delay: b.d }}>
          <rect x={b.x - 30} y={b.y - 20} width="60" height="40" rx="10" fill={b.color} opacity="0.88" />
          <rect x={b.x - 30} y={b.y - 20} width="60" height="40" rx="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <ellipse cx={b.x - 10} cy={b.y - 10} rx="15" ry="7" fill="rgba(255,255,255,0.22)" transform={`rotate(-20,${b.x - 10},${b.y - 10})`} />
          <text x={b.x} y={b.y + 6} textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">{b.label}</text>
        </motion.g>
      ))}

      {/* Stopwatch */}
      <motion.g transform="translate(510,82)"
        animate={{ rotate: [-3, 3, -3] }} transition={{ ...inf, duration: 2.0 }}>
        <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.06)" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.6" />
        <rect x="-8" y="-56" width="16" height="10" rx="5" fill="#374151" />
        <rect x="-14" y="-62" width="28" height="8" rx="4" fill="#374151" />
        <motion.line x1="0" y1="0" x2="0" y2="-34" stroke="#f97316" strokeWidth="3"
          strokeLinecap="round" animate={{ rotate: [0, 360] }}
          transition={{ ...inf, duration: 2, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }} />
        <line x1="0" y1="0" x2="24" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="4" fill="#14b8a6" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={Math.cos(a) * 38} y1={Math.sin(a) * 38} x2={Math.cos(a) * 44} y2={Math.sin(a) * 44} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />;
        })}
      </motion.g>

      {/* Spinning basketball */}
      <motion.g transform="translate(315,128)"
        animate={{ y: [0, -32, 0], rotate: [0, 360] }}
        transition={{ y: { ...inf, duration: 0.9, ease: "easeInOut" }, rotate: { ...inf, duration: 0.9, ease: "linear" } }}>
        <circle cx="0" cy="0" r="32" fill="url(#tt-ball)" />
        <path d="M-32 0 Q0 -16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M-32 0 Q0 16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <line x1="0" y1="-32" x2="0" y2="32" stroke="#7c2d12" strokeWidth="2" opacity="0.6" />
        <ellipse cx="-10" cy="-10" rx="10" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-25,-10,-10)" />
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(196,228) scale(0.80)"
        animate={{ y: [0, -10, 0] }} transition={{ ...inf, duration: 2.4 }}>
        <ChibiPlayer {...player} />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Timed: Name Players Per Team
// ════════════════════════════════════════════════════════════════════════════
export function TimedPlayersScene() {
  const roster = [
    { name: "LeBron James",   done: true },
    { name: "Anthony Davis",  done: true },
    { name: "Austin Reaves",  done: false },
    { name: "• • • • • •",   done: false },
    { name: "• • • • •",     done: false },
  ];

  const player = {
    id: "tp-p", jerseyTop: "#FDB927", jerseyBot: "#c48a10", jerseyText: "#552583",
    number: "23", teamText: "LAKERS", shortsTop: "#552583", shortsBot: "#3a1a5e",
    skinLight: "#4a2c1a", skinMid: "#3a2016", skinDark: "#2a1610",
    hairColor: "#0a0504", hairStyle: "none" as const, beard: false, pose: "idle" as const,
  };

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="tp-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
      </defs>

      {/* Clipboard */}
      <motion.g transform="translate(420,210)"
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ ...inf, duration: 3.0 }}>
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="url(#tp-board)" />
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="-30" y="-118" width="60" height="28" rx="8" fill="#374151" />
        <rect x="-20" y="-113" width="40" height="18" rx="6" fill="#4b5563" />
        <text x="0" y="-70" textAnchor="middle" fill="#14b8a6" fontSize="11"
          fontWeight="800" fontFamily="monospace" letterSpacing="3">ROSTER</text>
        <line x1="-110" y1="-56" x2="110" y2="-56" stroke="rgba(20,184,166,0.3)" strokeWidth="1" />
        {roster.map((r, i) => (
          <g key={i} transform={`translate(0,${-38 + i * 44})`}>
            <rect x="-110" y="-12" width="22" height="22" rx="6"
              fill={r.done ? "#22c55e" : "rgba(255,255,255,0.08)"}
              stroke={r.done ? "#16a34a" : "rgba(255,255,255,0.15)"} strokeWidth="1.5" />
            {r.done && <text x="-99" y="5" fill="white" fontSize="13" fontWeight="900" textAnchor="middle">✓</text>}
            <text x="-78" y="5" fill={r.done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)"}
              fontSize="12" fontWeight={r.done ? "700" : "400"} fontFamily="sans-serif">{r.name}</text>
            {i < roster.length - 1 && <line x1="-110" y1="18" x2="110" y2="18" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />}
          </g>
        ))}
      </motion.g>

      {/* Lakers badge */}
      <motion.g animate={{ y: [75, 60, 75], rotate: [3, -3, 3] }} transition={{ ...inf, duration: 2.8 }}>
        <rect x="478" y="75" width="84" height="52" rx="14" fill="#FDB927" opacity="0.88" />
        <rect x="478" y="75" width="84" height="52" rx="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <ellipse cx="496" cy="92" rx="13" ry="7" fill="rgba(255,255,255,0.26)" transform="rotate(-20,496,92)" />
        <text x="520" y="107" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="monospace">LAL</text>
      </motion.g>

      {/* Player */}
      <motion.g transform="translate(100,218) scale(0.82)"
        animate={{ y: [0, -12, 0] }} transition={{ ...inf, duration: 2.5 }}>
        <ChibiPlayer {...player} />
      </motion.g>
    </svg>
  );
}
