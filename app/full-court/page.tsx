"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Arena3D from "@/app/components/Arena3D";
import {
  FULL_COURT_QUESTIONS,
  getDailyQuestions,
  matchAnswer,
  calcScore,
  getZoneLabel,
  type FullCourtQuestion,
  type FullCourtAnswer,
} from "@/lib/fullCourtData";
import { getDailyIndex, getTodayStr } from "@/lib/dailyUtils";

const TOTAL_ROUNDS = 7;
const TIMER_SECONDS = 20;
const STORAGE_KEY = "courtside_fullcourt_v1";

type Phase = "intro" | "crowd" | "playing" | "revealing" | "complete";

type RoundResult = {
  question: FullCourtQuestion;
  answer: string;
  matched: FullCourtAnswer | null;
  score: number;
  crowdPct: number;
};

// ── Court SVG ─────────────────────────────────────────────────────────────────

// ── Score to ball progress (0=near end, 1=at rim) ─────────────────────────────
function scoreToBallProgress(score: number): number {
  return 0.04 + (score / 10000) * 0.9;
}

// ── Crowd bars ─────────────────────────────────────────────────────────────────
function CrowdBars({ question, visible }: { question: FullCourtQuestion; visible: boolean }) {
  const topAnswers = [...question.answers]
    .sort((a, b) => b.crowdPct - a.crowdPct)
    .slice(0, 5);
  const maxPct = topAnswers[0]?.crowdPct ?? 1;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/40 mb-3">
        The crowd will pick
      </p>
      {topAnswers.map((ans, i) => (
        <motion.div
          key={ans.name}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
        >
          <span className="text-white/70 font-mono text-xs w-36 truncate shrink-0">{ans.name}</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #84cc16, #65a30d)" }}
              initial={{ width: 0 }}
              animate={visible ? { width: `${(ans.crowdPct / maxPct) * 100}%` } : { width: 0 }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[#84cc16] font-mono text-xs w-10 text-right shrink-0">{ans.crowdPct}%</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Timer ring ─────────────────────────────────────────────────────────────────
function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = seconds <= 5 ? "#ef4444" : seconds <= 10 ? "#f97316" : "#84cc16";
  return (
    <svg width={60} height={60} viewBox="0 0 60 60">
      <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
      <circle
        cx={30} cy={30} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
      />
      <text x={30} y={35} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold" fontFamily="monospace">
        {seconds}
      </text>
    </svg>
  );
}

// ── Floating particles ─────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 5 + (i * 37) % 92,
    delay: (i * 0.7) % 8,
    duration: 8 + (i * 1.3) % 10,
    size: 1 + (i * 0.4) % 2.5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: "-4px",
            width: p.size,
            height: p.size,
            background: "rgba(255,220,100,0.6)",
          }}
          animate={{ y: [0, -600], opacity: [0, 0.7, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function FullCourtPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<FullCourtQuestion[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [ballProgress, setBallProgress] = useState(0.04);
  const [showCrowdBars, setShowCrowdBars] = useState(false);
  const [lastZone, setLastZone] = useState<{ label: string; sub: string } | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const dayIdx = getDailyIndex(FULL_COURT_QUESTIONS.length);
    const qs = getDailyQuestions(dayIdx);
    setQuestions(qs);

    // Check if already played today
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.date === getTodayStr()) {
          setResults(saved.results);
          setPhase("complete");
          setAlreadyPlayed(true);
          const totalScore = saved.results.reduce((s: number, r: RoundResult) => s + r.score, 0);
          setBallProgress(scoreToBallProgress(Math.min(totalScore / TOTAL_ROUNDS, 10000)));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const currentQ = questions[roundIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const submitAnswer = useCallback((rawInput: string) => {
    if (!currentQ || phase !== "playing") return;
    stopTimer();

    const matched = matchAnswer(rawInput, currentQ);
    const score = matched ? calcScore(matched.crowdPct) : 0;
    const crowdPct = matched?.crowdPct ?? 100;
    const zone = getZoneLabel(score);

    const result: RoundResult = {
      question: currentQ,
      answer: rawInput.trim() || "(no answer)",
      matched,
      score,
      crowdPct,
    };

    const newResults = [...results, result];
    setLastScore(score);
    setLastZone(zone);
    setBallProgress(scoreToBallProgress(score));
    setResults(newResults);
    setPhase("revealing");

    setTimeout(() => {
      if (roundIdx + 1 >= TOTAL_ROUNDS) {
        setPhase("complete");
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayStr(), results: newResults }));
        } catch { /* ignore */ }
      } else {
        setRoundIdx(prev => prev + 1);
        setInput("");
        setBallProgress(0.04);
        setShowCrowdBars(false);
        setPhase("crowd");
      }
    }, 2800);
  }, [currentQ, phase, stopTimer, results, roundIdx]);

  // Start timer when phase = "playing"
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          submitAnswer("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show crowd bars then transition to playing
  useEffect(() => {
    if (phase !== "crowd") return;
    setShowCrowdBars(true);
    const t = setTimeout(() => setPhase("playing"), 3000);
    return () => clearTimeout(t);
  }, [phase, roundIdx]);

  function startGame() {
    setPhase("crowd");
    setRoundIdx(0);
    setResults([]);
    setBallProgress(0.04);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) submitAnswer(input);
  }

  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const finalZone = getZoneLabel(Math.min(Math.round(totalScore / TOTAL_ROUNDS), 10000));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#030508",
        color: "white",
        fontFamily: "var(--font-geist-mono)",
      }}
    >
      {/* 3D arena background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Arena3D ballProgress={ballProgress} animateBall={phase === "revealing"} />
      </div>
      <Particles />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/games" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs">←</span>
          <img src="/logo-green.png" alt="" className="h-7 w-auto" />
        </a>
        {phase !== "intro" && phase !== "complete" && (
          <div className="flex items-center gap-5">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Round {roundIdx + 1} / {TOTAL_ROUNDS}
            </span>
            <span className="text-[#84cc16] font-bold text-sm tabular-nums">
              {totalScore.toLocaleString()} pts
            </span>
          </div>
        )}
        <div className="w-20" />
      </header>

      {/* ── INTRO ── */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.p
              className="text-[10px] uppercase tracking-[0.5em] text-[#84cc16] mb-6"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            >
              Daily · {getTodayStr()}
            </motion.p>
            <motion.h1
              className="font-playfair font-black italic mb-4"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 0.95, letterSpacing: "-0.03em", textShadow: "0 0 80px rgba(132,204,22,0.4)" }}
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            >
              Full Court
            </motion.h1>
            <motion.p
              className="text-white/50 text-sm max-w-sm mb-3 leading-relaxed"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
            >
              7 NBA prompts. 20 seconds each. The rarer your answer, the farther down the court you travel.
            </motion.p>
            <motion.p
              className="text-white/30 text-xs mb-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            >
              Beat the crowd — obvious answers barely move you.
            </motion.p>

            <motion.button
              onClick={startGame}
              className="px-14 py-4 font-mono font-bold uppercase tracking-[0.3em] text-sm"
              style={{ background: "#84cc16", color: "#030508" }}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(132,204,22,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              Inbound the Ball →
            </motion.button>
          </motion.div>
        )}

        {/* ── GAME (crowd + playing + revealing) ── */}
        {(phase === "crowd" || phase === "playing" || phase === "revealing") && currentQ && (
          <motion.div
            key={`round-${roundIdx}`}
            className="relative z-10 flex flex-col flex-1 px-4 md:px-8 py-4 gap-4 max-w-3xl mx-auto w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Round dots */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === roundIdx ? 20 : 8,
                    height: 8,
                    background: i < roundIdx
                      ? "#84cc16"
                      : i === roundIdx
                      ? "#84cc16"
                      : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Crowd bars */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CrowdBars question={currentQ} visible={showCrowdBars} />
            </div>

            {/* Question + input */}
            <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-white font-bold text-base md:text-lg leading-snug flex-1 pr-4">
                  {currentQ.prompt}
                </p>
                {phase === "playing" && (
                  <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />
                )}
              </div>

              {phase !== "revealing" ? (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type your answer…"
                    disabled={phase === "crowd"}
                    className="flex-1 bg-transparent border-b-2 text-white placeholder-white/25 text-sm py-2 outline-none transition-colors"
                    style={{
                      borderColor: phase === "playing" ? "rgba(132,204,22,0.6)" : "rgba(255,255,255,0.15)",
                    }}
                  />
                  <button
                    onClick={() => input.trim() && submitAnswer(input)}
                    disabled={phase !== "playing" || !input.trim()}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30"
                    style={{ background: "#84cc16", color: "#030508" }}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                /* Reveal */
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your answer</p>
                        <p className="text-white font-bold">
                          {results[results.length - 1]?.answer || "(skipped)"}
                        </p>
                        {results[results.length - 1]?.matched ? (
                          <p className="text-[#84cc16] text-xs mt-1">
                            {results[results.length - 1].matched!.crowdPct}% of crowd picked this
                          </p>
                        ) : (
                          <p className="text-red-400 text-xs mt-1">Not a valid answer</p>
                        )}
                      </div>
                      <div className="text-right">
                        <motion.p
                          className="font-playfair font-black"
                          style={{ fontSize: "2rem", color: lastScore > 0 ? "#84cc16" : "rgba(255,255,255,0.3)" }}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          +{lastScore.toLocaleString()}
                        </motion.p>
                        {lastZone && (
                          <p className="text-white/50 text-xs mt-1">{lastZone.label}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {phase === "crowd" && (
              <p className="text-center text-white/30 text-xs animate-pulse">
                Study the crowd… answer in 3 seconds
              </p>
            )}
          </motion.div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-10 text-center max-w-2xl mx-auto w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#84cc16] mb-4">
              {alreadyPlayed ? "Today's Result" : "Game Over"}
            </p>
            <h2
              className="font-playfair font-black italic mb-2"
              style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 0.95, textShadow: "0 0 60px rgba(132,204,22,0.4)" }}
            >
              {finalZone.label}
            </h2>
            <p className="text-white/40 text-sm mb-8">{finalZone.sub}</p>

            {/* Total score */}
            <div className="mb-8 py-6 px-12 rounded-xl" style={{ background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.2)" }}>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Score</p>
              <p className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                {totalScore.toLocaleString()}
              </p>
              <p className="text-white/30 text-xs mt-1">avg {Math.round(totalScore / TOTAL_ROUNDS).toLocaleString()} / round</p>
            </div>

            {/* Result breakdown */}
            <div className="w-full space-y-2 mb-8">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest truncate">{r.question.prompt}</p>
                    <p className="text-white text-sm font-bold truncate">{r.answer}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-bold text-sm" style={{ color: r.score > 0 ? "#84cc16" : "rgba(255,255,255,0.3)" }}>
                      +{r.score.toLocaleString()}
                    </p>
                    {r.matched && (
                      <p className="text-white/30 text-[9px]">{r.crowdPct}% picked</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <a
              href="/games"
              className="px-10 py-3 text-xs font-bold uppercase tracking-[0.25em] border transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}
            >
              ← Back to Games
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
