"use client";
import { motion } from "framer-motion";

const inf = { repeat: Infinity, ease: "easeInOut" as const };

// Returns flat array — safe to spread directly inside <defs>
function grads(p: string, sL: string, sM: string, sD: string, jA: string, jB: string, shA: string, shB: string) {
  return [
    <radialGradient key={`${p}s`} id={`${p}s`} cx="36%" cy="26%" r="70%">
      <stop offset="0%"   stopColor={sL}/>
      <stop offset="48%"  stopColor={sM}/>
      <stop offset="100%" stopColor={sD}/>
    </radialGradient>,
    <linearGradient key={`${p}j`} id={`${p}j`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={jA}/>
      <stop offset="100%" stopColor={jB}/>
    </linearGradient>,
    <linearGradient key={`${p}h`} id={`${p}h`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={shA}/>
      <stop offset="100%" stopColor={shB}/>
    </linearGradient>,
    <radialGradient key={`${p}e`} id={`${p}e`} cx="30%" cy="25%" r="72%">
      <stop offset="0%"   stopColor="#606060"/>
      <stop offset="100%" stopColor="#1c1c1c"/>
    </radialGradient>,
  ];
}

// ── Cash Inc. chibi block-head style ────────────────────────────────────────
// Local 200 × 295 space.
// Head is a wide square block (170×132) — the dominant feature.
// Shoe bottom at local y=293.  Shorts waist at local y=206.
// Standing: ty = FLOOR_Y - 293*S    Sitting: ty = BENCH_Y - 206*S
interface CP {
  p: string;
  hc: string; hs: "bald"|"short"|"fade"|"curly"|"locs";
  beard: boolean; sD: string;
  jt: string; num: string; team: string;
  sit?: boolean; sad?: boolean; wave?: boolean; armsup?: boolean;
}
function Char({ p, hc, hs, beard, sD, jt, num, team, sit, sad, wave, armsup }: CP) {
  const sk   = `url(#${p}s)`;
  const jr   = `url(#${p}j)`;
  const sh   = `url(#${p}h)`;
  const shoe = `url(#${p}e)`;

  return (
    <g>
      {/* Floor shadow */}
      {!sit && <ellipse cx="100" cy="293" rx="68" ry="10" fill="rgba(0,0,0,0.22)"/>}

      {/* ── Shoes ── */}
      <ellipse cx="58"  cy="282" rx="30" ry="11" fill={shoe}/>
      <ellipse cx="142" cy="282" rx="30" ry="11" fill={shoe}/>
      <rect x="38"  y="272" width="40" height="11" rx="4" fill="rgba(255,255,255,0.20)"/>
      <rect x="122" y="272" width="40" height="11" rx="4" fill="rgba(255,255,255,0.20)"/>

      {/* ── Legs ── */}
      {sit ? (
        <>
          <rect x="40" y="218" width="36" height="58" rx="11" fill={sk}/>
          <rect x="124" y="218" width="36" height="58" rx="11" fill={sk}/>
        </>
      ) : (
        <>
          <rect x="40" y="248" width="36" height="30" rx="11" fill={sk}/>
          <rect x="124" y="248" width="36" height="30" rx="11" fill={sk}/>
        </>
      )}

      {/* ── Shorts ── */}
      <rect x="24" y="206" width="152" height="48" rx="12" fill={sh}/>
      <rect x="24" y="244" width="152" height="10" rx="5" fill="rgba(0,0,0,0.10)"/>
      <line x1="100" y1="208" x2="100" y2="248" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5"/>

      {/* ── Left arm ── */}
      {armsup ? (
        <>
          <rect x="0" y="106" width="30" height="58" rx="13" fill={sk} transform="rotate(-38 15 135)"/>
          <circle cx="6" cy="98" r="16" fill={sk}/>
        </>
      ) : sit ? (
        <>
          <rect x="4" y="150" width="30" height="50" rx="12" fill={sk} transform="rotate(18 19 175)"/>
          <circle cx="20" cy="202" r="15" fill={sk}/>
        </>
      ) : (
        <>
          <rect x="4" y="146" width="30" height="58" rx="13" fill={sk}/>
          <circle cx="19" cy="207" r="15" fill={sk}/>
        </>
      )}

      {/* ── Right arm ── */}
      {armsup ? (
        <>
          <rect x="170" y="106" width="30" height="58" rx="13" fill={sk} transform="rotate(38 185 135)"/>
          <circle cx="194" cy="98" r="16" fill={sk}/>
        </>
      ) : wave ? (
        <>
          <rect x="166" y="100" width="30" height="58" rx="13" fill={sk} transform="rotate(-44 181 129)"/>
          <circle cx="176" cy="92" r="16" fill={sk}/>
        </>
      ) : sit ? (
        <>
          <rect x="166" y="150" width="30" height="50" rx="12" fill={sk} transform="rotate(-18 181 175)"/>
          <circle cx="180" cy="202" r="15" fill={sk}/>
        </>
      ) : (
        <>
          <rect x="166" y="146" width="30" height="58" rx="13" fill={sk}/>
          <circle cx="181" cy="207" r="15" fill={sk}/>
        </>
      )}

      {/* ── Jersey / torso ── */}
      <rect x="36" y="138" width="128" height="74" rx="14" fill={jr}/>
      <path d="M 72 138 Q 100 162 128 138" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="3.5"/>
      <ellipse cx="60" cy="155" rx="22" ry="12" fill="rgba(255,255,255,0.13)" transform="rotate(-20 60 155)"/>
      <text x="100" y="176" textAnchor="middle" fill={jt}
        fontSize="12" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" letterSpacing="1">{team}</text>
      <text x="100" y="203" textAnchor="middle" fill={jt}
        fontSize="30" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif">{num}</text>

      {/* ── Head — big square block (Cash Inc. style) ── */}
      {/* Chin shadow */}
      <ellipse cx="100" cy="139" rx="58" ry="9" fill="rgba(0,0,0,0.16)"/>
      {/* Main block */}
      <rect x="15" y="6" width="170" height="132" rx="24" fill={sk}/>
      {/* Right-side shading */}
      <ellipse cx="168" cy="72" rx="22" ry="56" fill="rgba(0,0,0,0.09)"/>
      {/* Chin extension */}
      <path d="M 40 110 Q 52 140 100 144 Q 148 140 160 110" fill={sk}/>
      {/* Top-left highlight */}
      <ellipse cx="56" cy="34" rx="34" ry="19" fill="rgba(255,255,255,0.22)" transform="rotate(-22 56 34)"/>

      {/* ── Ears ── */}
      <ellipse cx="15"  cy="72" rx="9" ry="13" fill={sk}/>
      <ellipse cx="185" cy="72" rx="9" ry="13" fill={sk}/>
      <ellipse cx="15"  cy="72" rx="5" ry="8"  fill="rgba(0,0,0,0.12)"/>
      <ellipse cx="185" cy="72" rx="5" ry="8"  fill="rgba(0,0,0,0.12)"/>

      {/* ── Hair ── */}
      {hs === "short" && (
        <path d="M 17 52 Q 22 2 100 0 Q 178 2 183 52 Q 160 12 100 8 Q 40 12 17 52 Z" fill={hc}/>
      )}
      {hs === "fade" && (<>
        <path d="M 17 56 Q 22 2 100 0 Q 178 2 183 56 Q 160 14 100 10 Q 40 14 17 56 Z" fill={hc}/>
        <path d="M 18 54 Q 17 30 26 20" fill="none" stroke={hc} strokeWidth="4.5" strokeLinecap="round" opacity="0.60"/>
        <path d="M 182 54 Q 183 30 174 20" fill="none" stroke={hc} strokeWidth="4.5" strokeLinecap="round" opacity="0.60"/>
      </>)}
      {hs === "curly" && (<>
        <path d="M 15 58 Q 20 2 100 -1 Q 180 2 185 58 Q 162 12 100 8 Q 38 12 15 58 Z" fill={hc}/>
        {[34,50,66,82,100,118,134,150,166].map((x, i) => (
          <circle key={i} cx={x} cy={10+(i%3)*9} r={13} fill={hc}/>
        ))}
      </>)}
      {hs === "locs" && (<>
        <path d="M 17 56 Q 22 2 100 0 Q 178 2 183 56 Q 160 14 100 10 Q 40 14 17 56 Z" fill={hc}/>
        {[22,38,54,70,86,102,118,134,150,166,180].map((x, i) => (
          <path key={i}
            d={`M${x} ${54+(i%4)*5} Q${x-7+i} ${90+i*7} ${x-4+i*0.4} ${130+i*5}`}
            stroke={hc} strokeWidth="9" fill="none" strokeLinecap="round"/>
        ))}
      </>)}

      {/* ── Eyebrows ── */}
      {sad ? (
        <>
          <path d="M 44 44 Q 62 38 76 44" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
          <path d="M 124 44 Q 138 38 156 44" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M 44 41 Q 62 33 78 41" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
          <path d="M 122 41 Q 138 33 156 41" stroke={hc} strokeWidth="5.5" fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* ── Eyes (large, Cash Inc. style) ── */}
      <ellipse cx="70"  cy="71" rx="23" ry="21" fill="rgba(0,0,0,0.10)"/>
      <ellipse cx="130" cy="71" rx="23" ry="21" fill="rgba(0,0,0,0.10)"/>
      <circle cx="70"  cy="71" r="19" fill="white"/>
      <circle cx="130" cy="71" r="19" fill="white"/>
      <path d="M 51 63 Q 70 55 89 63" fill="rgba(0,0,0,0.08)"/>
      <path d="M 111 63 Q 130 55 149 63" fill="rgba(0,0,0,0.08)"/>
      <circle cx="72"  cy="73" r="11"  fill="#1c0f00"/>
      <circle cx="132" cy="73" r="11"  fill="#1c0f00"/>
      <circle cx="73"  cy="74" r="6.5" fill="#040100"/>
      <circle cx="133" cy="74" r="6.5" fill="#040100"/>
      <circle cx="78"  cy="65" r="5.5" fill="white"/>
      <circle cx="138" cy="65" r="5.5" fill="white"/>
      <circle cx="63"  cy="77" r="2.5" fill="rgba(255,255,255,0.50)"/>
      <circle cx="123" cy="77" r="2.5" fill="rgba(255,255,255,0.50)"/>

      {/* ── Nose (two small dots) ── */}
      <circle cx="90"  cy="98" r="4" fill={sD} opacity="0.30"/>
      <circle cx="110" cy="98" r="4" fill={sD} opacity="0.30"/>

      {/* ── Mouth ── */}
      {sad ? (
        <path d="M 62 112 Q 100 104 138 112" stroke={sD} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.60"/>
      ) : (
        <>
          <path d="M 58 108 Q 100 130 142 108" stroke={sD} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.50"/>
          <path d="M 62 109 Q 100 127 138 109" fill="white"/>
        </>
      )}

      {/* ── Cheeks ── */}
      <circle cx="36"  cy="87" r="14" fill="rgba(225,75,55,0.14)"/>
      <circle cx="164" cy="87" r="14" fill="rgba(225,75,55,0.14)"/>

      {/* ── Beard ── */}
      {beard && (<>
        <path d="M 36 106 Q 42 140 100 148 Q 158 140 164 106 Q 146 130 100 136 Q 54 130 36 106 Z"
          fill={hc} opacity="0.77"/>
        <path d="M 60 114 Q 100 108 140 114" fill={hc} opacity="0.62"/>
      </>)}
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Start · Bench · Cut
// ════════════════════════════════════════════════════════════════════════════
export function SBCScene({ era = "alltime" }: { era?: string }) {
  const S    = 0.56;
  const BENCH = 355;
  const ty   = BENCH - 206 * S;   // shorts waist anchored at bench seat
  const CX   = [138, 388, 638];

  const pls = era === "current" ? [
    { sL:"#e8c090", sM:"#c89060", sD:"#906030", jA:"#0053BC", jB:"#003d8a", shA:"#0053BC", shB:"#003d8a",
      hc:"#2a1408", hs:"short" as const, beard:false, jt:"#C4CED4", num:"77", team:"MAVS", armsup:true  },
    { sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#1D428A", jB:"#102866", shA:"#1D428A", shB:"#102866",
      hc:"#140808", hs:"fade"  as const, beard:true,  jt:"#FFC72C", num:"30", team:"GSW",  armsup:false },
    { sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", shA:"#1a1a1a", shB:"#0a0a0a",
      hc:"#0a0404", hs:"fade"  as const, beard:false, jt:"white",   num:"0",  team:"CHI",  sad:true     },
  ] : [
    { sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", shA:"#1a1a1a", shB:"#0a0a0a",
      hc:"#0a0404", hs:"bald"  as const, beard:false, jt:"white",   num:"23", team:"BULLS", armsup:true  },
    { sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", shA:"#1a1a1a", shB:"#0a0a0a",
      hc:"#0a0504", hs:"fade"  as const, beard:false, jt:"white",   num:"33", team:"BULLS", armsup:false },
    { sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#FDB927", jB:"#c48a10", shA:"#552583", shB:"#3a1a5e",
      hc:"#1a0c04", hs:"short" as const, beard:false, jt:"#552583", num:"8",  team:"LAKERS",sad:true     },
  ];

  return (
    <svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="sbc-bench" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c4882a"/>
          <stop offset="100%" stopColor="#7c4b14"/>
        </linearGradient>
        <radialGradient id="sbc-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
        </radialGradient>
        {pls.flatMap((_, i) => grads(
          `sbc${i}`,
          pls[i].sL, pls[i].sM, pls[i].sD,
          pls[i].jA, pls[i].jB,
          pls[i].shA, pls[i].shB
        ))}
      </defs>

      {/* Floor */}
      <rect x="0" y="448" width="780" height="52" fill="rgba(255,255,255,0.02)"/>
      <line x1="0" y1="449" x2="780" y2="449" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>

      {/* Bench legs */}
      {[100, 348, 596].map(x => (
        <rect key={x} x={x} y={BENCH + 32} width="14" height="90" rx="7" fill="#5a3510"/>
      ))}
      {/* Back rest */}
      <rect x="92" y={BENCH - 62} width="596" height="22" rx="8" fill="url(#sbc-bench)"/>
      {[98, 344, 590].map(x => (
        <rect key={x} x={x} y={BENCH - 62} width="14" height="96" rx="7" fill="#7a4c20"/>
      ))}
      {/* Seat */}
      <rect x="92" y={BENCH}      width="596" height="36" rx="10" fill="url(#sbc-bench)"/>
      <rect x="92" y={BENCH + 30} width="596" height="7"  rx="3"  fill="#5a3510"/>
      <rect x="94" y={BENCH + 2}  width="592" height="9"  rx="4"  fill="rgba(255,255,255,0.10)"/>

      {/* Characters */}
      {pls.map((pl, i) => {
        const tx = CX[i] - 100 * S;
        return (
          <motion.g key={i} transform={`translate(${tx},${ty}) scale(${S})`}
            animate={{ y: [0, -8, 0] }}
            transition={{ ...inf, duration: 2.4 + i * 0.4, delay: i * 0.3 }}>
            <Char
              p={`sbc${i}`} hc={pl.hc} hs={pl.hs} beard={pl.beard}
              sD={pl.sD} jt={pl.jt} num={pl.num} team={pl.team}
              sit armsup={pl.armsup} sad={pl.sad}
            />
          </motion.g>
        );
      })}

      {/* Role badges — above characters */}
      <motion.g animate={{ y:[0,-10,0] }} transition={{ ...inf, duration:2.2 }}>
        <circle cx={CX[0]} cy={ty - 28} r="26" fill="url(#sbc-star)"/>
        <text x={CX[0]} y={ty - 16} textAnchor="middle" fontSize="28"
          style={{ filter:"drop-shadow(0 0 8px #fbbf24)" }}>⭐</text>
      </motion.g>
      <text x={CX[1]} y={ty - 16} textAnchor="middle" fontSize="22">🪑</text>
      <text x={CX[2]} y={ty - 16} textAnchor="middle" fontSize="22">✂️</text>

      {/* Labels */}
      {["START","BENCH","CUT"].map((lbl, i) => (
        <text key={lbl} x={CX[i]} y="482" textAnchor="middle"
          fill={["#22c55e","#eab308","#ef4444"][i]}
          fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">{lbl}</text>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Guess Who
// ════════════════════════════════════════════════════════════════════════════
export function GuessWhoScene({ era = "alltime" }: { era?: string }) {
  const S = 0.60;
  const pl = era === "current"
    ? { sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#1D428A", jB:"#102866", shA:"#1D428A", shB:"#102866",
        hc:"#140808", hs:"fade" as const, beard:true,  jt:"#FFC72C", num:"30", team:"GSW" }
    : { sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#FDB927", jB:"#c48a10", shA:"#552583", shB:"#3a1a5e",
        hc:"#080404", hs:"bald" as const, beard:false, jt:"#552583", num:"23", team:"LAKERS" };

  const TX = 118 - 100 * S;
  const TY = 460 - 293 * S;

  const qPos = [
    { x:535, y:72,  s:1.3, d:0   },
    { x:582, y:205, s:0.9, d:0.5 },
    { x:514, y:328, s:1.0, d:1.0 },
    { x:86,  y:84,  s:0.85,d:0.3 },
    { x:52,  y:265, s:1.1, d:0.7 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {grads("gw0", pl.sL, pl.sM, pl.sD, pl.jA, pl.jB, pl.shA, pl.shB)}
        <radialGradient id="gw-glass" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="rgba(167,243,208,0.18)"/>
          <stop offset="100%" stopColor="rgba(20,184,166,0.05)"/>
        </radialGradient>
        <filter id="gw-blur"><feGaussianBlur stdDeviation="3.5"/></filter>
        <filter id="gw-glow">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {qPos.map((q, i) => (
        <motion.text key={i} x={q.x} y={q.y} fontSize={30 * q.s}
          fill="rgba(255,255,255,0.22)" fontWeight="900" textAnchor="middle"
          animate={{ y:[q.y, q.y-14, q.y], opacity:[0.22,0.55,0.22] }}
          transition={{ ...inf, duration:2.4 + i*0.4, delay:q.d }}>?</motion.text>
      ))}

      <g filter="url(#gw-blur)" opacity="0.28">
        <ellipse cx="432" cy="228" rx="54" ry="72" fill="#94a3b8"/>
        <circle  cx="432" cy="130" r="46" fill="#94a3b8"/>
      </g>

      <motion.g transform="translate(334,250)" animate={{ rotate:[-6,6,-6] }} transition={{ ...inf, duration:3.5 }}>
        <rect x="62" y="78" width="18" height="112" rx="9" fill="#374151" transform="rotate(40,62,78)"/>
        <circle cx="0" cy="0" r="96" fill="url(#gw-glass)"/>
        <circle cx="0" cy="0" r="96" fill="none" stroke="#14b8a6" strokeWidth="10" opacity="0.7" filter="url(#gw-glow)"/>
        <circle cx="0" cy="0" r="96" fill="none" stroke="#2dd4bf" strokeWidth="4" opacity="0.9"/>
        <ellipse cx="-30" cy="-34" rx="29" ry="19" fill="rgba(255,255,255,0.11)" transform="rotate(-25,-30,-34)"/>
      </motion.g>

      <motion.g transform={`translate(${TX},${TY}) scale(${S})`}
        animate={{ y:[0,-14,0] }} transition={{ ...inf, duration:2.8 }}>
        <Char p="gw0" hc={pl.hc} hs={pl.hs} beard={pl.beard} sD={pl.sD} jt={pl.jt} num={pl.num} team={pl.team}/>
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Stat Line Guesser
// ════════════════════════════════════════════════════════════════════════════
export function StatLineScene({ era = "alltime" }: { era?: string }) {
  const S = 0.62;
  const pl = era === "current"
    ? { sL:"#f0c898", sM:"#d8a878", sD:"#b08858", jA:"#1D428A", jB:"#102866", shA:"#FFC72C", shB:"#c49a10",
        hc:"#5a3010", hs:"curly" as const, beard:true,  jt:"white",   num:"15", team:"DEN" }
    : { sL:"#1e1208", sM:"#160e06", sD:"#0e0804", jA:"#007A33", jB:"#004d20", shA:"#007A33", shB:"#004d20",
        hc:"#0a0403", hs:"locs"  as const, beard:false, jt:"white",   num:"34", team:"BUCKS" };

  const TX = 138 - 100 * S;
  const TY = 460 - 293 * S;
  const stats = [
    { label:"PPG", value:"32.1",  delay:0    },
    { label:"RPG", value:"9.4",   delay:0.25 },
    { label:"APG", value:"5.6",   delay:0.5  },
    { label:"ERA", value:"• • •", delay:0.75 },
    { label:"TEAM",value:"• • •", delay:1.0  },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {grads("sl0", pl.sL, pl.sM, pl.sD, pl.jA, pl.jB, pl.shA, pl.shB)}
        <linearGradient id="sl-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)"/>
        </linearGradient>
      </defs>

      <motion.g transform="translate(416,128)" animate={{ y:[0,-10,0] }} transition={{ ...inf, duration:3.2 }}>
        <rect x="-145" y="22"  width="290" height="8"   rx="4" fill="rgba(0,0,0,0.3)"/>
        <rect x="-145" y="-22" width="290" height="218" rx="16" fill="url(#sl-board)"/>
        <rect x="-145" y="-22" width="290" height="218" rx="16" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5"/>
        <rect x="-145" y="-22" width="290" height="44"  rx="16" fill="rgba(20,184,166,0.15)"/>
        <text x="0" y="12" textAnchor="middle" fill="#2dd4bf" fontSize="13" fontWeight="800"
          fontFamily="monospace" letterSpacing="4">CAREER STATS</text>
        <rect x="-145" y="20" width="290" height="1" fill="rgba(20,184,166,0.3)"/>
        {stats.map((s, i) => (
          <motion.g key={s.label} transform={`translate(0,${46 + i * 36})`}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:s.delay, duration:0.4 }}>
            <text x="-120" y="14" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700"
              fontFamily="monospace">{s.label}</text>
            <text x="130" y="14" fill={s.value.includes("•") ? "rgba(255,255,255,0.22)" : "#f0fdf4"}
              fontSize="14" fontWeight="900" fontFamily="monospace" textAnchor="end">{s.value}</text>
            {i < stats.length-1 && <line x1="-130" y1="22" x2="130" y2="22" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>}
          </motion.g>
        ))}
      </motion.g>

      <motion.g transform="translate(268,285)" animate={{ rotate:[-8,2,-8] }} transition={{ ...inf, duration:2.0 }}>
        <rect x="-4" y="-82" width="8" height="86" rx="4" fill="#374151"/>
        <circle cx="0" cy="-82" r="6" fill="#14b8a6"/>
      </motion.g>

      <motion.g transform={`translate(${TX},${TY}) scale(${S})`}
        animate={{ y:[0,-10,0] }} transition={{ ...inf, duration:2.6, delay:0.3 }}>
        <Char p="sl0" hc={pl.hc} hs={pl.hs} beard={pl.beard} sD={pl.sD} jt={pl.jt} num={pl.num} team={pl.team} wave/>
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Lineup Guesser
// ════════════════════════════════════════════════════════════════════════════
export function LineupScene() {
  // Back row (3, rendered first = behind): feet at fy=390, S=0.36
  // Front row (2, rendered last = front): feet at fy=420, S=0.42
  // x-ranges: back [74-146][284-356][494-566], front[173-257][383-467] — ≥26px gaps
  const players = [
    { cx:110, fy:390, S:0.36, d:0.15, sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#007A33", jB:"#004d20", shA:"#007A33", shB:"#004d20", hc:"#140808", hs:"fade"  as const, beard:false, jt:"white",   num:"SG", team:"SHOOT" },
    { cx:320, fy:390, S:0.36, d:0,    sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", shA:"#1a1a1a", shB:"#0a0a0a", hc:"#0a0404", hs:"bald"  as const, beard:false, jt:"white",   num:"PG", team:"POINT" },
    { cx:530, fy:390, S:0.36, d:0.3,  sL:"#e8c090", sM:"#c89060", sD:"#906030", jA:"#1D428A", jB:"#102866", shA:"#1D428A", shB:"#102866", hc:"#2a1408", hs:"short" as const, beard:false, jt:"#FFC72C", num:"SF", team:"SMALL" },
    { cx:215, fy:420, S:0.42, d:0.45, sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#F58426", jB:"#b85e10", shA:"#006BB6", shB:"#004a80", hc:"#0a0404", hs:"curly" as const, beard:true,  jt:"white",   num:"PF", team:"POWER" },
    { cx:425, fy:420, S:0.42, d:0.6,  sL:"#f0c898", sM:"#d8a878", sD:"#b08858", jA:"#FDB927", jB:"#c48a10", shA:"#552583", shB:"#3a1a5e", hc:"#5a3010", hs:"curly" as const, beard:true,  jt:"#552583", num:"C",  team:"CNTRI" },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {players.flatMap(pl => grads(`lu${pl.num}`, pl.sL, pl.sM, pl.sD, pl.jA, pl.jB, pl.shA, pl.shB))}
      </defs>

      <ellipse cx="320" cy="345" rx="288" ry="110" fill="rgba(255,255,255,0.025)"/>
      <ellipse cx="320" cy="345" rx="76"  ry="30"  fill="none" stroke="rgba(20,184,166,0.20)" strokeWidth="2"/>
      <path d="M102 422 Q320 218 538 422" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="2" strokeDasharray="6 4"/>
      <path d="M246 218 L246 372 Q320 392 394 372 L394 218" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5"/>
      <ellipse cx="320" cy="172" rx="18" ry="8" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="2.5"/>
      {players.map((p, i) => (
        <line key={i} x1="320" y1="298" x2={p.cx} y2={p.fy - 293 * p.S}
          stroke="rgba(20,184,166,0.08)" strokeWidth="1" strokeDasharray="4 4"/>
      ))}

      {players.map((pl, i) => {
        const tx = pl.cx - 100 * pl.S;
        const ty = pl.fy - 293 * pl.S;
        return (
          <motion.g key={i} transform={`translate(${tx},${ty}) scale(${pl.S})`}
            animate={{ y:[0,-10,0] }}
            transition={{ ...inf, duration:2.2 + i*0.3, delay:pl.d }}>
            <Char p={`lu${pl.num}`} hc={pl.hc} hs={pl.hs} beard={pl.beard} sD={pl.sD}
              jt={pl.jt} num={pl.num} team={pl.team}/>
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
  const S  = 0.62;
  const TX = 198 - 100 * S;
  const TY = 460 - 293 * S;
  const badges = [
    { label:"LAL", color:"#FDB927", x:492, y:118, d:0   },
    { label:"GSW", color:"#006BB6", x:550, y:248, d:0.4 },
    { label:"BOS", color:"#007A33", x:486, y:370, d:0.8 },
    { label:"NYK", color:"#F58426", x:96,  y:128, d:0.2 },
    { label:"CHI", color:"#CE1141", x:68,  y:272, d:0.6 },
    { label:"MIA", color:"#98002E", x:118, y:390, d:1.0 },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {grads("tt0","#7a4a2a","#5c3218","#3c1e0c","#552583","#3a1a5e","#FDB927","#c48a10")}
        <radialGradient id="tt-ball" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#c2410c"/>
        </radialGradient>
      </defs>

      {badges.map((b, i) => (
        <motion.g key={b.label} animate={{ y:[b.y,b.y-14,b.y], rotate:[-5,5,-5] }}
          transition={{ ...inf, duration:2.5 + i*0.3, delay:b.d }}>
          <rect x={b.x-30} y={b.y-20} width="60" height="40" rx="10" fill={b.color} opacity="0.88"/>
          <rect x={b.x-30} y={b.y-20} width="60" height="40" rx="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
          <ellipse cx={b.x-10} cy={b.y-10} rx="15" ry="7" fill="rgba(255,255,255,0.22)" transform={`rotate(-20,${b.x-10},${b.y-10})`}/>
          <text x={b.x} y={b.y+6} textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">{b.label}</text>
        </motion.g>
      ))}

      <motion.g transform="translate(510,80)" animate={{ rotate:[-3,3,-3] }} transition={{ ...inf, duration:2.0 }}>
        <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.06)"/>
        <circle cx="0" cy="0" r="50" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.6"/>
        <rect x="-8" y="-56" width="16" height="10" rx="5" fill="#374151"/>
        <rect x="-14" y="-62" width="28" height="8" rx="4" fill="#374151"/>
        <motion.line x1="0" y1="0" x2="0" y2="-34" stroke="#f97316" strokeWidth="3"
          strokeLinecap="round" animate={{ rotate:[0,360] }}
          transition={{ ...inf, duration:2, ease:"linear" }} style={{ transformOrigin:"0px 0px" }}/>
        <line x1="0" y1="0" x2="24" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#14b8a6"/>
        {Array.from({length:12},(_,i)=>{const a=(i/12)*Math.PI*2-Math.PI/2;return(
          <line key={i} x1={Math.cos(a)*38} y1={Math.sin(a)*38} x2={Math.cos(a)*44} y2={Math.sin(a)*44}
            stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        );})}
      </motion.g>

      <motion.g transform="translate(315,122)"
        animate={{ y:[0,-32,0], rotate:[0,360] }}
        transition={{ y:{...inf,duration:0.9,ease:"easeInOut"}, rotate:{...inf,duration:0.9,ease:"linear"} }}>
        <circle cx="0" cy="0" r="32" fill="url(#tt-ball)"/>
        <path d="M-32 0 Q0 -16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6"/>
        <path d="M-32 0 Q0 16 32 0"  stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6"/>
        <line x1="0" y1="-32" x2="0" y2="32" stroke="#7c2d12" strokeWidth="2" opacity="0.6"/>
        <ellipse cx="-10" cy="-10" rx="10" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-25,-10,-10)"/>
      </motion.g>

      <motion.g transform={`translate(${TX},${TY}) scale(${S})`}
        animate={{ y:[0,-10,0] }} transition={{ ...inf, duration:2.4 }}>
        <Char p="tt0" hc="#0a0404" hs="bald" beard={false} sD="#3c1e0c" jt="#FDB927" num="23" team="LAKERS" armsup/>
      </motion.g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Timed: Name Players Per Team
// ════════════════════════════════════════════════════════════════════════════
export function TimedPlayersScene() {
  const S  = 0.62;
  const TX = 148 - 100 * S;
  const TY = 460 - 293 * S;
  const roster = [
    { name:"LeBron James",  done:true  },
    { name:"Anthony Davis", done:true  },
    { name:"Austin Reaves", done:false },
    { name:"• • • • • •",  done:false },
    { name:"• • • • •",    done:false },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {grads("tp0","#7a4a2a","#5c3218","#3c1e0c","#FDB927","#c48a10","#552583","#3a1a5e")}
        <linearGradient id="tp-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.10)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)"/>
        </linearGradient>
      </defs>

      <motion.g transform="translate(422,212)" animate={{ y:[0,-8,0], rotate:[-2,2,-2] }} transition={{ ...inf, duration:3.0 }}>
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="url(#tp-board)"/>
        <rect x="-130" y="-100" width="260" height="280" rx="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        <rect x="-30"  y="-118" width="60"  height="28"  rx="8"  fill="#374151"/>
        <rect x="-20"  y="-113" width="40"  height="18"  rx="6"  fill="#4b5563"/>
        <text x="0" y="-70" textAnchor="middle" fill="#14b8a6" fontSize="11" fontWeight="800"
          fontFamily="monospace" letterSpacing="3">ROSTER</text>
        <line x1="-110" y1="-56" x2="110" y2="-56" stroke="rgba(20,184,166,0.3)" strokeWidth="1"/>
        {roster.map((r,i) => (
          <g key={i} transform={`translate(0,${-38+i*44})`}>
            <rect x="-110" y="-12" width="22" height="22" rx="6"
              fill={r.done ? "#22c55e" : "rgba(255,255,255,0.08)"}
              stroke={r.done ? "#16a34a" : "rgba(255,255,255,0.15)"} strokeWidth="1.5"/>
            {r.done && <text x="-99" y="5" fill="white" fontSize="13" fontWeight="900" textAnchor="middle">✓</text>}
            <text x="-78" y="5" fill={r.done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)"}
              fontSize="12" fontWeight={r.done ? "700" : "400"} fontFamily="sans-serif">{r.name}</text>
            {i < roster.length-1 && <line x1="-110" y1="18" x2="110" y2="18" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>}
          </g>
        ))}
      </motion.g>

      <motion.g animate={{ y:[75,60,75], rotate:[3,-3,3] }} transition={{ ...inf, duration:2.8 }}>
        <rect x="480" y="75" width="84" height="52" rx="14" fill="#FDB927" opacity="0.88"/>
        <rect x="480" y="75" width="84" height="52" rx="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <ellipse cx="498" cy="92" rx="13" ry="7" fill="rgba(255,255,255,0.26)" transform="rotate(-20,498,92)"/>
        <text x="522" y="107" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="monospace">LAL</text>
      </motion.g>

      <motion.g transform={`translate(${TX},${TY}) scale(${S})`}
        animate={{ y:[0,-12,0] }} transition={{ ...inf, duration:2.5 }}>
        <Char p="tp0" hc="#0a0404" hs="bald" beard={false} sD="#3c1e0c" jt="#552583" num="23" team="LAKERS" wave/>
      </motion.g>
    </svg>
  );
}
