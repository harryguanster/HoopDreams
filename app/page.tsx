export default function StartPage() {
  return (
    <div className="min-h-screen bg-[#fdf6ec] flex flex-col items-center justify-center px-6">

      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"/>

      <div className="flex flex-col items-center text-center max-w-sm w-full">

        <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-6 shadow-sm">
          <span className="text-3xl">🏀</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-1">
          Courtside Central
        </h1>
        <p className="text-stone-500 text-sm mb-10">
          NBA knowledge games, daily.
        </p>

        <div className="w-full h-px bg-amber-100 mb-10"/>

        <a
          href="/home"
          className="w-full py-4 bg-stone-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-stone-700 transition-colors active:scale-95"
        >
          Play →
        </a>

        <p className="mt-5 text-stone-400 text-xs">Season 2025–26</p>
      </div>
    </div>
  );
}
