"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Ball = { id: number; x: number; y: number; dx: number; spin: number };

export default function BasketballCursor() {
  const [balls, setBalls] = useState<Ball[]>([]);

  const addBall = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // skip clicks inside inputs / textareas
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    const id = Date.now() + Math.random();
    const dx = (Math.random() - 0.5) * 90;
    const spin = (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200);
    setBalls((prev) => [...prev.slice(-8), { id, x: e.clientX, y: e.clientY, dx, spin }]);
  }, []);

  useEffect(() => {
    window.addEventListener("click", addBall);
    return () => window.removeEventListener("click", addBall);
  }, [addBall]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {balls.map((ball) => (
          <motion.div
            key={ball.id}
            className="absolute text-2xl select-none leading-none"
            style={{ left: ball.x - 12, top: ball.y - 12 }}
            initial={{ opacity: 0.9, scale: 0.6, y: 0, x: 0, rotate: 0 }}
            animate={{
              opacity: [0.9, 1, 0.8, 0],
              scale: [0.6, 1.3, 1.1, 0.7],
              y: [0, -55, -95, -140],
              x: [0, ball.dx * 0.4, ball.dx * 0.75, ball.dx],
              rotate: [0, ball.spin * 0.4, ball.spin * 0.75, ball.spin],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() =>
              setBalls((prev) => prev.filter((b) => b.id !== ball.id))
            }
          >
            🏀
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
