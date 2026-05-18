"use client";

export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <a
        href="/home"
        className="group flex items-center gap-2 hover:opacity-80 transition-all duration-150"
      >
        <span className="text-zinc-400 group-hover:text-teal-600 transition-colors text-sm font-bold leading-none">←</span>
        <img src="/logo.svg" alt="Courtside Central" className="h-9 w-auto" />
        <span className="font-bold text-zinc-900 text-sm tracking-tight hidden sm:block">Courtside Central</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current" && (
          <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-sky-200">
            ⚡ Current
          </span>
        )}
        {era === "alltime" && (
          <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-teal-200">
            🏆 All-Time
          </span>
        )}
        <span className="text-xs text-zinc-500 font-semibold">{title}</span>
      </div>
    </header>
  );
}
