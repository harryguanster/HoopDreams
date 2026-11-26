"use client";

export default function PixelBackground() {
  // Brooklyn Bridge geometry
  const LT_X = 162;
  const RT_X = 1204;
  const TOWER_TOP = 298;
  const SAG = 82;

  const SUSPENDERS = Array.from({ length: 24 }, (_, i) => {
    const t = (i + 1) / 25;
    const x = Math.round(LT_X + t * (RT_X - LT_X));
    const yCable = Math.round(TOWER_TOP + SAG * 4 * t * (1 - t));
    return [x, yCable];
  });

  const WINDOWS: number[][] = [
    [433,230],[437,250],[441,275],[445,300],[449,320],[453,195],
    [655,310],[663,330],[671,350],[659,290],[667,370],
    [792,320],[800,340],[808,360],[796,300],
    [260,310],[268,330],[530,280],[538,300],[900,290],[908,310],
    [340,340],[348,360],[970,320],[978,340],[1050,300],[1058,320],
  ];

  const SPARKLES: number[][] = [
    [168,452],[210,460],[265,445],[320,468],[378,455],[430,472],
    [488,448],[542,463],[598,450],[654,470],[708,455],[762,468],
    [818,453],[872,465],[926,448],[980,460],[1034,472],[1090,453],
    [1148,465],[1200,448],[244,490],[400,482],[556,494],[712,488],
    [868,496],[1024,480],[1180,492],[330,478],[496,502],[660,474],
    [824,484],[992,498],[1156,476],
  ];

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
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0c0520" />
            <stop offset="20%"  stopColor="#2a0e38" />
            <stop offset="42%"  stopColor="#8c2a14" />
            <stop offset="62%"  stopColor="#d46020" />
            <stop offset="80%"  stopColor="#e8a428" />
            <stop offset="100%" stopColor="#f4cc58" />
          </linearGradient>
          <radialGradient id="pbSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fff8b0" />
            <stop offset="28%"  stopColor="#f8d040" stopOpacity="0.95" />
            <stop offset="58%"  stopColor="#e88018" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c05008" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff9030" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c05008" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pbCourt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d08828" />
            <stop offset="50%"  stopColor="#c07020" />
            <stop offset="100%" stopColor="#8a4e10" />
          </linearGradient>
          <linearGradient id="pbCrowd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c3c28" />
            <stop offset="60%"  stopColor="#0a1c10" />
            <stop offset="100%" stopColor="#040808" />
          </linearGradient>
          <linearGradient id="pbDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#080c06" />
            <stop offset="100%" stopColor="#020402" />
          </linearGradient>
          <linearGradient id="pbSpot" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="rgba(255,230,120,0.1)" />
            <stop offset="100%" stopColor="rgba(255,230,120,0)" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a3448" />
            <stop offset="100%" stopColor="#0a1820" />
          </linearGradient>
        </defs>

        {/* SKY */}
        <rect width="1366" height="435" fill="url(#pbSky)" />
        <rect y="360" width="1366" height="20" fill="rgba(220,130,20,0.06)" />
        <rect y="380" width="1366" height="20" fill="rgba(235,160,30,0.07)" />
        <rect y="400" width="1366" height="20" fill="rgba(248,190,50,0.08)" />
        <rect y="420" width="1366" height="15" fill="rgba(255,215,80,0.07)" />

        {/* Sun */}
        <circle cx="683" cy="430" r="170" fill="url(#pbSun)" opacity="0.85" />
        <circle cx="683" cy="430" r="55"  fill="#fff8b0" opacity="0.9" />
        <circle cx="683" cy="430" r="36"  fill="white" />

        {/* Birds */}
        {BIRDS.map(([x, y], i) => (
          <g key={`b${i}`}>
            <path d={`M${x},${y} Q${x+6},${y-5} ${x+13},${y}`} stroke="rgba(60,10,10,0.55)" strokeWidth="1.5" fill="none" />
            <path d={`M${x+13},${y} Q${x+20},${y-5} ${x+26},${y}`} stroke="rgba(60,10,10,0.55)" strokeWidth="1.5" fill="none" />
          </g>
        ))}

        {/* ── NYC SKYLINE ── */}

        {/* Lower Manhattan / Brooklyn fill (left) */}
        <rect x="80"  y="350" width="40" height="80" fill="#050810" />
        <rect x="124" y="340" width="36" height="90" fill="#050810" />
        <rect x="164" y="360" width="30" height="70" fill="#050810" />
        <rect x="198" y="330" width="46" height="100" fill="#050810" />
        <rect x="248" y="345" width="34" height="85" fill="#050810" />
        <rect x="286" y="355" width="28" height="75" fill="#050810" />
        <rect x="318" y="335" width="38" height="95" fill="#050810" />
        {/* Water towers */}
        <rect x="90"  y="336" width="20" height="14" fill="#040608" />
        <rect x="206" y="315" width="22" height="15" fill="#040608" />

        {/* ONE WORLD TRADE CENTER — tapered modern tower */}
        <rect x="416" y="390" width="68" height="40" fill="#060810" />
        <rect x="420" y="310" width="60" height="80" fill="#060810" />
        <rect x="426" y="235" width="48" height="75" fill="#060810" />
        <rect x="432" y="175" width="36" height="60" fill="#060810" />
        <rect x="439" y="130" width="22" height="45" fill="#060810" />
        <rect x="444" y="100" width="12" height="30" fill="#060810" />
        <rect x="449" y="52"  width="2"  height="48" fill="#030408" />
        <rect x="448" y="52"  width="4"  height="8"  fill="#040608" />

        {/* Midtown fill between OWT and ESB */}
        <rect x="500" y="360" width="36" height="70" fill="#070912" />
        <rect x="540" y="340" width="28" height="90" fill="#070912" />
        <rect x="576" y="350" width="32" height="80" fill="#070912" />

        {/* EMPIRE STATE BUILDING — classic stepped setbacks */}
        <rect x="612" y="390" width="142" height="40" fill="#060810" />
        <rect x="622" y="352" width="122" height="38" fill="#060810" />
        <rect x="634" y="316" width="98"  height="36" fill="#060810" />
        <rect x="646" y="282" width="74"  height="34" fill="#060810" />
        <rect x="656" y="254" width="54"  height="28" fill="#060810" />
        <rect x="665" y="234" width="36"  height="20" fill="#060810" />
        <rect x="672" y="218" width="22"  height="16" fill="#060810" />
        <rect x="678" y="204" width="10"  height="14" fill="#060810" />
        <rect x="680" y="192" width="6"   height="12" fill="#060810" />
        <rect x="682" y="112" width="2"   height="80" fill="#030408" />
        <rect x="681" y="108" width="4"   height="8"  fill="#040608" />

        {/* CHRYSLER BUILDING — distinctive stepped crown */}
        <rect x="772" y="390" width="96"  height="40" fill="#060810" />
        <rect x="780" y="354" width="80"  height="36" fill="#060810" />
        <rect x="788" y="320" width="64"  height="34" fill="#060810" />
        <rect x="796" y="291" width="48"  height="29" fill="#060810" />
        <rect x="803" y="268" width="34"  height="23" fill="#060810" />
        <rect x="808" y="250" width="24"  height="18" fill="#060810" />
        {/* Crown arcs */}
        <rect x="810" y="238" width="20" height="12" fill="#060810" />
        <rect x="813" y="226" width="14" height="12" fill="#060810" />
        <rect x="815" y="215" width="10" height="11" fill="#060810" />
        <rect x="817" y="207" width="6"  height="8"  fill="#060810" />
        <rect x="818" y="202" width="4"  height="5"  fill="#060810" />
        <rect x="819" y="155" width="2"  height="47" fill="#030408" />
        <rect x="818" y="152" width="4"  height="6"  fill="#040608" />

        {/* 30 ROCKEFELLER PLAZA — Art Deco stepped */}
        <rect x="884" y="390" width="72" height="40" fill="#060810" />
        <rect x="890" y="358" width="60" height="32" fill="#060810" />
        <rect x="896" y="330" width="48" height="28" fill="#060810" />
        <rect x="902" y="306" width="36" height="24" fill="#060810" />
        <rect x="907" y="287" width="26" height="19" fill="#060810" />
        <rect x="911" y="272" width="18" height="15" fill="#060810" />
        <rect x="919" y="240" width="2"  height="32" fill="#030408" />

        {/* Midtown East fill (right of Chrysler) */}
        <rect x="872"  y="345" width="10" height="85" fill="#070912" />
        <rect x="966"  y="340" width="42" height="90" fill="#070912" />
        <rect x="1012" y="360" width="36" height="70" fill="#070912" />
        <rect x="1052" y="348" width="30" height="82" fill="#070912" />
        <rect x="1086" y="355" width="28" height="75" fill="#070912" />
        <rect x="1118" y="338" width="44" height="92" fill="#070912" />
        <rect x="1166" y="350" width="36" height="80" fill="#070912" />
        <rect x="1206" y="360" width="30" height="70" fill="#070912" />

        {/* Lit windows */}
        {WINDOWS.map(([wx, wy], i) => (
          <rect key={`w${i}`} x={wx} y={wy} width={4} height={6} fill="#f0c840" opacity={0.5} />
        ))}

        {/* ── BROOKLYN BRIDGE ── */}

        {/* East River water strip */}
        <rect y="395" width="1366" height="30" fill="url(#waterGrad)" opacity="0.55" />
        {[80,240,400,560,720,880,1040,1200,160,320,480,640,800,960,1120].map((x,i)=>(
          <rect key={`ws${i}`} x={x} y={398+((i%3)*4)} width={40} height={2}
            fill="rgba(100,180,220,0.18)" />
        ))}

        {/* Left anchor cable */}
        <line x1="0" y1="430" x2={LT_X} y2={TOWER_TOP}
          stroke="rgba(190,165,110,0.65)" strokeWidth="2.5" />
        <line x1="0" y1="435" x2={LT_X} y2={TOWER_TOP+6}
          stroke="rgba(190,165,110,0.45)" strokeWidth="1.5" />

        {/* Main span cable */}
        <path
          d={`M ${LT_X},${TOWER_TOP} C ${LT_X+280},${TOWER_TOP+SAG+10} ${RT_X-280},${TOWER_TOP+SAG+10} ${RT_X},${TOWER_TOP}`}
          fill="none" stroke="rgba(190,165,110,0.65)" strokeWidth="2.5" />
        <path
          d={`M ${LT_X},${TOWER_TOP+6} C ${LT_X+280},${TOWER_TOP+SAG+18} ${RT_X-280},${TOWER_TOP+SAG+18} ${RT_X},${TOWER_TOP+6}`}
          fill="none" stroke="rgba(190,165,110,0.45)" strokeWidth="1.5" />

        {/* Right anchor cable */}
        <line x1={RT_X} y1={TOWER_TOP}   x2="1366" y2="430"
          stroke="rgba(190,165,110,0.65)" strokeWidth="2.5" />
        <line x1={RT_X} y1={TOWER_TOP+6} x2="1366" y2="435"
          stroke="rgba(190,165,110,0.45)" strokeWidth="1.5" />

        {/* Suspender cables */}
        {SUSPENDERS.map(([x, yCable], i) => (
          <line key={`sus${i}`} x1={x} y1={yCable} x2={x} y2={420}
            stroke="rgba(170,145,90,0.4)" strokeWidth="1" />
        ))}

        {/* Bridge deck */}
        <rect y="416" width="1366" height="8" fill="#1a1208" opacity="0.8" />
        <rect y="416" width="1366" height="2" fill="rgba(220,180,80,0.2)" />

        {/* LEFT BRIDGE TOWER — Gothic Revival */}
        <rect x="137" y={TOWER_TOP} width="50" height={430 - TOWER_TOP} fill="#16121e" />
        <polygon points={`137,${TOWER_TOP} 162,${TOWER_TOP-28} 187,${TOWER_TOP}`} fill="#1e1828" />
        <rect x="145" y={TOWER_TOP+16} width="10" height="20" fill="rgba(255,160,60,0.18)" />
        <rect x="161" y={TOWER_TOP+16} width="10" height="20" fill="rgba(255,160,60,0.18)" />
        <rect x="145" y={TOWER_TOP+52} width="10" height="18" fill="rgba(255,160,60,0.14)" />
        <rect x="161" y={TOWER_TOP+52} width="10" height="18" fill="rgba(255,160,60,0.14)" />
        <rect x="134" y={TOWER_TOP+12} width="56" height="2" fill="rgba(255,255,255,0.08)" />
        <rect x="134" y={TOWER_TOP+48} width="56" height="2" fill="rgba(255,255,255,0.06)" />

        {/* RIGHT BRIDGE TOWER */}
        <rect x="1179" y={TOWER_TOP} width="50" height={430 - TOWER_TOP} fill="#16121e" />
        <polygon points={`1179,${TOWER_TOP} 1204,${TOWER_TOP-28} 1229,${TOWER_TOP}`} fill="#1e1828" />
        <rect x="1187" y={TOWER_TOP+16} width="10" height="20" fill="rgba(255,160,60,0.18)" />
        <rect x="1203" y={TOWER_TOP+16} width="10" height="20" fill="rgba(255,160,60,0.18)" />
        <rect x="1187" y={TOWER_TOP+52} width="10" height="18" fill="rgba(255,160,60,0.14)" />
        <rect x="1203" y={TOWER_TOP+52} width="10" height="18" fill="rgba(255,160,60,0.14)" />
        <rect x="1176" y={TOWER_TOP+12} width="56" height="2" fill="rgba(255,255,255,0.08)" />
        <rect x="1176" y={TOWER_TOP+48} width="56" height="2" fill="rgba(255,255,255,0.06)" />

        {/* FLOATING BASKETBALL */}
        <circle className="ball-glow" cx="310" cy="260" r="62" fill="url(#ballGlow)" />
        <g className="ball-float">
          <circle cx="310" cy="260" r="36" fill="#d46018" />
          <ellipse cx="310" cy="260" rx="32" ry="11" stroke="#8a2808" strokeWidth="1.6" fill="none" />
          <line x1="310" y1="224" x2="310" y2="296" stroke="#8a2808" strokeWidth="1.6" />
          <path d="M288,240 Q273,260 288,280" stroke="#8a2808" strokeWidth="1.6" fill="none" />
          <path d="M332,240 Q347,260 332,280" stroke="#8a2808" strokeWidth="1.6" fill="none" />
          <ellipse cx="298" cy="248" rx="8" ry="5" fill="rgba(255,200,120,0.3)" />
        </g>

        {/* CROWD / STANDS */}
        <rect y="420" width="1366" height="140" fill="url(#pbCrowd)" />
        {Array.from({ length: 54 }, (_, i) => {
          const x  = i * 25 + 2;
          const ry = 9 + Math.round(Math.sin(i * 1.3) * 3.5 + Math.sin(i * 0.6) * 2.5);
          return (
            <ellipse key={`cb${i}`} cx={x + 10} cy={420} rx={9} ry={Math.max(5, ry)} fill="#1c3c28" />
          );
        })}
        <polygon points="260,420 330,420 295,570 225,570" fill="url(#pbSpot)" />
        <polygon points="640,420 710,420 695,580 625,580" fill="url(#pbSpot)" />
        <polygon points="1030,420 1100,420 1125,570 1055,570" fill="url(#pbSpot)" />
        {SPARKLES.map(([x, y], i) => {
          const cls = ["sp1","sp2","sp3","sp4"][i % 4];
          return (
            <rect key={`sp${i}`} className={cls} x={x} y={y}
              width={i%3===0?3:2} height={i%3===0?3:2} fill="rgba(255,245,180,1)" />
          );
        })}
        {CROWD_DOTS.map(([x, y, c], i) => (
          <rect key={`cd${i}`} x={x} y={y} width={4} height={4} fill={c} opacity={0.45} />
        ))}

        {/* COURT */}
        <rect y="555" width="1366" height="105" fill="url(#pbCourt)" />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`g${i}`} x1="0" y1={562 + i * 8} x2="1366" y2={562 + i * 8}
            stroke="#9a5a14" strokeWidth="1" opacity="0.22" />
        ))}
        <rect y="555" width="1366" height="2" fill="rgba(255,230,120,0.28)" />
        <circle cx="683" cy="610" r="42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <line x1="683" y1="556" x2="683" y2="660" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <rect x="88"   y="556" width="145" height="88" fill="rgba(130,60,8,0.45)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <circle cx="162" cy="596" r="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <path d="M 88,556 Q 320,484 88,660" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <rect x="1133" y="556" width="145" height="88" fill="rgba(130,60,8,0.45)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <circle cx="1204" cy="596" r="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <path d="M 1278,556 Q 1046,484 1278,660" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

        {/* PIT */}
        <rect y="655" width="1366" height="113" fill="url(#pbDeep)" />
        {NETS.map((x, i) => (
          <g key={`n${i}`}>
            <line x1={x-5}  y1="655" x2={x-11} y2="722" stroke="#183020" strokeWidth="2.5" opacity="0.65" />
            <line x1={x+8}  y1="655" x2={x+14} y2="720" stroke="#183020" strokeWidth="2.5" opacity="0.65" />
            <line x1={x+2}  y1="655" x2={x}    y2="738" stroke="#183020" strokeWidth="3"   opacity="0.55" />
          </g>
        ))}
        <circle cx="420" cy="696" r="10" fill="#6a2808" opacity="0.35" />
        <circle cx="968" cy="712" r="8"  fill="#6a2808" opacity="0.28" />

        {/* LEFT WALL */}
        <polygon
          points="0,0 85,0 85,108 72,108 72,198 85,198 85,272 68,272 68,342 85,342 85,430 72,430 72,560 85,560 85,768 0,768"
          fill="#080608"
        />
        <rect x="85" y="430" width="1" height="140" fill="rgba(200,120,20,0.18)" />

        {/* RIGHT SCOREBOARD TOWER */}
        <polygon
          points="1281,0 1366,0 1366,768 1281,768 1281,558 1298,558 1298,488 1281,488 1281,374 1298,374 1298,293 1281,293 1281,178 1302,178 1302,104 1281,104"
          fill="#080608"
        />
        <rect x="1281" y="430" width="1" height="140" fill="rgba(200,120,20,0.18)" />
        <rect x="1300" y="476" width="66" height="54" fill="#f0c820" opacity="0.9" />
        <rect x="1304" y="480" width="58" height="46" fill="#060606" />
        <rect x="1308" y="484" width="24" height="9"  fill="#f0c820" opacity="0.9" />
        <rect x="1338" y="484" width="24" height="9"  fill="#f0c820" opacity="0.9" />
        <rect x="1308" y="499" width="54" height="2"  fill="#f0c820" opacity="0.3" />
        <rect x="1308" y="506" width="30" height="7"  fill="#e04020" opacity="0.75" />
        <rect x="1344" y="506" width="18" height="7"  fill="#20b040" opacity="0.75" />
        <rect x="1317" y="374" width="6"  height="102" fill="#101008" />
        <rect x="1307" y="372" width="26" height="10"  fill="#f0c820" opacity="0.75" />
        <rect x="1298" y="288" width="30" height="8"   fill="#ffe8a0" opacity="0.5" />
      </svg>
    </div>
  );
}
