export default function StartPage() {
  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center px-6">

      {/* Subtle top border accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400"/>

      <div className="flex flex-col items-center text-center max-w-sm w-full">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-6 shadow-sm">
          <span className="text-3xl">🏀</span>
        </div>

        {/* Brand */}
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-1">
          Courtside Central
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          NBA knowledge games, daily.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-200 mb-10"/>

        {/* CTA */}
        <a
          href="/home"
          className="w-full py-4 bg-zinc-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-zinc-700 transition-colors active:scale-95"
        >
          Play →
        </a>

        <p className="mt-5 text-zinc-400 text-xs">Season 2025–26</p>
      </div>
    </div>
  );
}
