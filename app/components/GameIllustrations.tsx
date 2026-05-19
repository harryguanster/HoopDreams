"use client";
import { motion } from "framer-motion";

const inf = { repeat: Infinity, ease: "easeInOut" as const };

// Returns a plain ARRAY — safe to spread directly inside <defs>
// (using a React component/fragment inside <defs> breaks gradient resolution)
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

// Character drawn in local 200 × 480 space.
// Hip is at local y=310. Place with translate(cx−100·s, benchY−310·s) scale(s).
interface CP {
  p: string;
  hc: string; hs: "bald"|"short"|"fade"|"curly"|"locs";
  beard: boolean; sD: string;
  jt: string; num: string; team: string;
  sit?: boolean; sad?: boolean; wave?: boolean; armsup?: boolean;
}
function Char({ p, hc, hs, beard, sD, jt, num, team, sit, sad, wave, armsup }: CP) {
  const sk = `url(#${p}s)`;
  const jr = `url(#${p}j)`;
  const sh = `url(#${p}h)`;
  const shoe = `url(#${p}e)`;

  return (
    <g>
      {/* Floor shadow */}
      {!sit && <ellipse cx="100" cy="474" rx="55" ry="12" fill="rgba(0,0,0,0.28)"/>}

      {/* ── Shoes ── */}
      <ellipse cx="64"  cy="460" rx="32" ry="14" fill={shoe}/>
      <ellipse cx="136" cy="460" rx="32" ry="14" fill={shoe}/>
      <ellipse cx="54"  cy="452" rx="14" ry="6"  fill="rgba(255,255,255,0.16)" transform="rotate(-14 54 452)"/>
      <ellipse cx="126" cy="452" rx="14" ry="6"  fill="rgba(255,255,255,0.16)" transform="rotate(14 126 452)"/>

      {/* ── Ankle socks ── */}
      <rect x="46"  y="435" width="36" height="24" rx="10" fill="#eeeeee"/>
      <rect x="118" y="435" width="36" height="24" rx="10" fill="#eeeeee"/>
      <rect x="46"  y="435" width="36" height="5"  rx="2"  fill="#cccccc"/>
      <rect x="118" y="435" width="36" height="5"  rx="2"  fill="#cccccc"/>

      {/* ── Legs ── */}
      <rect x="46"  y="358" width="34" height="80" rx="13" fill={sk}/>
      <rect x="120" y="358" width="34" height="80" rx="13" fill={sk}/>

      {/* ── Shorts ── */}
      <rect x="28" y="308" width="144" height="58" rx="10" fill={sh}/>
      <line x1="100" y1="308" x2="100" y2="362" stroke="rgba(0,0,0,0.14)" strokeWidth="2.5"/>
      <rect x="28" y="348" width="144" height="12" rx="6" fill="rgba(0,0,0,0.10)"/>

      {/* ── Left arm ── */}
      {armsup
        ? <><path d="M 30 195 Q 6 165 2 128" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="1" cy="120" r="20" fill={sk}/></>
        : sit
        ? <><path d="M 30 195 Q 18 244 24 298" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="23" cy="303" r="20" fill={sk}/></>
        : <><path d="M 30 195 Q 8 258 4 314" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="3" cy="318" r="20" fill={sk}/></>
      }

      {/* ── Right arm ── */}
      {armsup
        ? <><path d="M 170 195 Q 194 165 198 128" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="199" cy="120" r="20" fill={sk}/></>
        : wave
        ? <><path d="M 170 195 Q 196 155 200 112" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="201" cy="104" r="20" fill={sk}/></>
        : sit
        ? <><path d="M 170 195 Q 182 244 176 298" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="177" cy="303" r="20" fill={sk}/></>
        : <><path d="M 170 195 Q 192 258 196 314" stroke={sk} strokeWidth="32" fill="none" strokeLinecap="round"/>
            <circle cx="197" cy="318" r="20" fill={sk}/></>
      }

      {/* ── Jersey / Torso ── */}
      <path d="M 26 194 Q 42 178 66 176 L 70 194 Q 100 206 130 194 L 134 176 Q 158 178 174 194 L 176 318 Q 100 334 24 318 Z" fill={jr}/>
      <path d="M 70 194 Q 100 216 130 194" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3.5"/>
      <path d="M 26 194 Q 42 178 66 176" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2"/>
      <path d="M 174 194 Q 158 178 134 176" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2"/>
      <ellipse cx="66" cy="207" rx="27" ry="18" fill="rgba(255,255,255,0.09)" transform="rotate(-20 66 207)"/>
      <text x="100" y="256" textAnchor="middle" fill={jt}
        fontSize="15" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" letterSpacing="1" opacity="0.88">{team}</text>
      <text x="100" y="305" textAnchor="middle" fill={jt}
        fontSize="48" fontWeight="900" fontFamily="'Arial Black',Arial,sans-serif" opacity="0.90">{num}</text>

      {/* ── Neck ── */}
      <rect x="84" y="157" width="32" height="28" rx="12" fill={sk}/>
      <ellipse cx="100" cy="181" rx="16" ry="5" fill="rgba(0,0,0,0.16)"/>

      {/* ── Head ── */}
      <ellipse cx="100" cy="88" rx="65" ry="72" fill={sk}/>
      {/* 3-D shading */}
      <ellipse cx="132" cy="92" rx="36" ry="56" fill="rgba(0,0,0,0.17)"/>
      <ellipse cx="100" cy="150" rx="40" ry="16" fill="rgba(0,0,0,0.18)"/>
      <ellipse cx="76"  cy="50"  rx="30" ry="20" fill="rgba(255,255,255,0.16)" transform="rotate(-22 76 50)"/>
      <ellipse cx="60"  cy="92"  rx="18" ry="12" fill="rgba(255,255,255,0.09)" transform="rotate(-12 60 92)"/>
      {/* Jaw */}
      <path d="M 44 104 Q 54 150 100 160 Q 146 150 156 104" fill={sk}/>

      {/* ── Ears ── */}
      <ellipse cx="35" cy="90" rx="9"  ry="13" fill={sk}/>
      <ellipse cx="165" cy="90" rx="9" ry="13" fill={sk}/>
      <ellipse cx="35" cy="90" rx="5"  ry="8"  fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="165" cy="90" rx="5" ry="8"  fill="rgba(0,0,0,0.15)"/>

      {/* ── Hair ── */}
      {hs === "short" && (
        <path d="M 35 74 Q 40 15 100 10 Q 160 15 165 74 Q 145 28 100 24 Q 55 28 35 74 Z" fill={hc}/>
      )}
      {hs === "fade" && (<>
        <path d="M 35 76 Q 40 18 100 12 Q 160 18 165 76 Q 145 30 100 26 Q 55 30 35 76 Z" fill={hc}/>
        <path d="M 35 76 Q 36 55 44 46" fill="none" stroke={hc} strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
        <path d="M 165 76 Q 164 55 156 46" fill="none" stroke={hc} strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      </>)}
      {hs === "curly" && (<>
        <path d="M 33 78 Q 38 14 100 8 Q 162 14 167 78 Q 148 26 100 22 Q 52 26 33 78 Z" fill={hc}/>
        {[40,54,68,82,96,110,124,138,152].map((x, i) => (
          <circle key={i} cx={x} cy={19 + (i % 3) * 10} r={13} fill={hc}/>
        ))}
      </>)}
      {hs === "locs" && (<>
        <path d="M 35 74 Q 40 18 100 12 Q 160 18 165 74 Q 145 28 100 24 Q 55 28 35 74 Z" fill={hc}/>
        {[36, 48, 62, 76, 90, 104, 118, 132, 144, 158].map((x, i) => (
          <path key={i}
            d={`M${x} ${68 + (i % 4) * 4} Q${x - 8 + i} ${108 + i * 8} ${x - 4 + i * 0.5} ${145 + i * 6}`}
            stroke={hc} strokeWidth="9" fill="none" strokeLinecap="round"/>
        ))}
      </>)}

      {/* ── Eyebrows ── */}
      {sad
        ? <><path d="M 48 62 Q 66 56 78 61" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M 122 61 Q 134 56 152 62" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/></>
        : <><path d="M 48 58 Q 66 50 80 57" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M 120 57 Q 134 50 152 58" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round"/></>
      }

      {/* ── Eyes ── */}
      <ellipse cx="72"  cy="76" rx="22" ry="18" fill="rgba(0,0,0,0.13)"/>
      <ellipse cx="128" cy="76" rx="22" ry="18" fill="rgba(0,0,0,0.13)"/>
      <ellipse cx="72"  cy="76" rx="18" ry="15" fill="white"/>
      <ellipse cx="128" cy="76" rx="18" ry="15" fill="white"/>
      <path d="M 54 68 Q 72 62 90 68" fill={sD} opacity="0.28"/>
      <path d="M 110 68 Q 128 62 146 68" fill={sD} opacity="0.28"/>
      <circle cx="74"  cy="77" r="10"  fill="#180e06"/>
      <circle cx="130" cy="77" r="10"  fill="#180e06"/>
      <circle cx="75"  cy="78" r="5.5" fill="#040101"/>
      <circle cx="131" cy="78" r="5.5" fill="#040101"/>
      <circle cx="80"  cy="71" r="5"   fill="white"/>
      <circle cx="136" cy="71" r="5"   fill="white"/>
      <circle cx="68"  cy="81" r="2.2" fill="rgba(255,255,255,0.5)"/>
      <circle cx="124" cy="81" r="2.2" fill="rgba(255,255,255,0.5)"/>

      {/* ── Nose ── */}
      <ellipse cx="88"  cy="105" rx="7" ry="5" fill={sD} opacity="0.4"/>
      <ellipse cx="112" cy="105" rx="7" ry="5" fill={sD} opacity="0.4"/>

      {/* ── Mouth ── */}
      {sad
        ? <path d="M 68 124 Q 100 114 132 124" stroke={sD} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7"/>
        : (<>
            <path d="M 62 118 Q 100 142 138 118" stroke={sD} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.65"/>
            <path d="M 66 119 Q 100 138 134 119" fill="white"/>
            <line x1="80"  y1="119" x2="78"  y2="133" stroke="rgba(200,200,200,0.5)" strokeWidth="1.3"/>
            <line x1="100" y1="120" x2="100" y2="136" stroke="rgba(200,200,200,0.5)" strokeWidth="1.3"/>
            <line x1="120" y1="119" x2="122" y2="133" stroke="rgba(200,200,200,0.5)" strokeWidth="1.3"/>
            <path d="M 62 118 Q 78 110 100 113 Q 122 110 138 118" fill={sD} opacity="0.48"/>
          </>)
      }

      {/* ── Cheeks ── */}
      <circle cx="48"  cy="96" r="13" fill="rgba(220,80,60,0.17)"/>
      <circle cx="152" cy="96" r="13" fill="rgba(220,80,60,0.17)"/>

      {/* ── Beard ── */}
      {beard && (<>
        <path d="M 42 108 Q 46 154 100 165 Q 154 154 158 108 Q 142 136 100 142 Q 58 136 42 108 Z"
          fill={hc} opacity="0.80"/>
        <path d="M 64 114 Q 100 106 136 114" fill={hc} opacity="0.72"/>
        <path d="M 48 116 Q 54 136 62 144" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>)}
    </g>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Start · Bench · Cut
// All three players seated on a wide bench, evenly spread
// ════════════════════════════════════════════════════════════════════════════
export function SBCScene({ era = "alltime" }: { era?: string }) {
  // Positioning: hip=y310 local, bench seat=y355 parent, scale=0.52
  const S = 0.52;
  const BENCH = 355; // bench seat y in parent coords
  const ty = BENCH - 310 * S;   // = 355 - 161.2 = 193.8 ≈ 194
  const CX = [138, 388, 638];   // player center-x values

  // alltime: Jordan (Bulls), Pippen (Bulls), Kobe (Lakers)
  // current: Luka (Mavs), Steph (Warriors), random cut
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
          <stop offset="0%"  stopColor="#fbbf24" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
        </radialGradient>
        {pls.map((_, i) => grads(
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
      <rect x="92" y={BENCH} width="596" height="36" rx="10" fill="url(#sbc-bench)"/>
      <rect x="92" y={BENCH + 30} width="596" height="7" rx="3" fill="#5a3510"/>
      <rect x="94" y={BENCH + 2} width="592" height="9" rx="4" fill="rgba(255,255,255,0.10)"/>

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

      {/* Role badges */}
      <motion.g animate={{ y:[0,-10,0] }} transition={{ ...inf, duration:2.2 }}>
        <circle cx={CX[0]} cy={ty + 5} r="26" fill="url(#sbc-star)"/>
        <text x={CX[0]} y={ty + 15} textAnchor="middle" fontSize="28" style={{ filter:"drop-shadow(0 0 8px #fbbf24)" }}>⭐</text>
      </motion.g>
      <text x={CX[1]} y={ty + 10} textAnchor="middle" fontSize="22">🪑</text>
      <text x={CX[2]} y={ty + 10} textAnchor="middle" fontSize="22">✂️</text>

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
  const S = 0.58;
  const pl = era === "current"
    ? { sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#1D428A", jB:"#102866", shA:"#1D428A", shB:"#102866",
        hc:"#140808", hs:"fade" as const, beard:true,  jt:"#FFC72C", num:"30", team:"GSW" }
    : { sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#FDB927", jB:"#c48a10", shA:"#552583", shB:"#3a1a5e",
        hc:"#080404", hs:"bald" as const, beard:false, jt:"#552583", num:"23", team:"LAKERS" };

  const S_TX = 118 - 100 * S;
  const S_TY = 460 - 310 * S;

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

      <motion.g transform={`translate(${S_TX},${S_TY}) scale(${S})`}
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
  const S = 0.60;
  const pl = era === "current"
    ? { sL:"#f0c898", sM:"#d8a878", sD:"#b08858", jA:"#1D428A", jB:"#102866", shA:"#FFC72C", shB:"#c49a10",
        hc:"#5a3010", hs:"curly" as const, beard:true,  jt:"white",   num:"15", team:"DEN" }
    : { sL:"#1e1208", sM:"#160e06", sD:"#0e0804", jA:"#007A33", jB:"#004d20", shA:"#007A33", shB:"#004d20",
        hc:"#0a0403", hs:"locs"  as const, beard:false, jt:"white",   num:"34", team:"BUCKS" };

  const TX = 138 - 100 * S;
  const TY = 460 - 310 * S;
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
        <text x="0" y="12" textAnchor="middle" fill="#2dd4bf" fontSize="13" fontWeight="800" fontFamily="monospace" letterSpacing="4">CAREER STATS</text>
        <rect x="-145" y="20" width="290" height="1" fill="rgba(20,184,166,0.3)"/>
        {stats.map((s, i) => (
          <motion.g key={s.label} transform={`translate(0,${46 + i * 36})`}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:s.delay, duration:0.4 }}>
            <text x="-120" y="14" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700" fontFamily="monospace">{s.label}</text>
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
  const players = [
    { cx:320, fy:420, S:0.44, d:0,    sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#CE1141", jB:"#8b0d2c", shA:"#1a1a1a", shB:"#0a0a0a", hc:"#0a0404", hs:"bald"  as const, beard:false, jt:"white",   num:"PG", team:"POINT" },
    { cx:178, fy:405, S:0.42, d:0.15, sL:"#c08060", sM:"#986040", sD:"#704030", jA:"#007A33", jB:"#004d20", shA:"#007A33", shB:"#004d20", hc:"#140808", hs:"fade"  as const, beard:false, jt:"white",   num:"SG", team:"SHOOT" },
    { cx:462, fy:405, S:0.42, d:0.3,  sL:"#e8c090", sM:"#c89060", sD:"#906030", jA:"#1D428A", jB:"#102866", shA:"#1D428A", shB:"#102866", hc:"#2a1408", hs:"short" as const, beard:false, jt:"#FFC72C", num:"SF", team:"SMALL" },
    { cx:228, fy:390, S:0.40, d:0.45, sL:"#7a4a2a", sM:"#5c3218", sD:"#3c1e0c", jA:"#F58426", jB:"#b85e10", shA:"#006BB6", shB:"#004a80", hc:"#0a0404", hs:"curly" as const, beard:true,  jt:"white",   num:"PF", team:"POWER" },
    { cx:412, fy:390, S:0.40, d:0.6,  sL:"#f0c898", sM:"#d8a878", sD:"#b08858", jA:"#FDB927", jB:"#c48a10", shA:"#552583", shB:"#3a1a5e", hc:"#5a3010", hs:"curly" as const, beard:true,  jt:"#552583", num:"C",  team:"CNTRI" },
  ];

  return (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow:"visible" }}>
      <defs>
        {players.map(pl => grads(`lu${pl.num}`, pl.sL, pl.sM, pl.sD, pl.jA, pl.jB, pl.shA, pl.shB))}
      </defs>

      <ellipse cx="320" cy="345" rx="288" ry="110" fill="rgba(255,255,255,0.025)"/>
      <ellipse cx="320" cy="345" rx="76" ry="30" fill="none" stroke="rgba(20,184,166,0.20)" strokeWidth="2"/>
      <path d="M102 422 Q320 218 538 422" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="2" strokeDasharray="6 4"/>
      <path d="M246 218 L246 372 Q320 392 394 372 L394 218" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1.5"/>
      <ellipse cx="320" cy="172" rx="18" ry="8" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="2.5"/>
      {players.map((p, i) => (
        <line key={i} x1="320" y1="298" x2={p.cx} y2={p.fy - 310 * p.S}
          stroke="rgba(20,184,166,0.08)" strokeWidth="1" strokeDasharray="4 4"/>
      ))}

      {players.map((pl, i) => {
        const tx = pl.cx - 100 * pl.S;
        const ty = pl.fy - 310 * pl.S;
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
  const S = 0.60;
  const TX = 198 - 100 * S;
  const TY = 460 - 310 * S;
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
          <line key={i} x1={Math.cos(a)*38} y1={Math.sin(a)*38} x2={Math.cos(a)*44} y2={Math.sin(a)*44} stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        );})}
      </motion.g>

      <motion.g transform="translate(315,122)"
        animate={{ y:[0,-32,0], rotate:[0,360] }}
        transition={{ y:{...inf,duration:0.9,ease:"easeInOut"}, rotate:{...inf,duration:0.9,ease:"linear"} }}>
        <circle cx="0" cy="0" r="32" fill="url(#tt-ball)"/>
        <path d="M-32 0 Q0 -16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6"/>
        <path d="M-32 0 Q0 16 32 0" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.6"/>
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
  const S = 0.60;
  const TX = 148 - 100 * S;
  const TY = 460 - 310 * S;
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
        <rect x="-30" y="-118" width="60" height="28" rx="8" fill="#374151"/>
        <rect x="-20" y="-113" width="40" height="18" rx="6" fill="#4b5563"/>
        <text x="0" y="-70" textAnchor="middle" fill="#14b8a6" fontSize="11" fontWeight="800" fontFamily="monospace" letterSpacing="3">ROSTER</text>
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
