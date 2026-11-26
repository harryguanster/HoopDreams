"use client";

export default function PixelBackground() {
  // Far skyline – varied heights, more architectural interest
  const FAR: number[][] = [
    [100,232,26,198],[129,258,18,172],[150,238,40,192],[193,268,24,162],
    [220,215,28,215],[252,244,16,186],[271,230,50,200],[325,255,26,175],
    [354,242,12,188],
    // central towers — tallest
    [418,178,22,252],[443,196,34,234],[480,164,26,266],
    [509,208,18,222],[530,185,42,245],[575,218,20,212],
    [618,170,16,260],[637,185,20,245],
    // sun gap 657–709
    [710,185,20,245],[729,170,16,260],
    [748,218,20,212],[771,185,42,245],[816,208,18,222],
    [837,164,26,266],[866,196,34,234],[903,178,22,252],
    // right cluster
    [947,242,12,188],[962,255,26,175],[991,230,50,200],
    [1045,244,16,186],[1065,215,28,215],[1097,268,24,162],
    [1124,238,40,192],[1167,258,18,172],[1188,232,26,198],
  ];

  // Mid-distance buildings – slightly warmer
  const MID: number[][] = [
    [100,342,48,88],[152,352,40,78],[196,345,54,85],[254,355,44,75],
    [302,348,58,82],[364,360,42,70],[410,340,50,90],[464,350,46,80],
    [514,362,36,68],[554,357,42,73],[600,368,30,62],
    // right half
    [736,368,30,62],[770,357,42,73],[816,362,36,68],
    [856,350,46,80],[906,340,50,90],[960,360,42,70],[1006,348,58,82],
    [1068,355,44,75],[1116,345,54,85],[1174,352,40,78],[1218,342,48,88],
  ];

  // Antenna spikes [cx, tipY]
  const ANTENNAS: number[][] = [
    [481,142],[619,148],[730,148],[838,142],
    [420,155],[904,155],[273,207],[1096,207],
  ];

  // Lit windows
  const WINDOWS: number[][] = [
    [138,268],[153,290],[163,255],[175,278],
    [290,268],[306,290],[296,252],[320,275],
    [455,212],[472,232],[490,207],[508,228],
    [544,200],[560,220],[578,198],
    [786,198],[804,220],[822,200],
    [858,207],[876,232],[895,212],
    [1056,252],[1072,275],[1092,268],[1108,290],
    [1216,268],[1232,290],[1248,255],
  ];

  // Crowd sparkle dots
  const SPARKLES: number[][] = [
    [168,452],[210,460],[265,445],[320,468],[378,455],[430,472],
    [488,448],[542,463],[598,450],[654,470],[708,455],[762,468],
    [818,453],[872,465],[926,448],[980,460],[1034,472],[1090,453],
    [1148,465],[1200,448],[244,490],[400,482],[556,494],[712,488],
    [868,496],[1024,480],[1180,492],[330,478],[496,502],[660,474],
    [824,484],[992,498],[1156,476],
  ];

  // Colored crowd dots (jerseys/phones)
  const CROWD_DOTS: [number, number, string][] = [
    [180,453,"#c03838"],[310,465,"#3878c0"],[440,451,"#e8b820"],[570,462,"#38a038"],
    [700,448,"#c038a0"],[830,459,"#c03838"],[960,452,"#3878c0"],[1090,463,"#e8b820"],
    [245,483,"#38a038"],[415,476,"#c038a0"],[585,489,"#c03838"],[755,479,"#3878c0"],
    [925,487,"#e8b820"],[1095,473,"#38a038"],[1200,481,"#c038a0"],
  ];

  const NETS = [208, 348, 488, 648, 718, 878, 1038, 1158];

  const BIRDS: number[][] = [
    [192,70],[388,105],[148,136],[858,58],[988,88],[1148,78],[320,92],[1050,112],
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes floatBall {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-16px); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 0.9; }
        }
        @keyframes sp1 { 0%,100%{opacity:0.18} 50%{opacity:0.72} }
        @keyframes sp2 { 0%,100%{opacity:0.22} 50%{opacity:0.65} }
        @keyframes sp3 { 0%,100%{opacity:0.15} 50%{opacity:0.60} }
        @keyframes sp4 { 0%,100%{opacity:0.20} 50%{opacity:0.68} }
        .ball-float {
          animation: floatBall 3.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .ball-glow {
          animation: glowPulse 3.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .sp1 { animation: sp1 2.1s ease-in-out infinite; }
        .sp2 { animation: sp2 2.9s ease-in-out infinite 0.5s; }
        .sp3 { animation: sp3 3.3s ease-in-out infinite 1.1s; }
        .sp4 { animation: sp4 1.9s ease-in-out infinite 1.7s; }
      `}</style>

      <svg
        viewBox="0 0 1366 768"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          {/* Rich purple-to-gold sunset sky */}
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0c0520" />
            <stop offset="18%"  stopColor="#28103a" />
            <stop offset="38%"  stopColor="#8c2a14" />
            <stop offset="58%"  stopColor="#d46020" />
            <stop offset="78%"  stopColor="#e8a428" />
            <stop offset="100%" stopColor="#f4cc58" />
          </linearGradient>

          {/* Sun radial */}
          <radialGradient id="pbSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fff8b0" />
            <stop offset="25%"  stopColor="#f8d040" stopOpacity="0.95" />
            <stop offset="55%"  stopColor="#e88018" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c05008" stopOpacity="0" />
          </radialGradient>

          {/* Ball glow */}
          <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff9030" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c05008" stopOpacity="0" />
          </radialGradient>

          {/* Court hardwood */}
          <linearGradient id="pbCourt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d08828" />
            <stop offset="50%"  stopColor="#c07020" />
            <stop offset="100%" stopColor="#8a4e10" />
          </linearGradient>

          {/* Crowd stands */}
          <linearGradient id="pbCrowd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c3c28" />
            <stop offset="60%"  stopColor="#0a1c10" />
            <stop offset="100%" stopColor="#040808" />
          </linearGradient>

          {/* Below court pit */}
          <linearGradient id="pbDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#080c06" />
            <stop offset="100%" stopColor="#020402" />
          </linearGradient>

          {/* Spotlight beam */}
          <linearGradient id="pbSpot" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="rgba(255,230,120,0.1)" />
            <stop offset="100%" stopColor="rgba(255,230,120,0)" />
          </linearGradient>
        </defs>

        {/* ── SKY ── */}
        <rect width="1366" height="435" fill="url(#pbSky)" />

        {/* Soft atmospheric haze bands at horizon */}
        <rect y="360" width="1366" height="20" fill="rgba(220,130,20,0.06)" />
        <rect y="380" width="1366" height="20" fill="rgba(235,160,30,0.07)" />
        <rect y="400" width="1366" height="20" fill="rgba(248,190,50,0.08)" />
        <rect y="420" width="1366" height="15" fill="rgba(255,215,80,0.07)" />

        {/* Large glowing sun */}
        <circle cx="683" cy="428" r="160" fill="url(#pbSun)" opacity="0.85" />
        <circle cx="683" cy="428" r="52"  fill="#fff8b0" opacity="0.9" />
        <circle cx="683" cy="428" r="34"  fill="white" />

        {/* Sun shimmer ring */}
        <circle cx="683" cy="428" r="68" fill="none"
          stroke="rgba(255,230,80,0.2)" strokeWidth="4" />

        {/* ── PIXEL CLOUDS ── */}
        {/* Cloud left */}
        {([[118,118,72,16],[106,110,94,14],[125,104,65,12],[100,118,10,10]] as number[][]).map(([x,y,w,h],i) => (
          <rect key={`cl${i}`} x={x} y={y} width={w} height={h} rx={5}
            fill="rgba(255,230,180,0.14)" />
        ))}
        {/* Cloud right */}
        {([[1098,88,76,15],[1086,80,98,14],[1105,74,66,13]] as number[][]).map(([x,y,w,h],i) => (
          <rect key={`cr${i}`} x={x} y={y} width={w} height={h} rx={5}
            fill="rgba(255,230,180,0.12)" />
        ))}
        {/* Dark cloud top-center */}
        {([[550,46,84,17],[538,38,106,15],[558,30,74,15]] as number[][]).map(([x,y,w,h],i) => (
          <rect key={`cc${i}`} x={x} y={y} width={w} height={h} rx={5}
            fill="rgba(70,20,70,0.28)" />
        ))}

        {/* ── BIRDS ── */}
        {BIRDS.map(([x, y], i) => (
          <g key={`b${i}`}>
            <path d={`M${x},${y} Q${x+6},${y-5} ${x+13},${y}`}
              stroke="rgba(60,10,10,0.55)" strokeWidth="1.5" fill="none" />
            <path d={`M${x+13},${y} Q${x+20},${y-5} ${x+26},${y}`}
              stroke="rgba(60,10,10,0.55)" strokeWidth="1.5" fill="none" />
          </g>
        ))}

        {/* ── FAR BUILDINGS ── */}
        {FAR.map(([x, topY, w, h], i) => (
          <rect key={`f${i}`} x={x} y={topY} width={w} height={h} fill="#04060e" />
        ))}

        {/* Antenna spikes */}
        {ANTENNAS.map(([cx, tipY], i) => (
          <rect key={`ant${i}`} x={cx - 1} y={tipY - 24} width={2} height={24}
            fill="#020408" />
        ))}

        {/* Slight building edge highlight (rim lighting from sunset) */}
        {FAR.filter((_,i) => i % 3 === 0).map(([x, topY, w], i) => (
          <rect key={`fr${i}`} x={x + w - 1} y={topY} width={1} height={30}
            fill="rgba(220,120,20,0.2)" />
        ))}

        {/* ── MID BUILDINGS ── */}
        {MID.map(([x, topY, w, h], i) => (
          <rect key={`m${i}`} x={x} y={topY} width={w} height={h} fill="#080a0e" />
        ))}

        {/* Lit windows */}
        {WINDOWS.map(([wx, wy], i) => (
          <rect key={`w${i}`} x={wx} y={wy} width={4} height={6}
            fill="#f0c840" opacity={0.5} />
        ))}

        {/* ── FLOATING BASKETBALL ── */}
        {/* Glow behind ball */}
        <circle className="ball-glow" cx="556" cy="282" r="68" fill="url(#ballGlow)" />

        {/* Ball group – floats */}
        <g className="ball-float">
          <circle cx="556" cy="282" r="37" fill="#d46018" />
          {/* Seams */}
          <ellipse cx="556" cy="282" rx="33" ry="11"
            stroke="#8a2808" strokeWidth="1.6" fill="none" />
          <line x1="556" y1="245" x2="556" y2="319"
            stroke="#8a2808" strokeWidth="1.6" />
          <path d="M534,262 Q519,282 534,302"
            stroke="#8a2808" strokeWidth="1.6" fill="none" />
          <path d="M578,262 Q593,282 578,302"
            stroke="#8a2808" strokeWidth="1.6" fill="none" />
          {/* Shine */}
          <ellipse cx="543" cy="269" rx="9" ry="6"
            fill="rgba(255,200,120,0.32)" />
        </g>

        {/* Pixel player (below ball) */}
        <rect x="550" y="321" width="12" height="13" fill="#f0c888" />
        <rect x="547" y="334" width="18" height="18" fill="#2a3a7a" />
        <rect x="541" y="336" width="6" height="13" fill="#2a3a7a" />
        <rect x="565" y="336" width="6" height="13" fill="#2a3a7a" />
        <rect x="547" y="352" width="7" height="15" fill="#1a2458" />
        <rect x="558" y="352" width="7" height="15" fill="#1a2458" />
        <rect x="546" y="367" width="9" height="4"  fill="#f0e0a0" />
        <rect x="557" y="367" width="9" height="4"  fill="#f0e0a0" />

        {/* ── CROWD / STANDS ── */}
        <rect y="420" width="1366" height="140" fill="url(#pbCrowd)" />

        {/* Organic crowd top – ellipses for natural head shape */}
        {Array.from({ length: 54 }, (_, i) => {
          const x  = i * 25 + 2;
          const ry = 9 + Math.round(Math.sin(i * 1.3) * 3.5 + Math.sin(i * 0.6) * 2.5);
          return (
            <ellipse key={`cb${i}`} cx={x + 10} cy={420} rx={9} ry={Math.max(5, ry)}
              fill="#1c3c28" />
          );
        })}

        {/* Spotlight beams from above */}
        <polygon points="260,420 330,420 295,570 225,570" fill="url(#pbSpot)" />
        <polygon points="640,420 710,420 695,580 625,580" fill="url(#pbSpot)" />
        <polygon points="1030,420 1100,420 1125,570 1055,570" fill="url(#pbSpot)" />

        {/* Animated sparkle dots */}
        {SPARKLES.map(([x, y], i) => {
          const cls = ["sp1","sp2","sp3","sp4"][i % 4];
          return (
            <rect key={`sp${i}`} className={cls} x={x} y={y}
              width={i%3===0?3:2} height={i%3===0?3:2}
              fill="rgba(255,245,180,1)" />
          );
        })}

        {/* Colored crowd dots – jerseys */}
        {CROWD_DOTS.map(([x, y, c], i) => (
          <rect key={`cd${i}`} x={x} y={y} width={4} height={4}
            fill={c} opacity={0.45} />
        ))}

        {/* ── COURT SURFACE ── */}
        <rect y="555" width="1366" height="105" fill="url(#pbCourt)" />

        {/* Hardwood grain */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`g${i}`} x1="0" y1={562 + i * 8} x2="1366" y2={562 + i * 8}
            stroke="#9a5a14" strokeWidth="1" opacity="0.22" />
        ))}

        {/* Court border line */}
        <rect y="555" width="1366" height="2" fill="rgba(255,230,120,0.28)" />

        {/* Court markings */}
        {/* Center jump circle */}
        <circle cx="683" cy="610" r="42"
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        {/* Center line */}
        <line x1="683" y1="556" x2="683" y2="660"
          stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

        {/* Left key / paint */}
        <rect x="88" y="556" width="145" height="88"
          fill="rgba(130,60,8,0.45)"
          stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        {/* Left free-throw circle */}
        <circle cx="162" cy="596" r="30"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        {/* Left 3pt arc (simplified path) */}
        <path d="M 88,556 Q 320,484 88,660"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

        {/* Right key */}
        <rect x="1133" y="556" width="145" height="88"
          fill="rgba(130,60,8,0.45)"
          stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        {/* Right free-throw circle */}
        <circle cx="1204" cy="596" r="30"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        {/* Right 3pt arc */}
        <path d="M 1278,556 Q 1046,484 1278,660"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

        {/* ── BELOW COURT / PIT ── */}
        <rect y="655" width="1366" height="113" fill="url(#pbDeep)" />

        {/* Net strands */}
        {NETS.map((x, i) => (
          <g key={`n${i}`}>
            <line x1={x-5}  y1="655" x2={x-11} y2="722"
              stroke="#183020" strokeWidth="2.5" opacity="0.65" />
            <line x1={x+8}  y1="655" x2={x+14} y2="720"
              stroke="#183020" strokeWidth="2.5" opacity="0.65" />
            <line x1={x+2}  y1="655" x2={x}    y2="738"
              stroke="#183020" strokeWidth="3"   opacity="0.55" />
            <line x1={x-2}  y1="682" x2={x+11} y2="720"
              stroke="#183020" strokeWidth="1"   opacity="0.3" />
          </g>
        ))}

        {/* Stray balls in pit */}
        <circle cx="420" cy="696" r="10" fill="#6a2808" opacity="0.35" />
        <ellipse cx="420" cy="696" rx="8" ry="3"
          stroke="#4a1808" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="968" cy="712" r="8"  fill="#6a2808" opacity="0.28" />

        {/* ── LEFT BLEACHER WALL ── */}
        <polygon
          points="0,0 85,0 85,108 72,108 72,198 85,198 85,272 68,272 68,342 85,342 85,430 72,430 72,560 85,560 85,768 0,768"
          fill="#080608"
        />
        {/* Bleacher seat rows */}
        {[438,458,478,498,518,538].map((y, i) => (
          <rect key={`bl${i}`} x={8} y={y} width={62} height={3}
            fill="rgba(255,255,255,0.028)" />
        ))}
        {/* Rim light on left wall */}
        <rect x="85" y="430" width="1" height="140" fill="rgba(200,120,20,0.18)" />

        {/* ── RIGHT SCOREBOARD TOWER ── */}
        <polygon
          points="1281,0 1366,0 1366,768 1281,768 1281,558 1298,558 1298,488 1281,488 1281,374 1298,374 1298,293 1281,293 1281,178 1302,178 1302,104 1281,104"
          fill="#080608"
        />
        {[438,458,478,498,518,538].map((y, i) => (
          <rect key={`br${i}`} x={1296} y={y} width={62} height={3}
            fill="rgba(255,255,255,0.028)" />
        ))}
        {/* Rim light on right wall */}
        <rect x="1281" y="430" width="1" height="140" fill="rgba(200,120,20,0.18)" />

        {/* Scoreboard screen */}
        <rect x="1300" y="476" width="66" height="54" fill="#f0c820" opacity="0.9" />
        <rect x="1304" y="480" width="58" height="46" fill="#060606" />
        <rect x="1308" y="484" width="24" height="9"  fill="#f0c820" opacity="0.9" />
        <rect x="1338" y="484" width="24" height="9"  fill="#f0c820" opacity="0.9" />
        <rect x="1308" y="499" width="54" height="2"  fill="#f0c820" opacity="0.3" />
        <rect x="1308" y="506" width="30" height="7"  fill="#e04020" opacity="0.75" />
        <rect x="1344" y="506" width="18" height="7"  fill="#20b040" opacity="0.75" />

        {/* Shot clock arm */}
        <rect x="1317" y="374" width="6"  height="102" fill="#101008" />
        <rect x="1307" y="372" width="26" height="10"  fill="#f0c820" opacity="0.75" />

        {/* Stadium lights on tower */}
        <rect x="1298" y="288" width="30" height="8" fill="#ffe8a0" opacity="0.6" />
        <rect x="1298" y="170" width="30" height="8" fill="#ffe8a0" opacity="0.5" />
      </svg>
    </div>
  );
}
