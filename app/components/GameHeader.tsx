"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-white/8 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
      <a
        href="/home"
        className="group flex items-center gap-2 hover:opacity-80 transition-all duration-150"
      >
        <span className="text-white/70 group-hover:text-teal-400 transition-colors text-sm font-bold leading-none">←</span>
        <img src="/logo.svg" alt="Courtside Central" className="h-9 w-auto" />
        <span className="font-bold text-white text-sm tracking-tight hidden sm:block">Courtside Central</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current" && (
          <span className="text-[10px] font-semibold bg-sky-500/15 text-sky-300 px-2.5 py-1 rounded-full uppercase tracking-wide border border-sky-400/25">
            ⚡ Current
          </span>
        )}
        {era === "alltime" && (
          <span className="text-[10px] font-semibold bg-teal-500/15 text-teal-300 px-2.5 py-1 rounded-full uppercase tracking-wide border border-teal-400/25">
            🏆 All-Time
          </span>
        )}
        <span className="text-xs text-white/80 font-semibold">{title}</span>
      </div>
    </header>
  );
}
