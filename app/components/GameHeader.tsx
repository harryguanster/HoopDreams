"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header
      className="px-4 py-0 flex items-center justify-between sticky top-0 z-40 overflow-hidden"
      style={{
        minHeight: 52,
        background: "rgba(244,240,230,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(0,0,0,0.09)",
      }}
    >
      {/* Lime green left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "linear-gradient(to bottom, #84cc16, #84cc1640)" }} />

      <a
        href="/home"
        className="group flex items-center gap-2.5 hover:opacity-80 transition-all duration-150 relative z-10 py-3"
      >
        <span className="text-[#9ca3af] group-hover:text-[#65a30d] transition-colors text-sm font-bold leading-none">←</span>
        <img src="/logo.svg" alt="Courtside Central" className="h-8 w-auto" />
        <span className="font-bebas text-[#111827] text-lg tracking-[0.08em] hidden sm:block" style={{ lineHeight: 1 }}>
          Courtside Central
        </span>
      </a>

      <div className="flex items-center gap-2 relative z-10 py-3">
        {era === "current" && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest"
            style={{
              background: "rgba(14,165,233,0.12)",
              color: "#0369a1",
              border: "1px solid rgba(14,165,233,0.3)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)",
            }}
          >
            ⚡ Current
          </span>
        )}
        {era === "alltime" && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest"
            style={{
              background: "rgba(20,184,166,0.1)",
              color: "#0f766e",
              border: "1px solid rgba(20,184,166,0.3)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)",
            }}
          >
            🏆 All-Time
          </span>
        )}
        <span className="font-bebas text-[#111827] text-xl tracking-[0.08em]">{title}</span>
      </div>
    </header>
  );
}
