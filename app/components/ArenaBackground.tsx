"use client";

// Pixel-art arena background — layered night sky + crowd + court floor
export default function ArenaBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, imageRendering: "pixelated" }}>
      {/* ── Sky gradient ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, #050a1a 0%, #0a1530 35%, #111e40 60%, #0d1628 100%)",
      }} />

      {/* ── Pixel stars ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "55%" }}
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
      >
        {[
          [40,20],[120,8],[200,30],[310,12],[450,5],[600,18],[720,28],[760,8],
          [80,55],[170,40],[260,65],[380,35],[520,50],[650,42],[740,60],
          [30,90],[150,75],[280,100],[400,80],[530,95],[670,70],[790,88],
          [60,130],[200,115],[340,140],[480,120],[620,135],[750,118],
          [100,165],[240,152],[370,170],[510,155],[660,168],[780,150],
          [20,195],[180,180],[330,198],[470,185],[610,200],[740,182],
          [70,225],[210,212],[360,228],[490,215],[640,230],[770,218],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x} y={y}
            width={i % 5 === 0 ? 2 : 1}
            height={i % 5 === 0 ? 2 : 1}
            fill={i % 7 === 0 ? "#ffd780" : i % 3 === 0 ? "#c8d8ff" : "#ffffff"}
            opacity={0.4 + (i % 6) * 0.1}
          />
        ))}
      </svg>

      {/* ── Pixel crowd silhouettes (far back) ── */}
      <svg
        style={{ position: "absolute", bottom: "38%", left: 0, width: "100%", height: "22%" }}
        viewBox="0 0 400 80"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Far crowd row — tiny 2px heads */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = i * 5 + (i % 3);
          const y = 8 + (i % 4) * 3;
          const shade = i % 4 === 0 ? "#1a2a4a" : i % 4 === 1 ? "#162038" : i % 4 === 2 ? "#0e1828" : "#1e2e50";
          return (
            <g key={i}>
              <rect x={x} y={y} width={3} height={3} fill={shade} />
              <rect x={x} y={y + 3} width={3} height={5} fill={shade} opacity="0.8" />
            </g>
          );
        })}
        {/* Crowd glow tint */}
        <rect x="0" y="0" width="400" height="80" fill="url(#crowd-glow)" opacity="0.4" />
        <defs>
          <linearGradient id="crowd-glow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffd060" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Pixel crowd silhouettes (mid row) ── */}
      <svg
        style={{ position: "absolute", bottom: "30%", left: 0, width: "100%", height: "16%" }}
        viewBox="0 0 400 60"
        preserveAspectRatio="xMidYMax meet"
      >
        {Array.from({ length: 55 }).map((_, i) => {
          const x = i * 7 + (i % 2) * 2;
          const y = 5 + (i % 3) * 4;
          const col = i % 5 === 0 ? "#e84040" : i % 5 === 1 ? "#2060c0" : i % 5 === 2 ? "#203080" : i % 5 === 3 ? "#1a2850" : "#303060";
          return (
            <g key={i}>
              <rect x={x} y={y} width={4} height={4} fill={col} />
              <rect x={x} y={y + 4} width={4} height={7} fill={col} opacity="0.75" />
            </g>
          );
        })}
      </svg>

      {/* ── Arena jumbotron / scoreboard ── */}
      <div style={{
        position: "absolute",
        top: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "clamp(120px, 18vw, 220px)",
        background: "#080f20",
        border: "3px solid #1a2a4a",
        boxShadow: "0 0 0 1px #0a1428, inset 0 0 12px rgba(255,210,80,0.08)",
        imageRendering: "pixelated",
      }}>
        {/* Scoreboard top bar */}
        <div style={{ background: "#1a2a4a", padding: "3px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 6, height: 6, background: "#ff4040" }} />
          <div style={{ width: 6, height: 6, background: "#ffd060" }} />
          <div style={{ width: 6, height: 6, background: "#40cc20" }} />
        </div>
        <div style={{ padding: "4px 8px 6px", textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: "clamp(5px, 1vw, 8px)",
            color: "#ffd060",
            letterSpacing: "0.05em",
            lineHeight: 1.6,
          }}>
            COURTSIDE<br />CENTRAL
          </div>
        </div>
      </div>

      {/* ── Arena floor (pixel art court) ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "32%",
      }}>
        <svg
          style={{ width: "100%", height: "100%", display: "block" }}
          viewBox="0 0 800 200"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3010" />
              <stop offset="100%" stopColor="#3a1e08" />
            </linearGradient>
          </defs>
          {/* Floor base */}
          <rect x="0" y="0" width="800" height="200" fill="url(#floor-grad)" />
          {/* Pixel plank lines */}
          {[20, 36, 52, 68, 84, 100, 116, 132, 148, 164, 180].map((y, i) => (
            <rect key={i} x="0" y={y} width="800" height="2" fill="#3a1e08" opacity="0.5" />
          ))}
          {/* Center court circle */}
          <circle cx="400" cy="80" r="55" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="4 4" />
          {/* Half court line */}
          <rect x="0" y="78" width="800" height="2" fill="rgba(255,255,255,0.2)" />
          {/* Court boundary */}
          <rect x="20" y="4" width="760" height="192" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {/* Paint left */}
          <rect x="20" y="4" width="130" height="110" fill="rgba(20,50,120,0.25)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {/* Paint right */}
          <rect x="650" y="4" width="130" height="110" fill="rgba(20,50,120,0.25)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {/* Floor light bloom */}
          <ellipse cx="400" cy="40" rx="200" ry="60" fill="rgba(255,220,100,0.06)" />
        </svg>
      </div>

      {/* ── Pixel scanline overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none",
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 85% 90% at 50% 60%, transparent 30%, rgba(2,4,12,0.65) 100%)",
      }} />
    </div>
  );
}
