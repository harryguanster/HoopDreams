"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FULL_COURT_QUESTIONS,
  getDailyQuestions,
  matchAnswer,
  getSuggestions,
  calcScore,
  getZoneLabel,
  type FullCourtQuestion,
  type FullCourtAnswer,
} from "@/lib/fullCourtData";
import { getDailyIndex, getTodayStr } from "@/lib/dailyUtils";

const TOTAL_ROUNDS = 7;
const TIMER_SECONDS = 20;
const STORAGE_KEY = "courtside_fullcourt_v1";

type Phase = "intro" | "playing" | "revealing" | "complete";

type RoundResult = {
  question: FullCourtQuestion;
  answer: string;
  matched: FullCourtAnswer | null;
  score: number;
  crowdPct: number;
};

function scoreToBallProgress(score: number): number {
  return 0.04 + (score / 10000) * 0.9;
}

function rarityDescription(crowdPct: number, matched: boolean): string {
  if (!matched) return "Not a valid answer for this question.";
  if (crowdPct > 20) return `Very common (${crowdPct}%) — the crowd saw this coming.`;
  if (crowdPct > 10) return `Common pick (${crowdPct}%) — not quite rare enough.`;
  if (crowdPct > 5)  return `Decent rarity (${crowdPct}%) — a step above the crowd.`;
  if (crowdPct > 2)  return `Rare pick (${crowdPct}%) — not many thought of that.`;
  return `Elite answer (${crowdPct}%) — barely anyone picked this.`;
}

function zoneColor(score: number): string {
  if (score >= 8000) return "#84cc16";
  if (score >= 6000) return "#22c55e";
  if (score >= 4000) return "#f59e0b";
  if (score >= 2000) return "#ef4444";
  return "#6b7280";
}

const panelBase: React.CSSProperties = {
  background: "rgba(8,14,26,0.97)",
  border: "2px solid rgba(255,255,255,0.08)",
};

