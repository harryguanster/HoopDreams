export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <header className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <a href="/home" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
        <img src="/logo.svg" alt="Courtside Central" className="h-10 w-auto" />
        <span className="font-bold text-zinc-900 text-sm tracking-tight">Courtside Central</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current" && (
          <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Current
          </span>
        )}
        {era === "alltime" && (
          <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            All-Time
          </span>
        )}
        <span className="text-xs text-zinc-400 font-medium">{title}</span>
      </div>
    </header>
  );
}
