export default function GameHeader({ title, era }: { title: string; era?: string }) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 z-50"/>
      <header className="bg-[#fffdf8] border-b border-amber-100 px-4 py-3.5 flex items-center justify-between sticky top-1 z-40">
        <a href="/home" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
            <span className="text-sm">🏀</span>
          </div>
          <span className="font-bold text-stone-900 text-sm tracking-tight">Courtside Central</span>
        </a>
        <div className="flex items-center gap-2">
          {era === "current" && (
            <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Current
            </span>
          )}
          {era === "alltime" && (
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              All-Time
            </span>
          )}
          <span className="text-xs text-stone-400 font-medium">{title}</span>
        </div>
      </header>
    </>
  );
}
