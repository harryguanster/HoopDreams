"use client";
import { motion } from "framer-motion";

const inf = { repeat: Infinity, ease: "easeInOut" as const };

// ─── Gradient defs helper ────────────────────────────────────────────────────
// MUST be rendered inside parent <svg><defs>…</defs></svg> — NOT inside a <g>
interface GradDefs {
  p: string;          // prefix — unique per character instance
  skinL: string; skinM: string; skinD: string;
  jerseyA: string; jerseyB: string;
  shortsA: string; shortsB: string;
}
function CharDefs({ p, skinL, skinM, skinD, jerseyA, jerseyB, shortsA, shortsB }: GradDefs) {
  return (
    <>
      <radialGradient id={`${p}sk`} cx="36%" cy="28%" r="68%">
        <stop offset="0%"   stopColor={skinL} />
        <stop offset="52%"  stopColor={skinM} />
        <stop offset="100%" stopColor={skinD} />
      </radialGradient>
      <linearGradient id={`${p}jr`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={jerseyA} />
        <stop offset="100%" stopColor={jerseyB} />
      </linearGradient>
      <linearGradient id={`${p}sh`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={shortsA} />
        <stop offset="100%" stopColor={shortsB} />
      </linearGradient>
      <radialGradient id={`${p}shoe`} cx="32%" cy="25%" r="72%">
        <stop offset="0%"   stopColor="#555" />
        <stop offset="100%" stopColor="#101010" />
      </radialGradient>
    </>
  );
}

// ─── Character body (drawn in local 180 × 310 space) ────────────────────────
// Place with <g transform="translate(tx,ty) scale(s)"> in parent.
// tx = centerX − 90·s,  ty = feetY − 308·s
interface CharBodyProps {
  p: string;          // gradient prefix
  skinD: string;      // dark skin (for face details)
  hc: string;         // hair color
  hs: "bald"|"short"|"fade"|"curly"|"locs";
  beard: boolean;
  jt: string;         // jersey text color
  num: string;
  team: string;
  pose: "stand"|"sit"|"wave"|"armsup"|"dribble"|"slouch";
}
function CharBody({ p, skinD, hc, hs, beard, jt, num, team, pose }: CharBodyProps) {
  const sk   = `url(#${p}sk)`;
  const jr   = `url(#${p}jr)`;
  const sh   = `url(#${p}sh)`;
  const shoe = `url(#${p}shoe)`;
  const isSit = pose === "sit" || pose === "slouch";

  // ── Arm paths keyed by pose ──────────────────────────────────────────────
  //   Each entry: [leftPath, leftHandCX, leftHandCY, rightPath, rightHandCX, rightHandCY]
  const arms: Record<string, [string,number,number,string,number,number]> = {
    stand:   ["M 44 132 Q 22 148 14 178", 14, 181, "M 136 132 Q 158 148 166 178", 166, 181],
    sit:     ["M 44 132 Q 28 152 24 170", 24, 173, "M 136 132 Q 152 152 156 170", 156, 173],
    slouch:  ["M 44 132 Q 30 158 28 178", 28, 181, "M 136 132 Q 150 158 152 178", 152, 181],
    armsup:  ["M 44 132 Q 16 110 10 85",  10,  82, "M 136 132 Q 164 110 170 85",  170,  82],
    wave:    ["M 44 132 Q 22 148 14 178", 14, 181, "M 136 132 Q 164 108 168 80",  168,  77],
    dribble: ["M 44 132 Q 22 148 14 178", 14, 181, "M 136 132 Q 162 160 164 192", 164, 195],
  };
  const [lp, lhx, lhy, rp, rhx, rhy] = arms[pose] ?? arms.stand;

  // ── Sitting legs ──────────────────────────────────────────────────────────
  const sittingLegs = (
    <>
      {/* Thighs (horizontal, going to each side) */}
      <rect x="20" y="204" width="62" height="28" rx="12" fill={sh} transform="rotate(-6 51 218)" />
      <rect x="98" y="204" width="62" height="28" rx="12" fill={sh} transform="rotate(6 129 218)" />
      {/* Calves (hanging down) */}
      <rect x="20" y="228" width="30" height="62" rx="12" fill={sk} transform="rotate(6 35 259)" />
      <rect x="130" y="228" width="30" height="62" rx="12" fill={sk} transform="rotate(-6 145 259)" />
    </>
  );

  // ── Standing legs ─────────────────────────────────────────────────────────
  const standLegs = (
    <>
      <rect x="44" y="226" width="36" height="60" rx="14" fill={sk} />
      <rect x="100" y="226" width="36" height="60" rx="14" fill={sk} />
      <ellipse cx="62"  cy="280" rx="6" ry="4" fill="rgba(0,0,0,0.15)" />
      <ellipse cx="118" cy="280" rx="6" ry="4" fill="rgba(0,0,0,0.15)" />
    </>
  );

  // ── Sad face overlay (for slouch) ─────────────────────────────────────────
  const sadFace = pose === "slouch" && (
    <>
      {/* Sad brows — angled inward (drawn over happy brows) */}
      <path d="M48 46 Q66 40 80 44" stroke={hc} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M100 44 Q114 40 132 46" stroke={hc} strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Cover happy smile with skin tone */}
      <path d="M58 94 Q90 118 122 94" fill={sk} stroke={sk} strokeWidth="4" />
      {/* Sad mouth */}
      <path d="M66 108 Q90 98 114 108" stroke={skinD} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.72" />
    </>
  );

  return (
    <g>
      {/* ── Floor shadow ── */}
      {!isSit && <ellipse cx="90" cy="308" rx="54" ry="12" fill="rgba(0,0,0,0.28)" />}

      {/* ── Shoes ── */}
      {!isSit ? (
        <>
          <ellipse cx="62"  cy="293" rx="32" ry="14" fill={shoe} />
          <ellipse cx="118" cy="293" rx="32" ry="14" fill={shoe} />
          <ellipse cx="52"  cy="285" rx="15" ry="7"  fill="rgba(255,255,255,0.16)" transform="rotate(-14,52,285)" />
          <ellipse cx="108" cy="285" rx="15" ry="7"  fill="rgba(255,255,255,0.16)" transform="rotate(-14,108,285)" />
          {/* White ankle socks */}
          <rect x="44"  y="272" width="36" height="20" rx="9"  fill="white" />
          <rect x="100" y="272" width="36" height="20" rx="9"  fill="white" />
        </>
      ) : (
        <>
          <ellipse cx="40"  cy="296" rx="26" ry="11" fill={shoe} transform="rotate(8,40,296)" />
          <ellipse cx="140" cy="296" rx="26" ry="11" fill={shoe} transform="rotate(-8,140,296)" />
          <rect x="28"  y="280" width="28" height="17" rx="7" fill="white" transform="rotate(8,42,288)" />
          <rect x="124" y="280" width="28" height="17" rx="7" fill="white" transform="rotate(-8,138,288)" />
        </>
      )}

      {/* ── Legs ── */}
      {isSit ? sittingLegs : standLegs}

      {/* ── Shorts ── */}
      <rect x="34" y="200" width="112" height="30" rx="8" fill={sh} />
      <line x1="90" y1="200" x2="90" y2="230" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" />
      <rect x="34" y="220" width="112" height="8" rx="4" fill="rgba(0,0,0,0.10)" />

      {/* ── Left arm ── */}
      <path d={lp} stroke={sk} strokeWidth="26" fill="none" strokeLinecap="round" />
      <circle cx={lhx} cy={lhy} r="15" fill={sk} />
      {/* Left arm highlight */}
      <path d={lp} stroke="rgba(255,255,255,0.10)" strokeWidth="10" fill="none" strokeLinecap="round" />

      {/* ── Right arm ── */}
      <path d={rp} stroke={sk} strokeWidth="26" fill="none" strokeLinecap="round" />
      <circle cx={rhx} cy={rhy} r="15" fill={sk} />
      <path d={rp} stroke="rgba(255,255,255,0.10)" strokeWidth="10" fill="none" strokeLinecap="round" />

      {/* ── Jersey / Torso ── */}
      <path d="M32 136 Q44 124 64 122 L70 140 Q90 148 110 140 L116 122 Q136 124 148 136 L150 204 Q90 218 30 204 Z" fill={jr} />
      {/* Jersey specular */}
      <ellipse cx="64" cy="144" rx="24" ry="15" fill="rgba(255,255,255,0.10)" transform="rotate(-18,64,144)" />
      {/* Jersey side shadows */}
      <ellipse cx="32"  cy="168" rx="20" ry="36" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="148" cy="168" rx="20" ry="36" fill="rgba(0,0,0,0.12)" />
      {/* Team name */}
      <text x="90" y="158" textAnchor="middle" fill={jt}
        fontSize="12.5" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif"
        letterSpacing="2" opacity="0.88">{team}</text>
      {/* Number */}
      <text x="90" y="197" textAnchor="middle" fill={jt}
        fontSize="36" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif"
        opacity="0.90">{num}</text>
      {/* Collar */}
      <path d="M70 140 Q90 154 110 140" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3.5" />

      {/* ── Neck ── */}
      <rect x="76" y="108" width="28" height="22" rx="10" fill={sk} />
      <ellipse cx="90" cy="126" rx="14" ry="5" fill="rgba(0,0,0,0.14)" />

      {/* ── HEAD ── */}
      <ellipse cx="90" cy="64" rx="58" ry="62" fill={sk} />
      {/* 3D shading: right-side shadow */}
      <ellipse cx="120" cy="68" rx="36" ry="50" fill="rgba(0,0,0,0.17)" />
      {/* 3D shading: chin shadow */}
      <ellipse cx="90" cy="118" rx="36" ry="13" fill="rgba(0,0,0,0.17)" />
      {/* Forehead highlight */}
      <ellipse cx="65" cy="36" rx="28" ry="19" fill="rgba(255,255,255,0.18)" transform="rotate(-22,65,36)" />
      {/* Cheekbone highlight */}
      <ellipse cx="54" cy="72" rx="17" ry="10" fill="rgba(255,255,255,0.10)" transform="rotate(-12,54,72)" />
      {/* Jaw */}
      <path d="M40 86 Q50 126 90 133 Q130 126 140 86" fill={sk} />
      {/* Jaw shadow */}
      <path d="M42 90 Q52 124 90 131 Q128 124 138 90" fill="rgba(0,0,0,0.12)" />

      {/* ── Ears ── */}
      <ellipse cx="32" cy="68" rx="9" ry="12" fill={sk} />
      <ellipse cx="148" cy="68" rx="9" ry="12" fill={sk} />
      <ellipse cx="32" cy="68" rx="5" ry="7" fill="rgba(0,0,0,0.14)" />
      <ellipse cx="148" cy="68" rx="5" ry="7" fill="rgba(0,0,0,0.14)" />

      {/* ── Hair ── */}
      {hs === "short" && (
        <path d="M32 57 Q38 10 90 8 Q142 10 148 57 Q130 22 90 20 Q50 22 32 57 Z" fill={hc} />
      )}
      {hs === "fade" && (
        <>
          <path d="M32 60 Q38 12 90 9 Q142 12 148 60 Q130 24 90 22 Q50 24 32 60 Z" fill={hc} />
          <path d="M32 60 Q33 44 40 37" fill="none" stroke={hc} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M148 60 Q147 44 140 37" fill="none" stroke={hc} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </>
      )}
      {hs === "curly" && (
        <>
          <path d="M30 62 Q36 8 90 5 Q144 8 150 62 Q130 18 90 15 Q50 18 30 62 Z" fill={hc} />
          {[42,56,70,84,98,112,126].map((x,i) => (
            <circle key={i} cx={x} cy={17+(i%3)*9} r={12} fill={hc} />
          ))}
        </>
      )}
      {hs === "locs" && (
        <>
          <path d="M32 58 Q38 12 90 9 Q142 12 148 58 Q130 22 90 20 Q50 22 32 58 Z" fill={hc} />
          {[36,48,62,76,90,104,118,132,144].map((x,i) => (
            <path key={i}
              d={`M${x} ${52+(i%3)*4} Q${x - 6 + i*0.5} ${85+i*7} ${x - 3 + i*0.3} ${118+i*5}`}
              stroke={hc} strokeWidth="8" fill="none" strokeLinecap="round" />
          ))}
        </>
      )}

      {/* ── Eyebrows (drawn over hair) ── */}
      {pose !== "slouch" && (
        <>
          <path d="M48 42 Q66 34 80 41" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M100 41 Q114 34 132 42" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ── Eyes ── */}
      {/* Socket shadow */}
      <ellipse cx="66" cy="56" rx="21" ry="17" fill="rgba(0,0,0,0.13)" />
      <ellipse cx="114" cy="56" rx="21" ry="17" fill="rgba(0,0,0,0.13)" />
      {/* Sclera */}
      <ellipse cx="66" cy="57" rx="17" ry="14" fill="white" />
      <ellipse cx="114" cy="57" rx="17" ry="14" fill="white" />
      {/* Upper lid crease */}
      <path d="M49 50 Q66 45 83 50" fill={skinD} opacity="0.32" />
      <path d="M97 50 Q114 45 131 50" fill={skinD} opacity="0.32" />
      {/* Iris */}
      <circle cx="68" cy="58" r="9.5" fill="#180e06" />
      <circle cx="116" cy="58" r="9.5" fill="#180e06" />
      {/* Pupil */}
      <circle cx="69" cy="59" r="5.5" fill="#060202" />
      <circle cx="117" cy="59" r="5.5" fill="#060202" />
      {/* Main highlight */}
      <circle cx="73" cy="53" r="4.5" fill="white" />
      <circle cx="121" cy="53" r="4.5" fill="white" />
      {/* Secondary highlight */}
      <circle cx="64" cy="63" r="2"   fill="rgba(255,255,255,0.45)" />
      <circle cx="112" cy="63" r="2"  fill="rgba(255,255,255,0.45)" />

      {/* ── Nose ── */}
      <ellipse cx="82" cy="84" rx="6" ry="4.5" fill={skinD} opacity="0.42" />
      <ellipse cx="98" cy="84" rx="6" ry="4.5" fill={skinD} opacity="0.42" />
      <path d="M84 68 Q82 80 80 85 Q84 90 90 90 Q96 90 100 85 Q98 80 96 68"
        fill={skinD} opacity="0.20" />

      {/* ── Smile (happy, default) ── */}
      {pose !== "slouch" && (
        <>
          {/* Dark mouth line */}
          <path d="M62 96 Q90 116 118 96" stroke={skinD} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.65" />
          {/* White teeth fill */}
          <path d="M66 96 Q90 112 114 96" fill="white" />
          {/* Tooth dividers */}
          <line x1="79" y1="96" x2="77" y2="108" stroke="rgba(180,180,180,0.5)" strokeWidth="1.2" />
          <line x1="90" y1="97" x2="90" y2="110" stroke="rgba(180,180,180,0.5)" strokeWidth="1.2" />
          <line x1="101" y1="96" x2="103" y2="108" stroke="rgba(180,180,180,0.5)" strokeWidth="1.2" />
          {/* Upper lip */}
          <path d="M62 96 Q75 88 90 91 Q105 88 118 96" fill={skinD} opacity="0.50" />
        </>
      )}

      {/* ── Beard ── */}
      {beard && (
        <>
          <path d="M46 90 Q50 130 90 138 Q130 130 134 90 Q118 114 90 118 Q62 114 46 90 Z"
            fill={hc} opacity="0.76" />
          <path d="M66 90 Q90 82 114 90" fill={hc} opacity="0.65" />
          <path d="M52 100 Q58 118 66 124" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" fill="none" />
        </>
      )}

      {/* Sad face overlay */}
      {sadFace}
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Start Bench Cut
// Three players seated on a long bench, evenly spread
// ════════════════════════════════════════════════════════════════════════════
export function SBCScene({ era = "alltime" }: { era?: string }) {
  // Scale and positioning
  const S = 0.50;   // character scale
  const FEET_Y = 420; // where shoes end up (bench + legs below)
  // tx = centerX - 90*S,  ty = feetY - 308*S
  const ty = FEET_Y - 308 * S;
  const players = era === "current"
    ? [
        { cx: 140, pose: "sit"    as const, num: "77", team: "MAVS",  jA: "#0053BC", jB: "#00378a", sA: "#0053BC", sB: "#00378a", jt: "#C4CED4" as string,
          skinL: "#e8c08a", skinM: "#c89060", skinD: "#906030", hc: "#2a1408", hs: "short" as const, beard: false },
        { cx: 360, pose: "sit"    as const, num: "30", team: "GSW",   jA: "#1D428A", jB: "#102866", sA: "#1D428A", sB: "#102866", jt: "#FFC72C" as string,
          skinL: "#c08060", skinM: "#986040", skinD: "#704030", hc: "#140808", hs: "fade" as const, beard: true },
        { cx: 580, pose: "slouch" as const, num: "0",  team: "CHI",   jA: "#CE1141", jB: "#8b0d2c", sA: "#1a1a1a", sB: "#101010", jt: "white"  as string,
          skinL: "#7a4a2a", skinM: "#5c3218", skinD: "#3c1e0c", hc: "#0a0404", hs: "fade" as const, beard: false },
      ]
    : [
        { cx: 140, pose: "sit"    as const, num: "23", team: "BULLS", jA: "#CE1141", jB: "#8b0d2c", sA: "#1a1a1a", sB: "#101010", jt: "white" as string,
          skinL: "#7a4a2a", skinM: "#5c3218", skinD: "#3c1e0c", hc: "#080404", hs: "bald"  as const, beard: false },
        { cx: 360, pose: "sit"    as const, num: "33", team: "BULLS", jA: "#CE1141", jB: "#8b0d2c", sA: "#1a1a1a", sB: "#101010", jt: "white" as string,
          skinL: "#7a4a2a", skinM: "#5c3218", skinD: "#3c1e0c", hc: "#080404", hs: "fade"  as const, beard: false },
        { cx: 580, pose: "slouch" as const, num: "8",  team: "LAKERS", jA: "#FDB927", jB: "#c48a10", sA: "#552583", sB: "#3a1a5e", jt: "#552583" as string,
          skinL: "#e8b880", skinM: "#c89060", skinD: "#906030", hc: "#1a0c04", hs: "short" as const, beard: false },
      ];

  const benchY = 345;

  return (
    <svg viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        {/* Bench gradient */}
        <linearGradient id="sbc-bench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c4882a" />
          <stop offset="100%" stopColor="#7c4b14" />
        </linearGradient>
        <radialGradient id="sbc-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        {/* Character gradients — must live here at SVG root, not inside <g> */}
        {players.map((pl, i) => (
          <CharDefs key={i} p={`sbc${i}`}
            skinL={pl.skinL} skinM={pl.skinM ?? pl.skinL} skinD={pl.skinD}
            jerseyA={pl.jA} jerseyB={pl.jB}
            shortsA={pl.sA} shortsB={pl.sB}
          />
        ))}
      </defs>

      {/* Floor */}
      <rect x="0" y="432" width="720" height="48" fill="rgba(255,255,255,0.02)" />
      <line x1="0" y1="433" x2="720" y2="433" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Long bench */}
      {/* Back legs */}
      <rect x="95"  y={benchY + 30} width="14" height="80" rx="7" fill="#5a3510" />
      <rect x="315" y={benchY + 30} width="14" height="80" rx="7" fill="#5a3510" />
      <rect x="611" y={benchY + 30} width="14" height="80" rx="7" fill="#5a3510" />
      {/* Back rest */}
      <rect x="88" y={benchY - 58} width="544" height="22" rx="8" fill="url(#sbc-bench)" />
      <rect x="95" y={benchY - 58} width="12" height="90" rx="6" fill="#7a4c20" />
      <rect x="316" y={benchY - 58} width="12" height="90" rx="6" fill="#7a4c20" />
      <rect x="613" y={benchY - 58} width="12" height="90" rx="6" fill="#7a4c20" />
      {/* Seat */}
      <rect x="88" y={benchY} width="544" height="35" rx="10" fill="url(#sbc-bench)" />
      <rect x="88" y={benchY + 29} width="544" height="7"  rx="3" fill="#5a3510" />
      {/* Seat specular */}
      <rect x="90" y={benchY + 2} width="540" height="8" rx="4" fill="rgba(255,255,255,0.10)" />

      {/* Characters */}
      {players.map((pl, i) => {
        const tx = pl.cx - 90 * S;
        return (
          <motion.g key={i} transform={`translate(${tx},${ty}) scale(${S})`}
            animate={{ y: [0, i === 1 ? -8 : -6, 0] }}
            transition={{ ...inf, duration: 2.4 + i * 0.4, delay: i * 0.3 }}>
            <CharBody
              p={`sbc${i}`} skinD={pl.skinD} hc={pl.hc} hs={pl.hs}
              beard={pl.beard ?? false} jt={pl.jt} num={pl.num} team={pl.team} pose={pl.pose}
            />
          </motion.g>
        );
      })}

      {/* Role icons above each player */}
      <motion.g animate={{ y: [0,-8,0] }} transition={{ ...inf, duration: 2.4 }}>
        <circle cx={140} cy={ty * S + 30} r="24" fill="url(#sbc-star)" />
        <text x={140} y={ty * S + 40} textAnchor="middle" fontSize="26"
          style={{ filter: "drop-shadow(0 0 8px #fbbf24)" }}>⭐</text>
      </motion.g>
      <text x={360} y={ty * S + 28} textAnchor="middle" fontSize="22">🪑</text>
      <text x={580} y={ty * S + 28} textAnchor="middle" fontSize="22">✂️</text>

      {/* Swinging feet for bench player */}
      <motion.g
        animate={{ rotate: [12, -12, 12] }}
        transition={{ ...inf, duration: 1.6 }}
        style={{ transformOrigin: `360px ${ty + 200 * S}px` }}>
        <ellipse cx={340} cy={ty + 232 * S} rx={11} ry={17} fill="url(#sbc1-sh)" />
        <ellipse cx={380} cy={ty + 232 * S} rx={11} ry={17} fill="url(#sbc1-sh)" />
      </motion.g>

      {/* Labels */}
      <text x="140" y="465" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">START</text>
      <text x="360" y="465" textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">BENCH</text>
      <text x="580" y="465" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">CUT</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Guess Who
// ════════════════════════════════════════════════════════════════════════════
export function GuessWhoScene({ era = "alltime" }: { era?: string }) {
  const S = 0.58;
  const player = era === "current"
    ? { jA: "#1D428A", jB: "#102866", sA: "#1D428A", sB: "#102866", jt: "#FFC72C",
        skinL: "#c08060", skinM: "#986040", skinD: "#704030", hc: "#140808", hs: "fade" as const, beard: true, num: "30", team: "GSW" }
    : { jA: "#FDB927", jB: "#c48a10", sA: "#552583", sB: "#3a1a5e", jt: "#552583",
        skinL: "#7a4a2a", skinM: "#5c3218", skinD: "#3c1e0c", hc: "#080404", hs: "bald" as const, beard: false, num: "23", team: "LAKERS" };

  const qPos = [
    { x: 530, y: 75,  s: 1.3, d: 0 },
    { x: 578, y: 205, s: 0.9, d: 0.5 },
    { x: 508, y: 325, s: 1.0, d: 1.0 },
    { x: 88,  y: 88,  s: 0.85, d: 0.3 },
    { x: 52,  y: 260, s: 1.1, d: 0.7 },
  ];

  const tx = 128 - 90 * S;
  const ty = 430 - 308 * S;

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <CharDefs p="gw0" skinL={player.skinL} skinM={player.skinM} skinD={player.skinD}
          jerseyA={player.jA} jerseyB={player.jB} shortsA={player.sA} shortsB={player.sB} />
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

      {qPos.map((q, i) => (
        <motion.text key={i} x={q.x} y={q.y} fontSize={30 * q.s}
          fill="rgba(255,255,255,0.22)" fontWeight="900" textAnchor="middle"
          animate={{ y: [q.y, q.y - 14, q.y], opacity: [0.22, 0.55, 0.22] }}
          transition={{ ...inf, duration: 2.4 + i * 0.4, delay: q.d }}>?</motion.text>
      ))}

      {/* Mystery silhouette */}
      <g filter="url(#gw-blur)" opacity="0.28">
        <ellipse cx="428" cy="228" rx="52" ry="68" fill="#94a3b8" />
        <circle  cx="428" cy="135" r="44"         fill="#94a3b8" />
      </g>

      {/* Magnifying glass */}
      <motion.g transform="translate(332,248)"
        animate={{ rotate: [-6, 6, -6] }} transition={{ ...inf, duration: 3.5 }}>
        <rect x="62" y="78" width="18" height="112" rx="9" fill="#374151" transform="rotate(40,62,78)" />
        <circle cx="0" cy="0" r="96" fill="url(#gw-glass)" />
        <circle cx="0" cy="0" r="96" fill="none" stroke="#14b8a6" strokeWidth="10" opacity="0.7" filter="url(#gw-glow)" />
        <circle cx="0" cy="0" r="96" fill="none" stroke="#2dd4bf" strokeWidth="4" opacity="0.9" />
        <ellipse cx="-30" cy="-34" rx="29" ry="19" fill="rgba(255,255,255,0.11)" transform="rotate(-25,-30,-34)" />
      </motion.g>

      <motion.g transform={`translate(${tx},${ty}) scale(${S})`}
        animate={{ y: [0, -14, 0] }} transition={{ ...inf, duration: 2.8 }}>
        <CharBody p="gw0" skinD={player.skinD} hc={player.hc} hs={player.hs}
          beard={player.beard} jt={player.jt} num={player.num} team={player.team} pose="stand" />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Stat Line Guesser
// ════════════════════════════════════════════════════════════════════════════
export function StatLineScene({ era = "alltime" }: { era?: string }) {
  const S = 0.60;
  const player = era === "current"
    ? { jA: "#1D428A", jB: "#102866", sA: "#FFC72C", sB: "#c49a10", jt: "white",
        skinL: "#f0c898", skinM: "#d8a878", skinD: "#b08858",
        hc: "#5a3010", hs: "curly" as const, beard: true, num: "15", team: "DEN", pose: "wave" as const }
    : { jA: "#007A33", jB: "#004d20", sA: "#007A33", sB: "#004d20", jt: "white",
        skinL: "#1e1208", skinM: "#160e06", skinD: "#0e0804",
        hc: "#0a0403", hs: "locs" as const, beard: false, num: "34", team: "BUCKS", pose: "wave" as const };

  const tx = 148 - 90 * S;
  const ty = 448 - 308 * S;

  const stats = [
    { label: "PPG",  value: "32.1",  delay: 0    },
    { label: "RPG",  value: "9.4",   delay: 0.25 },
    { label: "APG",  value: "5.6",   delay: 0.5  },
    { label: "ERA",  value: "• • •", delay: 0.75 },
    { label: "TEAM", value: "• • •", delay: 1.0  },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <CharDefs p="sl0" skinL={player.skinL} skinM={player.skinM} skinD={player.skinD}
          jerseyA={player.jA} jerseyB={player.jB} shortsA={player.sA} shortsB={player.sB} />
        <linearGradient id="sl-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
        <filter id="sl-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Stats board */}
      <motion.g transform="translate(415,128)" animate={{ y: [0,-10,0] }} transition={{ ...inf, duration: 3.2 }}>
        <rect x="-145" y="22" width="290" height="8" rx="4" fill="rgba(0,0,0,0.3)" />
        <rect x="-145" y="-22" width="290" height="218" rx="16" fill="url(#sl-board)" />
        <rect x="-145" y="-22" width="290" height="218" rx="16" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5" />
        <rect x="-145" y="-22" width="290" height="44"  rx="16" fill="rgba(20,184,166,0.15)" />
        <text x="0" y="12" textAnchor="middle" fill="#2dd4bf" fontSize="13"
          fontWeight="800" fontFamily="monospace" letterSpacing="4">CAREER STATS</text>
        <rect x="-145" y="20" width="290" height="1" fill="rgba(20,184,166,0.3)" />
        {stats.map((s, i) => (
          <motion.g key={s.label} transform={`translate(0,${46 + i * 36})`}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.delay, duration: 0.4 }}>
            <text x="-120" y="14" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700" fontFamily="monospace">{s.label}</text>
            <text x="130"  y="14" fill={s.value.includes("•") ? "rgba(255,255,255,0.22)" : "#f0fdf4"}
              fontSize="14" fontWeight="900" fontFamily="monospace" textAnchor="end">{s.value}</text>
            {i < stats.length-1 && <line x1="-130" y1="22" x2="130" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />}
          </motion.g>
        ))}
      </motion.g>

      {/* Pointer */}
      <motion.g transform="translate(268,282)" animate={{ rotate: [-8,2,-8] }} transition={{ ...inf, duration: 2.0 }}>
        <rect x="-4" y="-82" width="8" height="86" rx="4" fill="#374151" />
        <circle cx="0" cy="-82" r="6" fill="#14b8a6" />
      </motion.g>

      <motion.g transform={`translate(${tx},${ty}) scale(${S})`}
        animate={{ y: [0,-10,0] }} transition={{ ...inf, duration: 2.6, delay: 0.3 }}>
        <CharBody p="sl0" skinD={player.skinD} hc={player.hc} hs={player.hs}
          beard={player.beard} jt={player.jt} num={player.num} team={player.team} pose={player.pose} />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Lineup Guesser
// ════════════════════════════════════════════════════════════════════════════
export function LineupScene() {
  const defs = [
    { p:"lu0", skinL:"#7a4a2a", skinM:"#5c3218", skinD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", sA:"#1a1a1a", sB:"#101010" },
    { p:"lu1", skinL:"#c08060", skinM:"#986040", skinD:"#704030", jA:"#007A33", jB:"#004d20", sA:"#007A33", sB:"#004d20" },
    { p:"lu2", skinL:"#e8c08a", skinM:"#c89060", skinD:"#906030", jA:"#1D428A", jB:"#102866", sA:"#1D428A", sB:"#102866" },
    { p:"lu3", skinL:"#7a4a2a", skinM:"#5c3218", skinD:"#3c1e0c", jA:"#F58426", jB:"#b85e10", sA:"#006BB6", sB:"#004a80" },
    { p:"lu4", skinL:"#f0c898", skinM:"#d8a878", skinD:"#b08858", jA:"#FDB927", jB:"#c48a10", sA:"#552583", sB:"#3a1a5e" },
  ];
  const chars = [
    { cx:320, fy:410, S:0.44, d:0,    hc:"#080404", hs:"bald"  as const, beard:false, jt:"white",   num:"PG", team:"POINT", pose:"stand"   as const },
    { cx:178, fy:395, S:0.42, d:0.15, hc:"#140808", hs:"fade"  as const, beard:false, jt:"white",   num:"SG", team:"SHOOT", pose:"stand"   as const },
    { cx:462, fy:395, S:0.42, d:0.3,  hc:"#2a1408", hs:"short" as const, beard:false, jt:"#FFC72C", num:"SF", team:"SMALL", pose:"wave"    as const },
    { cx:228, fy:380, S:0.40, d:0.45, hc:"#080404", hs:"curly" as const, beard:true,  jt:"white",   num:"PF", team:"POWER", pose:"armsup"  as const },
    { cx:412, fy:380, S:0.40, d:0.6,  hc:"#5a3010", hs:"curly" as const, beard:true,  jt:"#552583", num:"C",  team:"CNTRI", pose:"stand"   as const },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <filter id="lu-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {defs.map(d => (
          <CharDefs key={d.p} p={d.p} skinL={d.skinL} skinM={d.skinM} skinD={d.skinD}
            jerseyA={d.jA} jerseyB={d.jB} shortsA={d.sA} shortsB={d.sB} />
        ))}
      </defs>

      {/* Court */}
      <ellipse cx="320" cy="345" rx="288" ry="112" fill="rgba(255,255,255,0.025)" />
      <ellipse cx="320" cy="345" rx="76" ry="30" fill="none" stroke="rgba(20,184,166,0.20)" strokeWidth="2" />
      <path d="M102 422 Q320 218 538 422" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M246 218 L246 372 Q320 392 394 372 L394 218" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5" />
      <ellipse cx="320" cy="172" rx="18" ry="8" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="2.5" />
      {chars.map((c, i) => (
        <line key={i} x1="320" y1="298" x2={c.cx} y2={c.fy - 308 * c.S}
          stroke="rgba(20,184,166,0.08)" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      {chars.map((c, i) => {
        const tx = c.cx - 90 * c.S;
        const ty = c.fy - 308 * c.S;
        return (
          <motion.g key={i} transform={`translate(${tx},${ty}) scale(${c.S})`}
            animate={{ y: [0, -10, 0] }}
            transition={{ ...inf, duration: 2.2 + i * 0.3, delay: c.d }}>
            <CharBody p={defs[i].p} skinD={defs[i].skinD} hc={c.hc} hs={c.hs}
              beard={c.beard} jt={c.jt} num={c.num} team={c.team} pose={c.pose} />
          </motion.g>
        );
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Timed: Name All Teams
// ════════════════════════════════════════════════════════════════════════════
export function TimedTeamsScene() {
  const S = 0.60;
  const badges = [
    { label:"LAL", color:"#FDB927", x:490, y:118, d:0   },
    { label:"GSW", color:"#006BB6", x:548, y:248, d:0.4 },
    { label:"BOS", color:"#007A33", x:484, y:368, d:0.8 },
    { label:"NYK", color:"#F58426", x:96,  y:128, d:0.2 },
    { label:"CHI", color:"#CE1141", x:68,  y:270, d:0.6 },
    { label:"MIA", color:"#98002E", x:118, y:388, d:1.0 },
  ];
  const tx = 198 - 90 * S;
  const ty = 445 - 308 * S;

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <CharDefs p="tt0"
          skinL="#7a4a2a" skinM="#5c3218" skinD="#3c1e0c"
          jerseyA="#552583" jerseyB="#3a1a5e" shortsA="#FDB927" shortsB="#c48a10" />
        <radialGradient id="tt-ball" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>

      {badges.map((b,i) => (
        <motion.g key={b.label} animate={{ y:[b.y,b.y-14,b.y], rotate:[-5,5,-5] }}
          transition={{ ...inf, duration: 2.5 + i*0.3, delay: b.d }}>
          <rect x={b.x-30} y={b.y-20} width="60" height="40" rx="10" fill={b.color} opacity="0.88" />
          <rect x={b.x-30} y={b.y-20} width="60" height="40" rx="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <ellipse cx={b.x-10} cy={b.y-10} rx="15" ry="7" fill="rgba(255,255,255,0.22)" transform={`rotate(-20,${b.x-10},${b.y-10})`} />
          <text x={b.x} y={b.y+6} textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">{b.label}</text>
        </motion.g>
      ))}

      {/* Stopwatch */}
      <motion.g transform="translate(510,80)" animate={{ rotate:[-3,3,-3] }} transition={{ ...inf, duration: 2.0 }}>
        <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.06)" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.6" />
        <rect x="-8" y="-56" width="16" height="10" rx="5" fill="#374151" />
        <rect x="-14" y="-62" width="28" height="8" rx="4" fill="#374151" />
        <motion.line x1="0" y1="0" x2="0" y2="-34" stroke="#f97316" strokeWidth="3"
          strokeLinecap="round" animate={{ rotate:[0,360] }}
          transition={{ ...inf, duration: 2, ease:"linear" }} style={{ transformOrigin:"0px 0px" }} />
        <line x1="0" y1="0" x2="24" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="4" fill="#14b8a6" />
        {Array.from({length:12},(_,i)=>{const a=(i/12)*Math.PI*2-Math.PI/2;return(
          <line key={i} x1={Math.cos(a)*38} y1={Math.sin(a)*38} x2={Math.cos(a)*44} y2={Math.sin(a)*44}
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        );})}
      </motion.g>

      {/* Spinning basketball */}
      <motion.g transform="translate(315,124)"
        animate={{ y:[0,-32,0], rotate:[0,360] }}
        transition={{ y:{...inf,duration:0.9,ease:"easeInOut"}, rotate:{...inf,duration:0.9,ease:"linear"} }}>
        <circle cx="0" cy="0" r="32" fill="url(#tt-ball)" />
        <path d="M-32 0 Q0 -16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M-32 0 Q0 16 32 0"  stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6" />
        <line x1="0" y1="-32" x2="0" y2="32" stroke="#7c2d12" strokeWidth="2" opacity="0.6" />
        <ellipse cx="-10" cy="-10" rx="10" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-25,-10,-10)" />
      </motion.g>

      <motion.g transform={`translate(${tx},${ty}) scale(${S})`}
        animate={{ y:[0,-10,0] }} transition={{ ...inf, duration: 2.4 }}>
        <CharBody p="tt0" skinD="#3c1e0c" hc="#080404" hs="bald"
          beard={false} jt="#FDB927" num="23" team="LAKERS" pose="armsup" />
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Timed: Name Players Per Team
// ════════════════════════════════════════════════════════════════════════════
export function TimedPlayersScene() {
  const S = 0.60;
  const roster = [
    { name:"LeBron James",   done:true  },
    { name:"Anthony Davis",  done:true  },
    { name:"Austin Reaves",  done:false },
    { name:"• • • • • •",   done:false },
    { name:"• • • • •",     done:false },
  ];
  const tx = 148 - 90 * S;
  const ty = 445 - 308 * S;

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <CharDefs p="tp0"
          skinL="#7a4a2a" skinM="#5c3218" skinD="#3c1e0c"
          jerseyA="#FDB927" jerseyB="#c48a10" shortsA="#552583" shortsB="#3a1a5e" />
        <linearGradient id="tp-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
      </defs>

      {/* Clipboard */}
      <motion.g transform="translate(422,212)" animate={{ y:[0,-8,0], rotate:[-2,2,-2] }} transition={{ ...inf, duration: 3.0 }}>
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="url(#tp-board)" />
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="-30" y="-118" width="60" height="28" rx="8" fill="#374151" />
        <rect x="-20" y="-113" width="40" height="18" rx="6" fill="#4b5563" />
        <text x="0" y="-70" textAnchor="middle" fill="#14b8a6" fontSize="11"
          fontWeight="800" fontFamily="monospace" letterSpacing="3">ROSTER</text>
        <line x1="-110" y1="-56" x2="110" y2="-56" stroke="rgba(20,184,166,0.3)" strokeWidth="1" />
        {roster.map((r,i) => (
          <g key={i} transform={`translate(0,${-38+i*44})`}>
            <rect x="-110" y="-12" width="22" height="22" rx="6"
              fill={r.done ? "#22c55e" : "rgba(255,255,255,0.08)"}
              stroke={r.done ? "#16a34a" : "rgba(255,255,255,0.15)"} strokeWidth="1.5" />
            {r.done && <text x="-99" y="5" fill="white" fontSize="13" fontWeight="900" textAnchor="middle">✓</text>}
            <text x="-78" y="5" fill={r.done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)"}
              fontSize="12" fontWeight={r.done ? "700" : "400"} fontFamily="sans-serif">{r.name}</text>
            {i < roster.length-1 && <line x1="-110" y1="18" x2="110" y2="18" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />}
          </g>
        ))}
      </motion.g>

      {/* Lakers badge */}
      <motion.g animate={{ y:[75,60,75], rotate:[3,-3,3] }} transition={{ ...inf, duration: 2.8 }}>
        <rect x="480" y="75" width="84" height="52" rx="14" fill="#FDB927" opacity="0.88" />
        <rect x="480" y="75" width="84" height="52" rx="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <ellipse cx="498" cy="92" rx="13" ry="7" fill="rgba(255,255,255,0.26)" transform="rotate(-20,498,92)" />
        <text x="522" y="107" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="monospace">LAL</text>
      </motion.g>

      <motion.g transform={`translate(${tx},${ty}) scale(${S})`}
        animate={{ y:[0,-12,0] }} transition={{ ...inf, duration: 2.5 }}>
        <CharBody p="tp0" skinD="#3c1e0c" hc="#080404" hs="bald"
          beard={false} jt="#552583" num="23" team="LAKERS" pose="wave" />
      </motion.g>
    </svg>
  );
}