export default function FullCourtPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<FullCourtQuestion[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [ballProgress, setBallProgress] = useState(0.04);
  const [lastZone, setLastZone] = useState<{ label: string; sub: string } | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [suggestions, setSuggestions] = useState<FullCourtAnswer[]>([]);
  const [sugIdx, setSugIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const dayIdx = getDailyIndex(FULL_COURT_QUESTIONS.length);
    const qs = getDailyQuestions(dayIdx);
    setQuestions(qs);

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
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const finalZone = getZoneLabel(Math.min(Math.round(totalScore / TOTAL_ROUNDS), 10000));

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const submitAnswer = useCallback((rawInput: string) => {
    if (!currentQ || phase !== "playing") return;
    setSuggestions([]);
    setSugIdx(-1);

    const matched = matchAnswer(rawInput, currentQ);

    // Invalid guess and not a timer timeout — let them try again
    if (!matched && rawInput !== "") {
      setInput("");
      setInvalidGuess(true);
      setTimeout(() => setInvalidGuess(false), 1500);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    stopTimer();
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
    setLastResult(result);
    setBallProgress(scoreToBallProgress(score));
    setResults(newResults);
    setPhase("revealing");

    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayStr(), results: newResults }));
      } catch { /* ignore */ }
    }
  }, [currentQ, phase, stopTimer, results, roundIdx]);

  function advanceRound() {
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase("complete");
    } else {
      setRoundIdx(prev => prev + 1);
      setInput("");
      setBallProgress(0.04);
      setPhase("playing");
    }
  }

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

  function startGame() {
    setPhase("playing");
    setRoundIdx(0);
    setResults([]);
    setBallProgress(0.04);
    setInput("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setSugIdx(-1);
    if (currentQ && val.trim().length >= 2) {
      setSuggestions(getSuggestions(val, currentQ));
    } else {
      setSuggestions([]);
    }
  }

  function selectSuggestion(ans: FullCourtAnswer) {
    setInput(ans.name);
    setSuggestions([]);
    setSugIdx(-1);
    submitAnswer(ans.name);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, -1)); return; }
      if (e.key === "Escape") { setSuggestions([]); setSugIdx(-1); return; }
      if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); selectSuggestion(suggestions[sugIdx]); return; }
    }
    if (e.key === "Enter" && input.trim()) submitAnswer(input);
  }

  // Build examples list for reveal panel
  const revealExamples = lastResult ? (() => {
    const q = lastResult.question;
    const top5 = [...q.answers].sort((a, b) => b.crowdPct - a.crowdPct).slice(0, 5);
    const userNorm = lastResult.matched?.name ?? null;
    const userInTop5 = userNorm ? top5.some(a => a.name === userNorm) : false;
    const rows: { name: string; pct: number; isUser: boolean }[] = top5.map(a => ({
      name: a.name,
      pct: a.crowdPct,
      isUser: a.name === userNorm,
    }));
    if (!userInTop5 && lastResult.matched) {
      rows.push({ name: lastResult.matched.name, pct: lastResult.matched.crowdPct, isUser: true });
    }
    return rows;
  })() : [];
  const maxRevealPct = revealExamples[0]?.pct ?? 1;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ color: "white" }}>

      {/* Back link */}
      <a href="/" style={{
        position: "absolute", top: 16, left: 16, zIndex: 30,
        fontFamily: "var(--font-press-start), monospace",
        fontSize: "0.5rem", color: "rgba(255,255,255,0.45)",
        textDecoration: "none", letterSpacing: "0.1em",
      }}>
        ← HOME
      </a>

      <AnimatePresence mode="wait">

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <motion.div key="intro" className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ ...panelBase, padding: "36px 40px", width: "min(420px, 90vw)", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.5rem", color: "#84cc16",
                letterSpacing: "0.25em", marginBottom: 16,
              }}>DAILY · {getTodayStr()}</p>
              <h1 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(16px, 3vw, 26px)", color: "white",
                lineHeight: 1.5, textShadow: "4px 4px 0 #000", marginBottom: 20,
              }}>FULL COURT</h1>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1.1rem", color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.08em", lineHeight: 1.5, marginBottom: 8,
              }}>7 NBA prompts. 20 seconds each.</p>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1rem", color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em", marginBottom: 32,
              }}>The rarer your answer, the higher your score.</p>
              <button onClick={startGame} style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.65rem", letterSpacing: "0.15em",
                background: "#84cc16", color: "#030508",
                border: "none", padding: "14px 28px", cursor: "pointer", width: "100%",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
              >INBOUND THE BALL →</button>
            </div>
          </motion.div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && currentQ && (
          <motion.div key={`play-${roundIdx}`} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Top question panel */}
            <div style={{
              position: "absolute", top: 56, left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 92vw)",
              ...panelBase, zIndex: 20,
            }}>
              {/* Progress squares + score */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                    <div key={i} style={{
                      width: 20, height: 14,
                      background: i < roundIdx
                        ? "#84cc16"
                        : i === roundIdx
                        ? "rgba(132,204,22,0.35)"
                        : "rgba(255,255,255,0.1)",
                      border: i === roundIdx ? "1px solid #84cc16" : "1px solid transparent",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.55rem", color: "#84cc16",
                }}>
                  {totalScore.toLocaleString()} pts
                </span>
              </div>

              {/* Question */}
              <div style={{ padding: "16px 20px 14px" }}>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.4rem", color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.18em", marginBottom: 10,
                }}>▲ FULL COURT QUESTION {roundIdx + 1} OF {TOTAL_ROUNDS}</p>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "clamp(11px, 1.6vw, 15px)",
                  color: "white", lineHeight: 1.7, marginBottom: 10,
                }}>{currentQ.prompt}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "0.9rem", color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.06em",
                  }}>Give the rarest answer to advance the ball.</p>
                  {/* Timer bar */}
                  <span style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.55rem",
                    color: timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f97316" : "rgba(255,255,255,0.4)",
                  }}>{timeLeft}s</span>
                </div>
                {/* Timer progress */}
                <div style={{ marginTop: 8, height: 2, background: "rgba(255,255,255,0.08)", position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    background: timeLeft <= 5 ? "#ef4444" : "#84cc16",
                    width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
                    transition: "width 1s linear",
                  }} />
                </div>
              </div>
            </div>

            {/* Bottom input panel */}
            <div style={{
              position: "absolute", bottom: 32, left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 92vw)",
              ...panelBase, padding: "16px 20px",
              zIndex: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                {/* Autocomplete above */}
                {suggestions.length > 0 && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: 0, right: 0,
                    background: "#060d1c", border: "2px solid #1a2a4a",
                    boxShadow: "4px 4px 0 #000", marginBottom: 4, zIndex: 60,
                  }}>
                    {suggestions.map((s, i) => (
                      <button key={s.name} onMouseDown={e => { e.preventDefault(); selectSuggestion(s); }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "8px 14px",
                          background: i === sugIdx ? "#1a2a4a" : "transparent",
                          color: i === sugIdx ? "#84cc16" : "rgba(255,255,255,0.85)",
                          fontFamily: "var(--font-vt323), monospace",
                          fontSize: "1.1rem", letterSpacing: "0.05em",
                          border: "none", cursor: "pointer",
                          borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}>{s.name}</button>
                    ))}
                  </div>
                )}

                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKey}
                  placeholder="Your answer…"
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1.3rem", letterSpacing: "0.06em",
                    background: "transparent", color: "white",
                    border: "none", borderBottom: "2px solid rgba(132,204,22,0.5)",
                    outline: "none", padding: "6px 0",
                  }}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                />
                {invalidGuess && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: 0, right: 0,
                    marginBottom: 6,
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1rem", letterSpacing: "0.06em",
                    color: "#ef4444",
                    padding: "6px 10px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}>
                    ✗ Not a valid answer — try again
                  </div>
                )}
                <button
                  onClick={() => input.trim() && submitAnswer(input)}
                  disabled={!input.trim()}
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.5rem", letterSpacing: "0.1em",
                    background: "#84cc16", color: "#030508",
                    border: "none", padding: "12px 16px",
                    cursor: "pointer", flexShrink: 0,
                    opacity: input.trim() ? 1 : 0.35,
                  }}
                >SUBMIT</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── REVEALING ── */}
        {phase === "revealing" && lastResult && (
          <motion.div key={`reveal-${roundIdx}`} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Top question panel (static, no timer) */}
            <div style={{
              position: "absolute", top: 56, left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 92vw)",
              ...panelBase, zIndex: 20,
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                    <div key={i} style={{
                      width: 20, height: 14,
                      background: i <= roundIdx ? "#84cc16" : "rgba(255,255,255,0.1)",
                      border: "1px solid transparent",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.55rem", color: "#84cc16",
                }}>{totalScore.toLocaleString()} pts</span>
              </div>
              <div style={{ padding: "14px 20px" }}>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.4rem", color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.18em", marginBottom: 10,
                }}>▲ FULL COURT QUESTION {roundIdx + 1} OF {TOTAL_ROUNDS}</p>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "clamp(11px, 1.6vw, 15px)",
                  color: "white", lineHeight: 1.7,
                }}>{lastResult.question.prompt}</p>
              </div>
            </div>

            {/* Bottom reveal panel */}
            <div style={{
              position: "absolute", bottom: 32, left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 92vw)",
              ...panelBase, zIndex: 20, overflow: "hidden",
            }}>
              {/* Colored header */}
              <div style={{
                background: lastResult.matched ? zoneColor(lastScore) : "#6b7280",
                padding: "12px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.65rem", color: "#030508", letterSpacing: "0.1em",
                }}>→ {lastZone?.label ?? "NO SCORE"}</span>
                <span style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.65rem", color: "#030508",
                }}>+{lastScore.toLocaleString()}<span style={{ fontSize: "0.4rem", marginLeft: 2 }}>pts</span></span>
              </div>

              {/* Body */}
              <div style={{ padding: "14px 18px" }}>
                <p style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "1rem", color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.06em", marginBottom: 14,
                }}>
                  {rarityDescription(lastResult.crowdPct, !!lastResult.matched)}
                </p>

                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.38rem", color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.18em", marginBottom: 10,
                }}>EXAMPLES OF OTHER ANSWERS</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {revealExamples.map(({ name, pct, isUser }) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontFamily: "var(--font-vt323), monospace",
                        fontSize: "1rem", letterSpacing: "0.04em",
                        color: isUser ? "white" : "rgba(255,255,255,0.65)",
                        width: 160, flexShrink: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {name}
                        {isUser && <span style={{ color: lastResult.matched ? zoneColor(lastScore) : "#ef4444", marginLeft: 6, fontSize: "0.85rem" }}>(you)</span>}
                      </span>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", position: "relative" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${(pct / maxRevealPct) * 100}%`,
                          background: isUser
                            ? (lastResult.matched ? zoneColor(lastScore) : "#6b7280")
                            : "rgba(255,255,255,0.3)",
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "var(--font-vt323), monospace",
                        fontSize: "0.95rem", color: "rgba(255,255,255,0.5)",
                        width: 42, textAlign: "right", flexShrink: 0,
                      }}>{pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={advanceRound}
                  style={{
                    marginTop: 16, width: "100%",
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.55rem", letterSpacing: "0.15em",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.8)",
                    padding: "13px", cursor: "pointer",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                >
                  {roundIdx + 1 >= TOTAL_ROUNDS ? "SEE RESULTS" : "NEXT QUESTION"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <motion.div key="complete" className="absolute inset-0 flex items-center justify-center"
            style={{ overflowY: "auto", padding: "60px 16px" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ ...panelBase, padding: "32px 28px", width: "min(480px, 92vw)", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.45rem", color: "#84cc16",
                letterSpacing: "0.2em", marginBottom: 12,
              }}>{alreadyPlayed ? "TODAY'S RESULT" : "GAME OVER"}</p>
              <h2 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(16px, 3vw, 24px)", color: "white",
                lineHeight: 1.4, textShadow: "4px 4px 0 #1a3000", marginBottom: 6,
              }}>{finalZone.label}</h2>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1rem", color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em", marginBottom: 24,
              }}>{finalZone.sub}</p>

              <div style={{
                background: "rgba(132,204,22,0.08)",
                border: "1px solid rgba(132,204,22,0.2)",
                padding: "18px 24px", marginBottom: 20,
              }}>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.4rem", color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.15em", marginBottom: 6,
                }}>TOTAL SCORE</p>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "2rem", color: "#84cc16", lineHeight: 1,
                }}>{totalScore.toLocaleString()}</p>
                <p style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", marginTop: 4,
                }}>avg {Math.round(totalScore / TOTAL_ROUNDS).toLocaleString()} / round</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ textAlign: "left", flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{
                        fontFamily: "var(--font-vt323), monospace",
                        fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
                        letterSpacing: "0.08em", marginBottom: 2,
                      }}>{r.question.prompt}</p>
                      <p style={{
                        fontFamily: "var(--font-vt323), monospace",
                        fontSize: "1.1rem", color: "white",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{r.answer}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-press-start), monospace",
                        fontSize: "0.65rem",
                        color: r.score > 0 ? zoneColor(r.score) : "rgba(255,255,255,0.3)",
                      }}>+{r.score.toLocaleString()}</p>
                      {r.matched && (
                        <p style={{
                          fontFamily: "var(--font-vt323), monospace",
                          fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                        }}>{r.crowdPct}% picked</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a href="/" style={{
                display: "block", padding: "14px",
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.5rem", letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none", textAlign: "center",
              }}>← BACK HOME</a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
