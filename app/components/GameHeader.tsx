"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-white/8 px-4 py-0 flex items-center justify-between sticky top-0 z-40 overflow-hidden" style={{ minHeight: 52 }}>
      {/* Speed-line accent behind header */}
      <div className="absolute inset-0 pointer-events-none scan-lines opacity-50" />
      {/* Left magenta slash accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(to bottom, #ff0062, #ff006260)" }} />

      <a
        href="/home"
        className="group flex items-center gap-2.5 hover:opacity-80 transition-all duration-150 relative z-10 py-3"
      >
        <span className="text-white/60 group-hover:text-teal-400 transition-colors text-sm font-bold leading-none">←</span>
        <img src="/logo.svg" alt="Courtside Central" className="h-8 w-auto" />
        <span className="font-bebas text-white text-lg tracking-[0.08em] hidden sm:block" style={{ lineHeight: 1 }}>
          Courtside Central
        </span>
      </a>

      <div className="flex items-center gap-2 relative z-10 py-3">
        {era === "current" && (
          <span className="text-[10px] font-bold bg-sky-500/15 text-sky-300 px-2.5 py-1 uppercase tracking-widest border border-sky-400/25"
            style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)" }}>
            ⚡ Current
          </span>
        )}
        {era === "alltime" && (
          <span className="text-[10px] font-bold bg-teal-500/15 text-teal-300 px-2.5 py-1 uppercase tracking-widest border border-teal-400/25"
            style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)" }}>
            🏆 All-Time
          </span>
        )}
        <span className="font-bebas text-white/90 text-xl tracking-[0.08em]">{title}</span>
      </div>
    </header>
  );
}
