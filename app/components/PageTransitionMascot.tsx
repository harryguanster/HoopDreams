"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BballMascot from "./BballMascot";

export default function PageTransitionMascot() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [running, setRunning] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [legPhase, setLegPhase] = useState(false);

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      const newDir: 1 | -1 = dir === 1 ? -1 : 1;
      setDir(newDir);
      setRunning(true);
      const legTimer = setInterval(() => setLegPhase((p) => !p), 180);
      const doneTimer = setTimeout(() => {
        setRunning(false);
        clearInterval(legTimer);
      }, 1800);
      return () => {
        clearInterval(legTimer);
        clearTimeout(doneTimer);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          key={pathname}
          className="fixed z-[9998] pointer-events-none"
          style={{ bottom: 20, transformOrigin: "center" }}
          initial={{ x: dir === 1 ? -160 : "calc(100vw + 160px)", scaleX: dir === 1 ? 1 : -1 }}
          animate={{ x: dir === 1 ? "calc(100vw + 160px)" : -160 }}
          transition={{ duration: 1.8, ease: [0.4, 0, 0.6, 1] }}
        >
          {/* Waddling body rotation */}
          <motion.div
            animate={{ rotate: legPhase ? -8 : 8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <BballMascot size={96} idle={false} glow />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
