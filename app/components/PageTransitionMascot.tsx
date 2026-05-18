"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BballMascot from "./BballMascot";
import { mascotStore } from "@/lib/mascotStore";

function randPos() {
  return {
    xVw: 5 + Math.random() * 78,
    yVh: 8 + Math.random() * 68,
    rotate: (Math.random() - 0.5) * 55,
  };
}

// Comet tail: slower blobs that "lag behind" the mascot as it zips to new positions
const TRAIL = [
  { mult: 1.55, opacity: 0.65, size: 44, color: "rgba(251,146,60,0.80)", blur: 10 },
  { mult: 2.1,  opacity: 0.38, size: 30, color: "rgba(20,184,166,0.65)",  blur: 13 },
  { mult: 2.9,  opacity: 0.20, size: 20, color: "rgba(251,146,60,0.55)",  blur: 16 },
];

export default function PageTransitionMascot() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState(randPos);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollModeRef = useRef(false);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }
  function clearFloat() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  // Page-transition trigger
  useEffect(() => {
    if (prevPath.current === null) { prevPath.current = pathname; return; }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    if (scrollModeRef.current) return; // scroll-float takes priority

    clearTimers();
    setPos(randPos());
    setActive(true);
    for (let i = 1; i <= 6; i++) {
      timersRef.current.push(setTimeout(() => setPos(randPos()), i * 900));
    }
    timersRef.current.push(setTimeout(() => setActive(false), 6500));
    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Scroll-float mode: hero mascot scrolled out of view → float continuously
  useEffect(() => {
    return mascotStore.subscribe((heroIsVisible) => {
      scrollModeRef.current = !heroIsVisible;
      if (!heroIsVisible) {
        clearTimers();
        clearFloat();
        setPos(randPos());
        setActive(true);
        intervalRef.current = setInterval(() => setPos(randPos()), 2400);
      } else {
        clearFloat();
        setActive(false);
      }
    });
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="mascot-root"
          className="fixed inset-0 z-[9997] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
        >
          {/* Comet tail blobs — each animates to same target but arrives later */}
          {TRAIL.map((t, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: t.size, height: t.size,
                background: t.color,
                filter: `blur(${t.blur}px)`,
                opacity: t.opacity,
                // Offset slightly so they fan out behind the mascot
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                // Trail center ≈ mascot center (mascot is ~80px wide, 104px tall)
                x: `calc(${pos.xVw}vw + 60px)`,
                y: `calc(${pos.yVh}vh + 72px)`,
              }}
              transition={{
                x: { duration: 0.85 * t.mult, ease },
                y: { duration: 0.85 * t.mult, ease },
              }}
            />
          ))}

          {/* Main mascot */}
          <motion.div
            className="absolute"
            style={{ left: 0, top: 0 }}
            initial={{ scale: 0.3 }}
            animate={{
              x: `${pos.xVw}vw`,
              y: `${pos.yVh}vh`,
              rotate: pos.rotate,
              scale: 1,
            }}
            transition={{
              x: { duration: 0.85, ease },
              y: { duration: 0.85, ease },
              rotate: { duration: 0.85, ease: "easeOut" },
              scale: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
            }}
          >
            {/* Shadow */}
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/20 rounded-full"
              style={{ width: 80, height: 16, filter: "blur(8px)" }}
            />
            <BballMascot size={160} idle glow />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
