export default function StartPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">

      {/* ── Grain texture ─────────────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="grain-splash">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#grain-splash)" opacity="0.09"/>
      </svg>

      {/* ── Radial atmosphere ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(20,184,166,0.10) 0%, transparent 70%)"
      }}/>

      {/* ── Subtle dot grid ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.14) 1px, transparent 1px)",
        backgroundSize: "48px 48px"
      }}/>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">

        {/* Logo */}
        <img src="/logo.png" alt="Courtside Central" className="w-56 mb-8"/>

        {/* Divider line */}
        <div className="flex items-center gap-4 mb-10 w-72">
          <div className="h-px flex-1 bg-teal-400/20"/>
          <span className="text-teal-400/50 text-[10px] uppercase tracking-[0.5em] font-semibold">
            Season 2025–26
          </span>
          <div className="h-px flex-1 bg-teal-400/20"/>
        </div>

        {/* Title */}
        <h1 className="text-white font-black uppercase leading-[0.88] mb-12 tracking-tight">
          <span className="block text-4xl sm:text-6xl">COURTSIDE</span>
          <span className="block text-4xl sm:text-6xl text-teal-400">CENTRAL</span>
        </h1>

        {/* CTA */}
        <a
          href="/home"
          className="px-16 py-5 bg-teal-400 text-black font-black text-sm uppercase tracking-[0.35em] hover:bg-white transition-all duration-200 active:scale-95 shadow-[0_0_40px_rgba(20,184,166,0.35)]"
        >
          ENTER
        </a>

        <p className="mt-8 text-zinc-700 text-[10px] uppercase tracking-[0.4em]">
          NBA Knowledge Games
        </p>
      </div>

    </div>
  );
}
