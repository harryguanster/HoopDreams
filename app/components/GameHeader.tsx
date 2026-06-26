"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header
      className="px-6 flex items-center justify-between sticky top-0 z-40"
      style={{
        minHeight: 56,
        background: "#f4f0e6",
        borderBottom: "2px solid #111827",
      }}
    >
      <a
        href="/home"
        className="group flex items-center gap-3 hover:opacity-70 transition-opacity duration-150"
      >
        <span className="text-[#9ca3af] group-hover:text-[#84cc16] transition-colors font-bold text-sm">←</span>
        <img src="/logo.svg" alt="Courtside Central" className="h-7 w-auto" />
        <span
          className="font-playfair font-black text-[#111827] hidden sm:block"
          style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
        >
          Courtside Central
        </span>
      </a>

      <div className="flex items-center gap-3">
        {era === "current" && (
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#0369a1] text-[#0369a1]"
            style={{ background: "rgba(14,165,233,0.08)" }}
          >
            Current
          </span>
        )}
        {era === "alltime" && (
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#84cc16] text-[#65a30d]"
            style={{ background: "rgba(132,204,22,0.08)" }}
          >
            All-Time
          </span>
        )}
        <span
          className="font-playfair font-black text-[#111827]"
          style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
