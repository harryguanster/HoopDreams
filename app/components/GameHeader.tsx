export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header className="bg-black px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <a href="/home" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
        <img src="/logo.png" alt="Courtside Central" className="h-10 w-auto" />
        <span className="font-bold text-white text-sm tracking-tight">Courtside Central</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current" && (
          <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full uppercase tracking-wide border border-sky-500/30">
            Current
          </span>
        )}
        {era === "alltime" && (
          <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full uppercase tracking-wide border border-teal-500/30">
            All-Time
          </span>
        )}
        <span className="text-xs text-zinc-400 font-medium">{title}</span>
      </div>
    </header>
  );
}
