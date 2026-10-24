"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import {
  FULL_COURT_QUESTIONS,
  matchAnswer,
  getSuggestions,
  calcScore,
  normalizeAnswer,
  getZoneLabel,
  type FullCourtQuestion,
  type FullCourtAnswer,
} from "@/lib/fullCourtData";

// ── Helpers ───────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function ballFill(inf: number): string {
  // basketball orange → danger red
  const t = Math.min(1, inf * 1.4);
  return `rgb(${Math.round(lerp(228, 220, t))},${Math.round(lerp(98, 38, t))},${Math.round(lerp(9, 38, t))})`;
}

function pufferPoints(cx: number, cy: number, r: number, spikes: number, n = 16): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r + spikes;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function getRoundTime(round: number): number {
  return Math.max(8, 16 - Math.floor(round / 2));
}

function getDeflation(crowdPct: number): number {
  // Common answers barely deflate; rare answers deflate a lot
  return 0.10 + (1 - crowdPct / 100) * 0.28;
}

// ── Puffer basketball SVG ─────────────────────────────────────────────────────

function PufferBall({ inflation, popping }: { inflation: number; popping: boolean }) {
  const cx = 110, cy = 115;
  const r = 60 + inflation * 32;
  const spikeLen = Math.max(0, (inflation - 0.5) / 0.5) * 26;
  const color = ballFill(inflation);
  const stage = inflation < 0.35 ? 0 : inflation < 0.65 ? 1 : inflation < 0.85 ? 2 : 3;
  const glowBlur = stage >= 2 ? 6 + (inflation - 0.65) * 22 : 2;

  if (popping) {
    return (
      <div style={{ width: 220, height: 230, position: "relative" }}>
        {/* Burst lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: 110, top: 115,
                width: 3, height: 60,
                background: "#ef4444",
                transformOrigin: "0 0",
                transform: `rotate(${(a * 180) / Math.PI}deg)`,
                borderRadius: 2,
              }}
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          );
        })}
        {/* Fading ball */}
        <motion.svg
          width="220" height="230" viewBox="0 0 220 230"
          style={{ position: "absolute", inset: 0 }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <circle cx={cx} cy={cy} r={r} fill={color} />
        </motion.svg>
      </div>
    );
  }

  return (
    <motion.div
      animate={
        stage === 3
          ? { x: [-3, 3, -3, 3, -2, 2, 0], y: [-1, 1, -1, 1, 0] }
          : stage === 2
          ? { y: [-1.5, 1.5, -1.5] }
          : {}
      }
      transition={
        stage >= 2
          ? { repeat: Infinity, duration: stage === 3 ? 0.1 : 0.28 }
          : {}
      }
      style={{ display: "inline-block" }}
    >
      <svg width="220" height="230" viewBox="0 0 220 230">
        <defs>
          <radialGradient id="pbg" cx="38%" cy="33%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor={ballFill(Math.min(1, inflation + 0.25))} />
          </radialGradient>
          <filter id="pbf" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowBlur.toFixed(1)} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="pbc"><circle cx={cx} cy={cy} r={r} /></clipPath>
        </defs>

        {/* Outer glow ring */}
        {inflation > 0.4 && (
          <circle
            cx={cx} cy={cy} r={r + 10}
            fill="none" stroke={color}
            strokeWidth={2 + inflation * 5}
            opacity={0.08 + (inflation - 0.4) * 0.3}
          />
        )}

        {/* Spiky halo */}
        {spikeLen > 1 && (
          <polygon
            points={pufferPoints(cx, cy, r + 2, spikeLen)}
            fill={color} opacity={0.6}
          />
        )}

        {/* Main ball */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="url(#pbg)"
          filter={stage >= 2 ? "url(#pbf)" : undefined}
        />

        {/* Basketball seams (clipped) */}
        <g clipPath="url(#pbc)" fill="none"
          stroke="rgba(0,0,0,0.42)" strokeWidth={2 + inflation * 1.5}>
          <path d={`M${cx - r},${cy} Q${cx},${cy - r * 0.38} ${cx + r},${cy}`} />
          <path d={`M${cx},${cy - r} Q${cx + r * 0.38},${cy} ${cx},${cy + r}`} />
          <path d={`M${cx - r * 0.5},${cy - r * 0.87} Q${cx - r * 1.15},${cy} ${cx - r * 0.5},${cy + r * 0.87}`} />
          <path d={`M${cx + r * 0.5},${cy - r * 0.87} Q${cx + r * 1.15},${cy} ${cx + r * 0.5},${cy + r * 0.87}`} />
        </g>

        {/* Shine */}
        <ellipse
          cx={cx - r * 0.22} cy={cy - r * 0.28}
          rx={r * 0.22} ry={r * 0.15}
          fill="rgba(255,255,255,0.22)"
        />

        {/* Stage 3: worried eyes */}
        {stage >= 3 && (
          <g>
            <ellipse cx={cx - 18} cy={cy - 12} rx={7} ry={8} fill="white" />
            <ellipse cx={cx + 18} cy={cy - 12} rx={7} ry={8} fill="white" />
            <circle cx={cx - 17} cy={cy - 10} r={4} fill="#1a0000" />
            <circle cx={cx + 19} cy={cy - 10} r={4} fill="#1a0000" />
            <path d={`M${cx - 26},${cy - 24} L${cx - 13},${cy - 18}`}
              stroke="#1a0000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${cx + 26},${cy - 24} L${cx + 13},${cy - 18}`}
              stroke="#1a0000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

// ── Game page ─────────────────────────────────────────────────────────────────

type Phase = "intro" | "playing" | "exploded" | "complete";
const MAX_LIVES = 3;

export default function PufferPartyPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [lives, setLives] = useState(MAX_LIVES);
  const [round, setRound] = useState(0);
  const [inflation, setInflation] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<FullCourtAnswer[]>([]);
  const [sugIdx, setSugIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [questions, setQuestions] = useState<FullCourtQuestion[]>([]);
  const [popping, setPopping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef<Phase>("intro");
  phaseRef.current = phase;

  useEffect(() => {
    setMounted(true);
    setQuestions([...FULL_COURT_QUESTIONS].sort(() => Math.random() - 0.5));
  }, []);

  const question = questions[round % Math.max(1, questions.length)];

  // ── Inflation ticker ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const roundTime = getRoundTime(round);
    const tickMs = 80;
    const addPerTick = tickMs / (roundTime * 1000);
    let active = true;

    const tid = setInterval(() => {
      if (!active || phaseRef.current !== "playing") return;
      setInflation(prev => {
        if (prev >= 1) return 1;
        const next = prev + addPerTick;
        if (next >= 1) {
          active = false;
          setTimeout(() => {
            setPopping(true);
            setPhase("exploded");
          }, 0);
          return 1;
        }
        return next;
      });
    }, tickMs);

    return () => {
      active = false;
      clearInterval(tid);
    };
  }, [phase, round]);

  // ── Explosion aftermath ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exploded") return;
    const tid = setTimeout(() => {
      setPopping(false);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => setPhase("complete"), 200);
          return 0;
        }
        setRound(r => r + 1);
        setInflation(0);
        setAnswers([]);
        setInput("");
        setFeedback(null);
        setPhase("playing");
        return next;
      });
    }, 1400);
    return () => clearTimeout(tid);
  }, [phase]);

  // Auto-focus input when round starts
  useEffect(() => {
    if (phase === "playing") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, round]);

  // ── Game actions ────────────────────────────────────────────────────────────
  function startGame() {
    setQuestions(qs => [...qs].sort(() => Math.random() - 0.5));
    setPhase("playing");
    setLives(MAX_LIVES);
    setRound(0);
    setInflation(0);
    setAnswers([]);
    setInput("");
    setScore(0);
    setFeedback(null);
    setPopping(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setSugIdx(-1);
    if (question && val.trim().length >= 2) {
      setSuggestions(getSuggestions(val, question));
    } else {
      setSuggestions([]);
    }
  }

  function processAnswer(rawInput: string) {
    if (phase !== "playing" || !question || !rawInput.trim()) return;
    setSuggestions([]);
    setSugIdx(-1);

    const norm = normalizeAnswer(rawInput);

    if (answers.includes(norm)) {
      setFeedback({ text: "Already used!", color: "#f59e0b" });
      setInput("");
      setTimeout(() => setFeedback(null), 900);
      return;
    }

    const match = matchAnswer(rawInput, question);
    if (!match) {
      setFeedback({ text: "Not valid — try again", color: "#ef4444" });
      setInput("");
      setTimeout(() => setFeedback(null), 900);
      return;
    }

    const pts = calcScore(match.crowdPct);
    const deflation = getDeflation(match.crowdPct);
    const zone = getZoneLabel(pts);

    setAnswers(prev => [...prev, norm]);
    setScore(s => s + pts);

    setInflation(inf => {
      const next = Math.max(0, inf - deflation);
      // Cleared this round!
      if (next <= 0 && phaseRef.current === "playing") {
        setTimeout(() => {
          setFeedback({ text: "CLEARED! +1000 bonus", color: "#84cc16" });
          setScore(s => s + 1000);
          setTimeout(() => {
            setRound(r => r + 1);
            setInflation(0);
            setAnswers([]);
            setFeedback(null);
          }, 1200);
        }, 0);
      }
      return next;
    });

    setInput("");
    const color = pts >= 7500 ? "#84cc16" : pts >= 4500 ? "#f59e0b" : "rgba(255,255,255,0.85)";
    setFeedback({ text: `${zone.label} · +${pts.toLocaleString()}`, color });
    setTimeout(() => setFeedback(null), 1400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, -1)); return; }
      if (e.key === "Escape") { setSuggestions([]); setSugIdx(-1); return; }
      if (e.key === "Enter" && sugIdx >= 0) {
        e.preventDefault();
        processAnswer(suggestions[sugIdx].name);
        return;
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sugIdx >= 0 && suggestions[sugIdx]) {
      processAnswer(suggestions[sugIdx].name);
    } else {
      processAnswer(input);
    }
  }

  const stage = inflation < 0.35 ? 0 : inflation < 0.65 ? 1 : inflation < 0.85 ? 2 : 3;
  const stageLabel = ["Safe", "Building…", "Danger!", "CRITICAL!"][stage];
  const stageColor = ["rgba(132,204,22,0.9)", "#f59e0b", "#ef4444", "#dc2626"][stage];

  if (!mounted) return null;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen">
        <GameHeader title="Puffer Party" />
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="mb-6"
            >
              <PufferBall inflation={0.18} popping={false} />
            </motion.div>

            <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-3">
              Hot Potato Trivia
            </p>
            <h1
              className="font-playfair font-black italic text-white mb-5"
              style={{ fontSize: "clamp(3rem, 9vw, 5.5rem)", letterSpacing: "-0.03em", lineHeight: 0.9 }}
            >
              Puffer<br />Party
            </h1>
            <p className="text-white/45 text-sm max-w-xs mx-auto mb-8 leading-relaxed font-mono">
              A basketball inflates over time. Type valid NBA answers to deflate it.
              Rarer answers deflate it more. If it pops — you lose a life.
            </p>

            <div className="flex gap-5 justify-center mb-10 text-[11px] font-mono text-white/35 uppercase tracking-widest">
              <span>♥ 3 lives</span>
              <span>·</span>
              <span>rare = big deflate</span>
              <span>·</span>
              <span>survive!</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={startGame}
              className="px-14 py-5 font-mono font-bold text-base uppercase tracking-[0.15em]"
              style={{ background: "#84cc16", color: "#030508" }}
            >
              Start Game
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── COMPLETE ───────────────────────────────────────────────────────────────
  if (phase === "complete") {
    return (
      <div className="min-h-screen">
        <GameHeader title="Puffer Party" />
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="flex flex-col items-center"
          >
            <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#ef4444] mb-3">
              All Popped Out
            </p>
            <h2
              className="font-playfair font-black italic text-white mb-6"
              style={{ fontSize: "clamp(2.8rem, 8vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 0.9 }}
            >
              Game<br />Over
            </h2>

            <div
              className="px-10 py-5 mb-8 text-center"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
            >
              <p className="font-mono text-white/40 text-[10px] uppercase tracking-widest mb-1">Final Score</p>
              <p className="font-playfair font-black text-[#84cc16]"
                style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)" }}>
                {score.toLocaleString()}
              </p>
              <p className="font-mono text-white/35 text-xs mt-2">
                {round} round{round === 1 ? "" : "s"} survived
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={startGame}
              className="px-14 py-5 font-mono font-bold text-base uppercase tracking-[0.15em]"
              style={{ background: "#84cc16", color: "#030508" }}
            >
              Play Again
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── PLAYING / EXPLODED ─────────────────────────────────────────────────────
  const roundTime = getRoundTime(round);

  return (
    <div className="min-h-screen" style={{ overflow: "hidden" }}>
      {/* Cover global ArenaBackground — puffer party has its own dark bg */}
      <div className="fixed inset-0" style={{ zIndex: 0, background: "#030508" }} />

      {/* Flash on explosion */}
      <AnimatePresence>
        {popping && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.65, 0] }}
            transition={{ duration: 0.55, times: [0, 0.25, 1] }}
            style={{ background: "#dc2626" }}
          />
        )}
      </AnimatePresence>

      <GameHeader title="Puffer Party" />

      <main className="relative z-10 flex flex-col items-center px-4 pt-4 pb-10 max-w-lg mx-auto">

        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          {/* Lives */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <motion.span
                key={i}
                className="text-xl select-none"
                style={{ opacity: i < lives ? 1 : 0.18, color: "#ef4444" }}
                animate={i === lives && popping ? { scale: [1, 1.5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                ♥
              </motion.span>
            ))}
          </div>

          <div className="text-center">
            <p className="font-mono text-white/40 text-[10px] uppercase tracking-widest">
              Round {round + 1} · {roundTime}s
            </p>
          </div>

          <div className="text-right">
            <p className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "1.15rem" }}>
              {score.toLocaleString()}
            </p>
            <p className="font-mono text-white/25 text-[9px] uppercase tracking-widest">pts</p>
          </div>
        </div>

        {/* Stage status */}
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono font-bold uppercase tracking-[0.3em] text-xs mb-2"
          style={{ color: stageColor }}
        >
          {stageLabel}
        </motion.p>

        {/* THE BALL */}
        <div className="relative flex items-center justify-center" style={{ minHeight: 230 }}>
          <AnimatePresence mode="wait">
            {phase === "playing" || popping ? (
              <motion.div
                key={`ball-${round}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              >
                <PufferBall inflation={inflation} popping={popping} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Inflation bar */}
        <div className="w-full mb-1 relative"
          style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
          <motion.div
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              borderRadius: 3,
              background: stageColor,
              width: `${(inflation * 100).toFixed(1)}%`,
            }}
          />
        </div>
        <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-5">
          {Math.round(inflation * 100)}% inflated
        </p>

        {/* Question */}
        {question && (
          <div className="w-full mb-5 text-center">
            <p className="font-mono font-bold uppercase tracking-[0.25em] text-[9px] text-[#84cc16] mb-1.5">
              {question.category}
            </p>
            <h2
              className="font-playfair font-black italic text-white"
              style={{ fontSize: "clamp(1.25rem, 4vw, 1.7rem)", letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              {question.prompt}
            </h2>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full mb-3" style={{ position: "relative" }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type an answer…"
              disabled={phase !== "playing"}
              className="flex-1 px-4 py-3 font-mono text-sm text-white placeholder-white/20 outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
                caretColor: "#84cc16",
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.93 }}
              disabled={phase !== "playing"}
              className="px-5 py-3 font-mono font-bold text-sm uppercase"
              style={{ background: "#84cc16", color: "#030508" }}
            >
              →
            </motion.button>
          </div>
          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && phase === "playing" && (
            <div style={{
              position: "absolute", bottom: "100%", left: 0, right: 56, zIndex: 50,
              background: "#060d1c", border: "2px solid #1a2a4a",
              boxShadow: "4px 4px 0 #000", marginBottom: 4,
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); processAnswer(s.name); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 12px",
                    background: i === sugIdx ? "#1a2a4a" : "transparent",
                    color: i === sugIdx ? "#84cc16" : "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1rem", letterSpacing: "0.05em",
                    border: "none", cursor: "pointer",
                    borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.p
              key={feedback.text}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono font-bold text-sm uppercase tracking-[0.1em] mb-3"
              style={{ color: feedback.color }}
            >
              {feedback.text}
            </motion.p>
          )}
        </AnimatePresence>

        {!feedback && <div style={{ height: 28 }} />}

        {/* Used answers this round */}
        {answers.length > 0 && (
          <div className="w-full">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/20 mb-2 text-center">
              This round · {answers.length} answer{answers.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {answers.map(a => (
                <span
                  key={a}
                  className="font-mono text-[10px] px-2 py-0.5 text-white/50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
