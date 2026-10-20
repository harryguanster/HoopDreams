"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header
      className="px-6 flex items-center justify-between sticky top-0 z-40"
      style={{
        minHeight: 56,
        background: "rgba(3,5,8,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <a
        href="/games"
        className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-150"
      >
        <span className="text-white/40 group-hover:text-[#84cc16] transition-colors font-bold text-sm">←</span>
        <img src="/logo-green.png" alt="Courtside Central" className="h-8 w-auto" />
        <span
          className="font-playfair font-black text-white hidden sm:block"
          style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}
        >
          Courtside Central
        </span>
      </a>

      <div className="flex items-center gap-3">
        {era === "current" && (
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#38bdf8]/50 text-[#38bdf8]"
            style={{ background: "rgba(56,189,248,0.08)" }}
          >
            Current
          </span>
        )}
        {era === "alltime" && (
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#84cc16]/50 text-[#84cc16]"
            style={{ background: "rgba(132,204,22,0.08)" }}
          >
            All-Time
          </span>
        )}
        <span
          className="font-playfair font-black text-white"
          style={{ fontSize: "1.15rem", letterSpacing: "-0.01em" }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
