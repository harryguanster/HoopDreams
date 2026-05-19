"use client";
import { motion } from "framer-motion";

interface Props {
  size?: number;
  glow?: boolean;
  idle?: boolean;
  flying?: boolean;
  className?: string;
}

export default function BballMascot({ size = 120, glow = false, idle = true, flying = false, className = "" }: Props) {
  return (
    <motion.div
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.3 }}
      animate={idle ? { y: [0, -10, 0], rotate: flying ? [-4, 4, -4] : [-3, 3, -3] } : {}}
      transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" style={{
        filter: glow
          ? "drop-shadow(0 0 22px rgba(251,146,60,0.9)) drop-shadow(0 0 55px rgba(20,184,166,0.5)) drop-shadow(0 10px 28px rgba(0,0,0,0.7))"
          : "drop-shadow(0 10px 28px rgba(0,0,0,0.6)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
        overflow: "visible",
      }}>
        <defs>
          <radialGradient id="bm-body" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          <radialGradient id="bm-shoe" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>
          <linearGradient id="bm-cape" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="60%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
          <linearGradient id="bm-cape-inner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* ── Cape (drawn first so it's behind body) ── */}
        {flying && (
          <>
            {/* Cape outer — flows back and to the left when flying right-arm-up */}
            <motion.path
              d="M52 58 C44 70 20 85 8 110 C18 108 30 100 42 92 C36 105 32 118 38 130 C46 120 52 108 56 96 C60 108 60 122 62 132 C66 118 64 104 66 92 C70 100 74 110 80 116 C76 100 68 85 62 72 Z"
              fill="url(#bm-cape)"
              animate={idle ? { skewX: [-3, 3, -3], scaleY: [1, 1.04, 1] } : {}}
              transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
            />
            {/* Cape inner shadow */}
            <motion.path
              d="M54 62 C48 74 28 88 16 112 C24 108 34 102 44 94 C40 106 36 118 40 128 C48 118 52 108 56 98"
              fill="url(#bm-cape-inner)"
              opacity="0.55"
              animate={idle ? { skewX: [-3, 3, -3] } : {}}
              transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
            />
            {/* Cape highlight */}
            <motion.path
              d="M56 60 C52 68 46 80 50 92 C54 82 58 70 60 60"
              fill="rgba(255,255,255,0.18)"
              animate={idle ? { skewX: [-3, 3, -3] } : {}}
              transition={idle ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
            />
          </>
        )}

        {/* Drop shadow */}
        {!flying && <ellipse cx="60" cy="138" rx="20" ry="5" fill="rgba(0,0,0,0.25)" />}

        {/* Legs */}
        {flying ? (
          /* Flying: legs swept back */
          <>
            <rect x="38" y="96" width="15" height="22" rx="7.5" fill="#f97316" transform="rotate(20 45 107)" />
            <rect x="58" y="92" width="15" height="22" rx="7.5" fill="#f97316" transform="rotate(30 65 103)" />
          </>
        ) : (
          <>
            <rect x="39" y="90" width="17" height="24" rx="8.5" fill="#f97316" />
            <rect x="64" y="90" width="17" height="24" rx="8.5" fill="#f97316" />
          </>
        )}

        {/* Shoes */}
        {flying ? (
          <>
            <ellipse cx="46" cy="122" rx="14" ry="7" fill="url(#bm-shoe)" transform="rotate(20 46 122)" />
            <ellipse cx="68" cy="118" rx="14" ry="7" fill="url(#bm-shoe)" transform="rotate(30 68 118)" />
          </>
        ) : (
          <>
            <ellipse cx="47.5" cy="115" rx="15" ry="8" fill="url(#bm-shoe)" />
            <ellipse cx="72.5" cy="115" rx="15" ry="8" fill="url(#bm-shoe)" />
            <path d="M34 114 Q47.5 110 61 114" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M59 114 Q72.5 110 86 114" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Left arm — stays normal */}
        <ellipse cx="19" cy="66" rx="13" ry="8" fill="#f97316" transform="rotate(-28 19 66)" />
        <circle cx="14" cy="72" r="6" fill="#fb923c" />

        {/* Right arm — raised up when flying */}
        {flying ? (
          /* Arm shoots up toward top-right (Superman pose) */
          <>
            <ellipse cx="98" cy="36" rx="14" ry="8" fill="#f97316" transform="rotate(-55 98 36)" />
            <circle cx="104" cy="26" r="6" fill="#fb923c" />
          </>
        ) : (
          <>
            <ellipse cx="101" cy="66" rx="13" ry="8" fill="#f97316" transform="rotate(28 101 66)" />
            <circle cx="106" cy="72" r="6" fill="#fb923c" />
          </>
        )}

        {/* Body glow halo */}
        <circle cx="60" cy="57" r="42" fill="rgba(251,146,60,0.1)" />

        {/* Basketball body */}
        <circle cx="60" cy="57" r="37" fill="url(#bm-body)" />

        {/* 3-D depth shading */}
        {/* Specular highlight — upper-left gloss */}
        <ellipse cx="45" cy="37" rx="17" ry="10" fill="rgba(255,255,255,0.22)" transform="rotate(-22 45 37)" />
        {/* Micro glint */}
        <circle cx="40" cy="32" r="5" fill="rgba(255,255,255,0.42)" />
        {/* Ambient occlusion — lower-right shadow */}
        <ellipse cx="76" cy="73" rx="14" ry="9" fill="rgba(0,0,0,0.16)" transform="rotate(-15 76 73)" />
        {/* Top rim light */}
        <path d="M26 26 Q60 10 94 26" stroke="rgba(255,255,255,0.15)" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* Seam lines */}
        <path d="M23 57 Q60 37 97 57" stroke="#7c2d12" strokeWidth="2.5" fill="none" opacity="0.65" />
        <path d="M23 57 Q60 77 97 57" stroke="#7c2d12" strokeWidth="2.5" fill="none" opacity="0.65" />
        <line x1="60" y1="20" x2="60" y2="94" stroke="#7c2d12" strokeWidth="2.5" opacity="0.65" />

        {/* Teal headband */}
        <path d="M25 38 Q60 23 95 38" stroke="#14b8a6" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M25 38 Q60 23 95 38" stroke="#2dd4bf" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* Eyes white */}
        <circle cx="47" cy="51" r="10.5" fill="white" />
        <circle cx="73" cy="51" r="10.5" fill="white" />
        {/* Pupils */}
        <circle cx="49" cy="52" r="6" fill="#1e293b" />
        <circle cx="75" cy="52" r="6" fill="#1e293b" />
        {/* Eye shine */}
        <circle cx="51.5" cy="49" r="2.5" fill="white" />
        <circle cx="77.5" cy="49" r="2.5" fill="white" />
        <circle cx="47" cy="54.5" r="1.2" fill="rgba(255,255,255,0.5)" />
        <circle cx="73" cy="54.5" r="1.2" fill="rgba(255,255,255,0.5)" />

        {/* Rosy cheeks */}
        <circle cx="37" cy="62" r="7" fill="rgba(239,68,68,0.28)" />
        <circle cx="83" cy="62" r="7" fill="rgba(239,68,68,0.28)" />

        {/* Smile */}
        <path d="M47 70 Q60 81 73 70" stroke="#7c2d12" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
