"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header
      className="px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40"
      style={{
        minHeight: 52,
        background: "rgba(5,10,25,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "2px solid #1a2a4a",
        boxShadow: "0 2px 0 #000",
      }}
    >
      <a
        href="/games"
        className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-150"
      >
        <span
          style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: "0.5rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          &lt; BACK
        </span>
        <img src="/logo-green.png" alt="Courtside Central" className="h-7 w-auto" style={{ imageRendering: "pixelated" }} />
        <span
          className="hidden sm:block text-white"
          style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.5rem", letterSpacing: "0.05em", lineHeight: 1.5 }}
        >
          COURTSIDE<br />CENTRAL
        </span>
      </a>

      <div className="flex items-center gap-3">
        {era === "current" && (
          <span
            style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.8rem",
              color: "#38bdf8",
              letterSpacing: "0.2em",
              border: "1px solid rgba(56,189,248,0.4)",
              padding: "2px 8px",
              background: "rgba(56,189,248,0.08)",
            }}
          >
            CURRENT
          </span>
        )}
        {era === "alltime" && (
          <span
            style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "0.8rem",
              color: "#84cc16",
              letterSpacing: "0.2em",
              border: "1px solid rgba(132,204,22,0.4)",
              padding: "2px 8px",
              background: "rgba(132,204,22,0.08)",
            }}
          >
            ALL-TIME
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: "0.55rem",
            color: "white",
            letterSpacing: "0.05em",
            textShadow: "2px 2px 0 #000",
          }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
