"use client";

export default function PixelBackground() {
  // Far background buildings [x, topY, width, height]
  const FAR: number[][] = [
    [92,322,36,108],[131,296,20,134],[154,312,46,118],[204,330,28,100],
    [244,284,32,146],[278,302,22,128],[303,290,58,140],[364,308,32,122],[399,295,16,135],
    [417,356,52,74],[472,338,38,92],[513,322,24,108],[540,348,32,82],
    [566,366,28,64],[596,372,22,58],[621,374,20,56],
    [742,374,20,56],[764,370,24,60],
    [790,344,32,86],[826,322,24,108],[853,338,38,92],[895,354,54,76],
    [952,290,56,140],[1011,306,32,124],[1046,282,24,148],[1073,298,60,132],
    [1136,322,28,108],[1167,290,46,140],[1216,308,22,122],[1241,328,36,102],
  ];

  const MID: number[][] = [
    [92,364,54,66],[150,350,46,80],[200,360,38,70],
    [242,352,58,78],[304,364,48,66],[356,354,62,76],
    [420,374,52,56],[476,364,48,66],[527,372,40,58],
    [568,386,30,44],[600,390,22,40],
    [766,390,22,40],[790,384,32,46],
    [826,362,42,68],[872,350,58,80],[934,364,46,66],
    [984,352,62,78],[1050,364,52,66],[1105,350,48,80],
    [1156,360,40,70],[1200,350,58,80],[1262,362,20,68],
  ];

  const WINDOWS: number[][] = [
    [140,312],[162,328],[308,296],[320,308],
    [910,296],[922,308],[1050,296],[1062,312],[1108,312],[1120,324],
  ];

  const BIRDS: number[][] = [[192,72],[388,106],[148,138],[858,60],[988,90],[1148,80]];

  const SPARKLES: number[][] = [
    [210,456],[358,440],[484,466],[628,448],[784,460],
    [928,443],[1058,456],[1188,450],[292,496],[658,486],
    [860,500],[1108,490],[410,516],[758,512],[512,473],
  ];

  const NETS = [218, 368, 518, 683, 848, 998, 1148];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "#c8a060" }}>
      <svg
        viewBox="0 0 1366 768"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8a060" />
            <stop offset="38%" stopColor="#d4b068" />
            <stop offset="68%" stopColor="#9ab878" />
            <stop offset="100%" stopColor="#6a9870" />
          </linearGradient>
          <linearGradient id="pbCrowd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c5a44" />
            <stop offset="100%" stopColor="#102018" />
          </linearGradient>
          <linearGradient id="pbCourt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ba7030" />
            <stop offset="100%" stopColor="#8a4e18" />
          </linearGradient>
          <linearGradient id="pbDeep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e1a0c" />
            <stop offset="100%" stopColor="#040804" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1366" height="430" fill="url(#pbSky)" />

        {/* Horizon haze */}
        <rect y="390" width="1366" height="50" fill="rgba(230,200,80,0.07)" />

        {/* Sun glow */}
        <circle cx="683" cy="400" r="90" fill="#f0cc3a" opacity="0.06" />
        <circle cx="683" cy="400" r="55" fill="#f0cc3a" opacity="0.1" />
        <circle cx="683" cy="400" r="36" fill="#f0cc3a" opacity="0.88" />

        {/* Far buildings */}
        {FAR.map(([x, topY, w, h], i) => (
          <rect key={`f${i}`} x={x} y={topY} width={w} height={h} fill="#806030" />
        ))}

        {/* Mid buildings */}
        {MID.map(([x, topY, w, h], i) => (
          <rect key={`m${i}`} x={x} y={topY} width={w} height={h} fill="#5a3e20" />
        ))}

        {/* Building windows */}
        {WINDOWS.map(([wx, wy], i) => (
          <rect key={`w${i}`} x={wx} y={wy} width={4} height={6} fill="#f0d060" opacity={0.6} />
        ))}

        {/* Birds */}
        {BIRDS.map(([x, y], i) => (
          <g key={`b${i}`}>
            <path d={`M${x},${y} Q${x + 6},${y - 5} ${x + 13},${y}`} stroke="#5a3818" strokeWidth="1.5" fill="none" />
            <path d={`M${x + 13},${y} Q${x + 20},${y - 5} ${x + 26},${y}`} stroke="#5a3818" strokeWidth="1.5" fill="none" />
          </g>
        ))}

        {/* Floating basketball */}
        <circle cx="556" cy="275" r="34" fill="#d46018" />
        <ellipse cx="556" cy="275" rx="30" ry="9" stroke="#8a2808" strokeWidth="1.5" fill="none" />
        <line x1="556" y1="241" x2="556" y2="309" stroke="#8a2808" strokeWidth="1.5" />
        <circle cx="543" cy="262" r="7" fill="#e88040" opacity="0.35" />

        {/* Pixel player below basketball */}
        <rect x="550" y="311" width="12" height="12" fill="#f0c888" />
        <rect x="548" y="323" width="16" height="18" fill="#2a3a7a" />
        <rect x="542" y="325" width="6" height="12" fill="#2a3a7a" />
        <rect x="564" y="325" width="6" height="12" fill="#2a3a7a" />
        <rect x="548" y="341" width="6" height="14" fill="#1a2458" />
        <rect x="558" y="341" width="6" height="14" fill="#1a2458" />
        <rect x="547" y="355" width="8" height="4" fill="#f0e0a0" />
        <rect x="557" y="355" width="8" height="4" fill="#f0e0a0" />

        {/* Crowd / stands */}
        <rect y="420" width="1366" height="140" fill="url(#pbCrowd)" />

        {/* Crowd top silhouette bumps */}
        {Array.from({ length: 54 }, (_, i) => {
          const x = i * 25 + 2;
          const h = 8 + (i * 3 + 1) % 9;
          return <rect key={`cb${i}`} x={x} y={420 - h} width={20} height={h + 2} fill="#2c5a44" />;
        })}

        {/* Spotlight beams through crowd */}
        <polygon points="378,420 418,420 398,560 358,560" fill="rgba(255,255,180,0.03)" />
        <polygon points="650,420 710,420 700,560 640,560" fill="rgba(255,255,180,0.045)" />
        <polygon points="942,420 982,420 1002,560 962,560" fill="rgba(255,255,180,0.03)" />

        {/* Crowd sparkle glints */}
        {SPARKLES.map(([x, y], i) => (
          <rect key={`sp${i}`} x={x} y={y} width={3} height={3} fill="rgba(255,255,180,0.28)" />
        ))}

        {/* Court surface */}
        <rect y="555" width="1366" height="100" fill="url(#pbCourt)" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`pk${i}`} x1="0" y1={562 + i * 9} x2="1366" y2={562 + i * 9} stroke="#9a5818" strokeWidth="1" opacity="0.3" />
        ))}
        <line x1="0" y1="558" x2="1366" y2="558" stroke="#e8d090" strokeWidth="2" opacity="0.22" />

        {/* Below court */}
        <rect y="650" width="1366" height="118" fill="url(#pbDeep)" />

        {/* Net strands (like seaweed) */}
        {NETS.map((x, i) => (
          <g key={`n${i}`}>
            <line x1={x - 4} y1="650" x2={x - 9} y2="718" stroke="#1a4028" strokeWidth="2" opacity="0.5" />
            <line x1={x + 8} y1="650" x2={x + 13} y2="715" stroke="#1a4028" strokeWidth="2" opacity="0.5" />
            <line x1={x + 2} y1="650" x2={x} y2="732" stroke="#1a4028" strokeWidth="3" opacity="0.4" />
            <line x1={x - 1} y1="678" x2={x + 11} y2="720" stroke="#1a4028" strokeWidth="1" opacity="0.28" />
          </g>
        ))}

        {/* Stray basketballs in below area */}
        <circle cx="420" cy="696" r="11" fill="#6a2808" opacity="0.32" />
        <ellipse cx="420" cy="696" rx="9" ry="3" stroke="#4a1808" strokeWidth="1" fill="none" opacity="0.28" />
        <circle cx="968" cy="712" r="9" fill="#6a2808" opacity="0.26" />

        {/* Left bleacher wall (cliff) */}
        <polygon
          points="0,0 85,0 85,108 72,108 72,198 85,198 85,272 68,272 68,342 85,342 85,430 72,430 72,560 85,560 85,768 0,768"
          fill="#141008"
        />
        {[435, 455, 475, 495, 515, 535].map((y, i) => (
          <rect key={`bl${i}`} x={8} y={y} width={62} height={3} fill="#1c1a10" />
        ))}
        <line x1="10" y1="150" x2="72" y2="150" stroke="#1e1808" strokeWidth="1" />
        <line x1="10" y1="308" x2="72" y2="308" stroke="#1e1808" strokeWidth="1" />

        {/* Right scoreboard tower (lighthouse) */}
        <polygon
          points="1281,0 1366,0 1366,768 1281,768 1281,558 1298,558 1298,488 1281,488 1281,374 1298,374 1298,293 1281,293 1281,178 1302,178 1302,104 1281,104"
          fill="#141008"
        />
        {[435, 455, 475, 495, 515, 535].map((y, i) => (
          <rect key={`br${i}`} x={1296} y={y} width={62} height={3} fill="#1c1a10" />
        ))}
        <line x1="1298" y1="150" x2="1358" y2="150" stroke="#1e1808" strokeWidth="1" />
        <line x1="1298" y1="308" x2="1358" y2="308" stroke="#1e1808" strokeWidth="1" />
        {/* Scoreboard screen */}
        <rect x="1300" y="476" width="66" height="54" fill="#f0c820" opacity="0.9" />
        <rect x="1304" y="480" width="58" height="46" fill="#080808" />
        <rect x="1308" y="484" width="24" height="9" fill="#f0c820" opacity="0.85" />
        <rect x="1338" y="484" width="24" height="9" fill="#f0c820" opacity="0.85" />
        <rect x="1308" y="499" width="54" height="2" fill="#f0c820" opacity="0.3" />
        <rect x="1308" y="506" width="30" height="7" fill="#e04020" opacity="0.65" />
        <rect x="1344" y="506" width="18" height="7" fill="#20b040" opacity="0.65" />
        {/* Shot clock pole */}
        <rect x="1317" y="374" width="6" height="102" fill="#1e1808" />
        <rect x="1307" y="372" width="26" height="10" fill="#f0c820" opacity="0.75" />
      </svg>
    </div>
  );
}
