"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function ballFill(inf: number): string {
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
  return 0.10 + (1 - crowdPct / 100) * 0.28;
}

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
      transition={stage >= 2 ? { repeat: Infinity, duration: stage === 3 ? 0.1 : 0.28 } : {}}
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
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="pbc"><circle cx={cx} cy={cy} r={r} /></clipPath>
        </defs>
        {inflation > 0.4 && (
          <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={color}
            strokeWidth={2 + inflation * 5} opacity={0.08 + (inflation - 0.4) * 0.3} />
        )}
        {spikeLen > 1 && (
          <polygon points={pufferPoints(cx, cy, r + 2, spikeLen)} fill={color} opacity={0.6} />
        )}
        <circle cx={cx} cy={cy} r={r} fill="url(#pbg)" filter={stage >= 2 ? "url(#pbf)" : undefined} />
        <g clipPath="url(#pbc)" fill="none" stroke="rgba(0,0,0,0.42)" strokeWidth={2 + inflation * 1.5}>
          <path d={`M${cx - r},${cy} Q${cx},${cy - r * 0.38} ${cx + r},${cy}`} />
          <path d={`M${cx},${cy - r} Q${cx + r * 0.38},${cy} ${cx},${cy + r}`} />
          <path d={`M${cx - r * 0.5},${cy - r * 0.87} Q${cx - r * 1.15},${cy} ${cx - r * 0.5},${cy + r * 0.87}`} />
          <path d={`M${cx + r * 0.5},${cy - r * 0.87} Q${cx + r * 1.15},${cy} ${cx + r * 0.5},${cy + r * 0.87}`} />
        </g>
        <ellipse cx={cx - r * 0.22} cy={cy - r * 0.28} rx={r * 0.22} ry={r * 0.15} fill="rgba(255,255,255,0.22)" />
        {stage >= 3 && (
          <g>
            <ellipse cx={cx - 18} cy={cy - 12} rx={7} ry={8} fill="white" />
            <ellipse cx={cx + 18} cy={cy - 12} rx={7} ry={8} fill="white" />
            <circle cx={cx - 17} cy={cy - 10} r={4} fill="#1a0000" />
            <circle cx={cx + 19} cy={cy - 10} r={4} fill="#1a0000" />
            <path d={`M${cx - 26},${cy - 24} L${cx - 13},${cy - 18}`} stroke="#1a0000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${cx + 26},${cy - 24} L${cx + 13},${cy - 18}`} stroke="#1a0000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

type Phase = "intro" | "playing" | "exploded" | "complete";
const MAX_LIVES = 3;

const panelBase: React.CSSProperties = {
  background: "rgba(8,14,26,0.96)",
  border: "2px solid rgba(255,255,255,0.08)",
};

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
          setTimeout(() => { setPopping(true); setPhase("exploded"); }, 0);
          return 1;
        }
        return next;
      });
    }, tickMs);

    return () => { active = false; clearInterval(tid); };
  }, [phase, round]);

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

  useEffect(() => {
    if (phase === "playing") setTimeout(() => inputRef.current?.focus(), 100);
  }, [phase, round]);

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
      if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); processAnswer(suggestions[sugIdx].name); return; }
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

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ color: "white" }}>

      {/* Back link */}
      <a
        href="/"
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 30,
          fontFamily: "var(--font-press-start), monospace",
          fontSize: "0.5rem", color: "rgba(255,255,255,0.45)",
          textDecoration: "none", letterSpacing: "0.1em",
        }}
      >
        ← HOME
      </a>

      {/* Flash on explosion */}
      <AnimatePresence>
        {popping && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 50, background: "#dc2626" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.65, 0] }}
            transition={{ duration: 0.55, times: [0, 0.25, 1] }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ ...panelBase, padding: "36px 40px", width: "min(420px, 90vw)", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                >
                  <PufferBall inflation={0.18} popping={false} />
                </motion.div>
              </div>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.45rem", color: "#ef4444",
                letterSpacing: "0.2em", marginBottom: 12,
              }}>
                HOT POTATO TRIVIA
              </p>
              <h1 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(14px, 2.5vw, 20px)",
                color: "white", lineHeight: 1.5,
                textShadow: "4px 4px 0 #000",
                marginBottom: 20,
              }}>
                PUFFER PARTY
              </h1>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1.05rem", color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em", lineHeight: 1.5,
                marginBottom: 32,
              }}>
                A basketball inflates over time. Type valid NBA answers to deflate it.
                Rarer answers deflate it more. If it pops — you lose a life.
              </p>
              <div style={{
                display: "flex", gap: 12, justifyContent: "center", marginBottom: 28,
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "0.9rem", color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
              }}>
                <span>♥ 3 lives</span>
                <span>·</span>
                <span>rare = big deflate</span>
              </div>
              <button
                onClick={startGame}
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.65rem", letterSpacing: "0.15em",
                  background: "#84cc16", color: "#030508",
                  border: "none", padding: "14px 28px",
                  cursor: "pointer", width: "100%",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
              >
                START GAME →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ ...panelBase, padding: "36px 40px", width: "min(420px, 90vw)", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.45rem", color: "#ef4444",
                letterSpacing: "0.2em", marginBottom: 12,
              }}>
                ALL POPPED OUT
              </p>
              <h2 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(16px, 2.5vw, 22px)",
                color: "white", lineHeight: 1.5,
                textShadow: "4px 4px 0 #000",
                marginBottom: 24,
              }}>
                GAME OVER
              </h2>
              <div style={{
                background: "rgba(132,204,22,0.08)",
                border: "1px solid rgba(132,204,22,0.2)",
                padding: "18px 24px", marginBottom: 28,
              }}>
                <p style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.4rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: 6 }}>
                  FINAL SCORE
                </p>
                <p style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "2rem", color: "#84cc16", lineHeight: 1 }}>
                  {score.toLocaleString()}
                </p>
                <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {round} round{round === 1 ? "" : "s"} survived
                </p>
              </div>
              <button
                onClick={startGame}
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.65rem", letterSpacing: "0.15em",
                  background: "#84cc16", color: "#030508",
                  border: "none", padding: "14px 28px",
                  cursor: "pointer", width: "100%", marginBottom: 10,
                }}
              >
                PLAY AGAIN →
              </button>
              <a
                href="/"
                style={{
                  display: "block", padding: "12px",
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.45rem", letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}
              >
                ← BACK HOME
              </a>
            </div>
          </motion.div>
        )}

        {/* ── PLAYING / EXPLODED ── */}
        {(phase === "playing" || phase === "exploded") && (
          <motion.div
            key="playing"
            className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Top status panel */}
            <div style={{
              position: "absolute", top: 60, left: "50%",
              transform: "translateX(-50%)",
              width: "min(480px, 92vw)",
              ...panelBase, zIndex: 20,
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {/* Lives */}
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: MAX_LIVES }).map((_, i) => (
                    <motion.span
                      key={i}
                      style={{
                        fontSize: "1rem", color: "#ef4444",
                        opacity: i < lives ? 1 : 0.2,
                      }}
                      animate={i === lives && popping ? { scale: [1, 1.5, 0] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      ♥
                    </motion.span>
                  ))}
                </div>

                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.45rem", color: stageColor,
                    letterSpacing: "0.12em",
                  }}
                >
                  {stageLabel}
                </motion.p>

                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.65rem", color: "#84cc16",
                }}>
                  {score.toLocaleString()}
                </p>
              </div>

              {/* Question */}
              {question && (
                <div style={{ padding: "14px 18px 12px" }}>
                  <p style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.4rem", color: "rgba(132,204,22,0.7)",
                    letterSpacing: "0.2em", marginBottom: 8,
                  }}>
                    ROUND {round + 1} · {getRoundTime(round)}s
                  </p>
                  <p style={{
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1.4rem", color: "white",
                    lineHeight: 1.35, letterSpacing: "0.04em",
                  }}>
                    {question.prompt}
                  </p>
                </div>
              )}

              {/* Inflation bar */}
              <div style={{
                height: 4, margin: "0 0 0",
                background: "rgba(255,255,255,0.07)",
                position: "relative",
              }}>
                <motion.div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  background: stageColor,
                  width: `${(inflation * 100).toFixed(1)}%`,
                }} />
              </div>
            </div>

            {/* Ball — centered */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20, pointerEvents: "none",
            }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`ball-${round}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  <PufferBall inflation={inflation} popping={popping} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom input panel */}
            <div style={{
              position: "absolute", bottom: 32, left: "50%",
              transform: "translateX(-50%)",
              width: "min(480px, 92vw)",
              ...panelBase, padding: "14px 18px",
              zIndex: 20,
            }}>
              {/* Feedback */}
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.p
                    key={feedback.text}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: "var(--font-vt323), monospace",
                      fontSize: "1.1rem", color: feedback.color,
                      letterSpacing: "0.08em", marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {feedback.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                {/* Autocomplete above */}
                {suggestions.length > 0 && phase === "playing" && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: 0, right: 60,
                    background: "#060d1c", border: "2px solid #1a2a4a",
                    boxShadow: "4px 4px 0 #000", marginBottom: 4, zIndex: 60,
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
                          fontSize: "1.05rem", letterSpacing: "0.05em",
                          border: "none", cursor: "pointer",
                          borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type an answer…"
                  disabled={phase !== "playing"}
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1.2rem", letterSpacing: "0.06em",
                    background: "transparent", color: "white",
                    border: "none", borderBottom: "2px solid rgba(132,204,22,0.6)",
                    outline: "none", padding: "6px 0",
                  }}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={phase !== "playing"}
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.5rem", letterSpacing: "0.1em",
                    background: "#84cc16", color: "#030508",
                    border: "none", padding: "12px 14px",
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  →
                </button>
              </form>

              {/* Used answers */}
              {answers.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                    {answers.map(a => (
                      <span
                        key={a}
                        style={{
                          fontFamily: "var(--font-vt323), monospace",
                          fontSize: "0.75rem", padding: "2px 8px",
                          color: "rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
