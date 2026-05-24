"use client";

import { motion, AnimatePresence } from "framer-motion";

function FlameIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 13 16" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M6.5 1C6.5 1 9.5 4 9.5 7C9.5 7 8.5 6 7.5 6C7.5 6 10 8.5 8.5 11.5C9.5 10.5 11.5 9 11.5 6.5C11.5 6.5 13 8 13 10.5C13 13 10.5 15 6.5 15C2.5 15 0 13 0 10.5C0 8 2 6 2 6C2 8 3.5 9 3.5 9C2.5 7 4 4 6.5 1Z"
        fill="white"
        fillOpacity={0.92}
        stroke="none"
      />
    </svg>
  );
}

export default function DailyBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key={count}
          initial={{ opacity: 0, scale: 0.7, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 440, damping: 22 }}
          style={{ position: "relative", display: "inline-flex" }}
        >
          {/* Outer glow */}
          <div
            style={{
              position: "absolute",
              inset: -3,
              background: "rgba(132,204,22,0.30)",
              filter: "blur(8px)",
              borderRadius: 99,
              pointerEvents: "none",
            }}
          />

          {/* Badge body */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #65a30d 0%, #84cc16 60%, #a3e635 100%)",
              borderRadius: 99,
              border: "1px solid rgba(163,230,53,0.5)",
              height: 32,
              padding: "0 12px 0 10px",
            }}
          >
            <FlameIcon size={13} />
            <span
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "1.15rem",
                letterSpacing: "0.04em",
                color: "white",
                lineHeight: 1,
              }}
            >
              {count}
            </span>
            <span
              style={{
                fontSize: "0.52rem",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1,
              }}
            >
              streak
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
