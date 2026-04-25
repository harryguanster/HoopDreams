export default function StartPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">

        <img src="/logo.svg" alt="Courtside Central" className="w-32 h-32 mb-4" />

        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-1">
          Courtside Central
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          NBA knowledge games, daily.
        </p>

        <div className="w-full h-px bg-zinc-200 mb-10"/>

        <a
          href="/home"
          className="w-full py-4 bg-teal-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-teal-700 transition-colors active:scale-95 shadow-lg"
        >
          Play →
        </a>

        <p className="mt-5 text-zinc-400 text-xs">Season 2025–26</p>
      </div>
    </div>
  );
}
