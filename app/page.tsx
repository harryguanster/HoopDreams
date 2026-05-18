"use client";

import { motion } from "framer-motion";

export default function StartPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">

        <motion.img
          src="/logo.svg"
          alt="Courtside Central"
          className="w-32 h-32 mb-4"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />

        <motion.h1
          className="text-3xl font-bold text-zinc-900 tracking-tight mb-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
        >
          Courtside Central
        </motion.h1>

        <motion.p
          className="text-zinc-500 text-sm mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35, ease: "easeOut" }}
        >
          NBA knowledge games, daily.
        </motion.p>

        <motion.div
          className="w-full h-px bg-zinc-200 mb-10"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.4, ease: "easeOut" }}
          style={{ originX: 0 }}
        />

        <motion.a
          href="/home"
          className="w-full py-4 bg-teal-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg block text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.38, ease: "easeOut" }}
          whileHover={{ scale: 1.02, backgroundColor: "#0f766e" }}
          whileTap={{ scale: 0.97 }}
        >
          Play →
        </motion.a>

        <motion.p
          className="mt-5 text-zinc-400 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Season 2025–26
        </motion.p>
      </div>
    </div>
  );
}
