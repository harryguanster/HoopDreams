"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BballMascot from "./BballMascot";

function randPos() {
  return {
    xVw: 5 + Math.random() * 78,
    yVh: 8 + Math.random() * 68,
    rotate: (Math.random() - 0.5) * 55,
  };
}

export default function PageTransitionMascot() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState(randPos);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clear() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  useEffect(() => {
    if (prevPath.current === null) { prevPath.current = pathname; return; }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    clear();
    setPos(randPos());
    setActive(true);

    // Every ~900ms fly to a new random spot
    for (let i = 1; i <= 6; i++) {
      timersRef.current.push(setTimeout(() => setPos(randPos()), i * 900));
    }
    // Fade out after ~6.5s
    timersRef.current.push(setTimeout(() => setActive(false), 6500));

    return clear;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="flying-mascot"
          className="fixed z-[9998] pointer-events-none"
          style={{ left: 0, top: 0 }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            x: `${pos.xVw}vw`,
            y: `${pos.yVh}vh`,
            rotate: pos.rotate,
            opacity: 1,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.25, transition: { duration: 0.55 } }}
          transition={{
            x: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
            rotate: { duration: 0.85, ease: "easeOut" },
            opacity: { duration: 0.35 },
            scale: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
          }}
        >
          {/* Shadow under flying mascot */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/20 rounded-full"
            style={{ width: 80, height: 16, filter: "blur(8px)" }}
          />
          <BballMascot size={160} idle glow />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
