"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStreak, getTodayStr, type StreakData } from "@/lib/dailyUtils";

export default function DailyBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  function refresh() {
    const s = loadStreak();
    setStreak(s.count > 0 && s.lastDate === getTodayStr() ? s : null);
  }

  useEffect(() => {
    refresh();
    window.addEventListener("daily-update", refresh);
    return () => window.removeEventListener("daily-update", refresh);
  }, []);

  return (
    <AnimatePresence>
      {streak && (
        <motion.div
          key="daily-badge"
          initial={{ opacity: 0, scale: 0.5, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{ position: "fixed", top: 14, right: 72, zIndex: 70 }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #6d28d9, #7c3aed, #a855f7)",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
              boxShadow: "0 0 20px rgba(168,85,247,0.65), 0 2px 10px rgba(0,0,0,0.5)",
              padding: "5px 13px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13 }}>🔥</span>
            <span
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "1.1rem",
                letterSpacing: "0.08em",
                color: "white",
                lineHeight: 1,
              }}
            >
              {streak.count}
            </span>
            <span
              style={{
                fontSize: "0.58rem",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1,
              }}
            >
              Day Streak
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
