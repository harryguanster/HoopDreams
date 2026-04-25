export default function StartPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        backgroundColor: "#0f766e",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
        backgroundSize: "16px 16px",
      }}
    >
      <div className="flex flex-col items-center text-center max-w-sm w-full">

        <img src="/logo.png" alt="Courtside Central" className="w-32 h-32 mb-4" />

        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
          Courtside Central
        </h1>
        <p className="text-teal-100 text-sm mb-10">
          NBA knowledge games, daily.
        </p>

        <div className="w-full h-px bg-white/20 mb-10"/>

        <a
          href="/home"
          className="w-full py-4 bg-white text-teal-800 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-teal-50 transition-colors active:scale-95 shadow-lg"
        >
          Play →
        </a>

        <p className="mt-5 text-teal-200/70 text-xs">Season 2025–26</p>
      </div>
    </div>
  );
}
