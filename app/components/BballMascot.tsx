"use client";
import { motion } from "framer-motion";

interface Props {
  size?: number;
  glow?: boolean;
  idle?: boolean;
  className?: string;
}

export default function BballMascot({ size = 120, glow = false, idle = true, className = "" }: Props) {
  return (
    <motion.div
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.3 }}
      animate={idle ? { y: [0, -10, 0], rotate: [-3, 3, -3] } : {}}
      transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style={{
        filter: glow
          ? "drop-shadow(0 0 16px rgba(251,146,60,0.7)) drop-shadow(0 0 40px rgba(20,184,166,0.35))"
          : "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
        overflow: "visible",
      }}>
        <defs>
          <radialGradient id="bbody" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          <radialGradient id="bshoe" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
        </defs>

        {/* Drop shadow */}
        <ellipse cx="50" cy="128" rx="20" ry="5" fill="rgba(0,0,0,0.25)" />

        {/* Legs */}
        <rect x="29" y="90" width="17" height="24" rx="8.5" fill="#f97316" />
        <rect x="54" y="90" width="17" height="24" rx="8.5" fill="#f97316" />

        {/* Shoes */}
        <ellipse cx="37.5" cy="115" rx="15" ry="8" fill="url(#bshoe)" />
        <ellipse cx="62.5" cy="115" rx="15" ry="8" fill="url(#bshoe)" />
        {/* Shoe stripe */}
        <path d="M24 114 Q37.5 110 51 114" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M49 114 Q62.5 110 76 114" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Left arm */}
        <ellipse cx="9" cy="62" rx="13" ry="8" fill="#f97316" transform="rotate(-28 9 62)" />
        <circle cx="4" cy="68" r="6" fill="#fb923c" />
        {/* Right arm */}
        <ellipse cx="91" cy="62" rx="13" ry="8" fill="#f97316" transform="rotate(28 91 62)" />
        <circle cx="96" cy="68" r="6" fill="#fb923c" />

        {/* Body glow halo */}
        <circle cx="50" cy="53" r="42" fill="rgba(251,146,60,0.1)" />

        {/* Basketball body */}
        <circle cx="50" cy="53" r="37" fill="url(#bbody)" />

        {/* Seam lines */}
        <path d="M13 53 Q50 33 87 53" stroke="#7c2d12" strokeWidth="2.5" fill="none" opacity="0.65" />
        <path d="M13 53 Q50 73 87 53" stroke="#7c2d12" strokeWidth="2.5" fill="none" opacity="0.65" />
        <line x1="50" y1="16" x2="50" y2="90" stroke="#7c2d12" strokeWidth="2.5" opacity="0.65" />

        {/* Teal headband */}
        <path d="M15 34 Q50 19 85 34" stroke="#14b8a6" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M15 34 Q50 19 85 34" stroke="#2dd4bf" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* Eyes white */}
        <circle cx="37" cy="47" r="10.5" fill="white" />
        <circle cx="63" cy="47" r="10.5" fill="white" />
        {/* Pupils */}
        <circle cx="39" cy="48" r="6" fill="#1e293b" />
        <circle cx="65" cy="48" r="6" fill="#1e293b" />
        {/* Eye shine */}
        <circle cx="41.5" cy="45" r="2.5" fill="white" />
        <circle cx="67.5" cy="45" r="2.5" fill="white" />
        <circle cx="37" cy="50.5" r="1.2" fill="rgba(255,255,255,0.5)" />
        <circle cx="63" cy="50.5" r="1.2" fill="rgba(255,255,255,0.5)" />

        {/* Rosy cheeks */}
        <circle cx="27" cy="58" r="7" fill="rgba(239,68,68,0.28)" />
        <circle cx="73" cy="58" r="7" fill="rgba(239,68,68,0.28)" />

        {/* Smile */}
        <path d="M37 66 Q50 77 63 66" stroke="#7c2d12" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
