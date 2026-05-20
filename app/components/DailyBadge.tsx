"use client";

import { motion, AnimatePresence } from "framer-motion";

function LightningBolt({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 14 21" fill="none">
      <path
        d="M9.5 1L1 13h5.5L4.5 20l9.5-11.5H8.5L9.5 1Z"
        fill="white"
        fillOpacity={0.95}
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
              background: "rgba(139,92,246,0.35)",
              filter: "blur(8px)",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Badge body */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
              background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%)",
              border: "1px solid rgba(167,139,250,0.35)",
              height: 32,
              overflow: "hidden",
            }}
          >
            {/* Left accent strip with bolt */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                background: "rgba(0,0,0,0.22)",
                borderRight: "1px solid rgba(167,139,250,0.2)",
                flexShrink: 0,
              }}
            >
              <LightningBolt size={11} />
            </div>

            {/* Number */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px 0 7px",
                fontFamily: "var(--font-bebas)",
                fontSize: "1.3rem",
                letterSpacing: "0.04em",
                color: "white",
                lineHeight: 1,
              }}
            >
              {count}
            </div>

            {/* Label */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingRight: 12,
                gap: 1,
              }}
            >
              <span
                style={{
                  fontSize: "0.52rem",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(196,181,253,0.8)",
                  lineHeight: 1,
                }}
              >
                Day
              </span>
              <span
                style={{
                  fontSize: "0.52rem",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(196,181,253,0.8)",
                  lineHeight: 1,
                }}
              >
                Streak
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
