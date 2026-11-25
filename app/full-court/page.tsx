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

type Phase = "intro" | "crowd" | "playing" | "revealing" | "complete";

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

function CrowdBars({ question, visible }: { question: FullCourtQuestion; visible: boolean }) {
  const topAnswers = [...question.answers]
    .sort((a, b) => b.crowdPct - a.crowdPct)
    .slice(0, 5);
  const maxPct = topAnswers[0]?.crowdPct ?? 1;

  return (
    <div className="space-y-2">
      <p style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.5rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 10 }}>
        THE CROWD WILL PICK
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
          <div className="flex-1 h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full"
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

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = seconds <= 5 ? "#ef4444" : seconds <= 10 ? "#f97316" : "#84cc16";
  return (
    <svg width={56} height={56} viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
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

const panelBase: React.CSSProperties = {
  background: "rgba(8,14,26,0.96)",
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
  const [showCrowdBars, setShowCrowdBars] = useState(false);
  const [lastZone, setLastZone] = useState<{ label: string; sub: string } | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
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
    stopTimer();
    setSuggestions([]);
    setSugIdx(-1);

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

      <AnimatePresence mode="wait">

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ ...panelBase, padding: "36px 40px", width: "min(420px, 90vw)", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.5rem", color: "#84cc16",
                letterSpacing: "0.25em", marginBottom: 16,
              }}>
                DAILY · {getTodayStr()}
              </p>
              <h1 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(16px, 3vw, 26px)",
                color: "white", lineHeight: 1.5,
                textShadow: "4px 4px 0 #000",
                marginBottom: 20,
              }}>
                FULL COURT
              </h1>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1.1rem", color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.08em", lineHeight: 1.5,
                marginBottom: 8,
              }}>
                7 NBA prompts. 20 seconds each.
              </p>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1rem", color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em", marginBottom: 32,
              }}>
                The rarer your answer, the farther down the court you travel.
              </p>
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
                INBOUND THE BALL →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── GAME (crowd + playing + revealing) ── */}
        {(phase === "crowd" || phase === "playing" || phase === "revealing") && currentQ && (
          <motion.div
            key={`round-${roundIdx}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Crowd bars panel — mid-screen */}
            {(phase === "crowd") && (
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(460px, 90vw)",
                ...panelBase, padding: "24px 28px",
                zIndex: 20,
              }}>
                <CrowdBars question={currentQ} visible={showCrowdBars} />
              </div>
            )}

            {/* Top question panel */}
            {(phase === "playing" || phase === "revealing") && (
              <div style={{
                position: "absolute", top: 60, left: "50%",
                transform: "translateX(-50%)",
                width: "min(560px, 92vw)",
                ...panelBase, zIndex: 20,
              }}>
                {/* Round progress dots + label */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: i === roundIdx ? 20 : 8,
                          height: 8,
                          borderRadius: 4,
                          background: i <= roundIdx ? "#84cc16" : "rgba(255,255,255,0.15)",
                          transition: "width 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.45rem", color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.1em",
                  }}>
                    Q {roundIdx + 1} / {TOTAL_ROUNDS}
                  </span>
                </div>

                {/* Question text */}
                <div style={{ padding: "18px 20px 14px" }}>
                  <p style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: "0.4rem", color: "rgba(132,204,22,0.7)",
                    letterSpacing: "0.2em", marginBottom: 12,
                  }}>
                    FULL COURT
                  </p>
                  <p style={{
                    fontFamily: "var(--font-vt323), monospace",
                    fontSize: "1.5rem", color: "white",
                    lineHeight: 1.35, letterSpacing: "0.04em",
                    marginBottom: 10,
                  }}>
                    {currentQ.prompt}
                  </p>
                  {phase === "playing" && (
                    <p style={{
                      fontFamily: "var(--font-vt323), monospace",
                      fontSize: "0.9rem", color: "rgba(255,255,255,0.3)",
                      letterSpacing: "0.08em",
                    }}>
                      give a rare answer to advance the ball
                    </p>
                  )}
                  {phase === "revealing" && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 4 }}>
                            YOUR ANSWER
                          </p>
                          <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "1.3rem", color: "white" }}>
                            {results[results.length - 1]?.answer || "(skipped)"}
                          </p>
                          {results[results.length - 1]?.matched ? (
                            <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.95rem", color: "#84cc16", marginTop: 2 }}>
                              {results[results.length - 1].matched!.crowdPct}% of crowd picked this
                            </p>
                          ) : (
                            <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.95rem", color: "#ef4444", marginTop: 2 }}>
                              Not a valid answer
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{
                            fontFamily: "var(--font-press-start), monospace",
                            fontSize: "1.4rem", color: lastScore > 0 ? "#84cc16" : "rgba(255,255,255,0.3)",
                          }}>
                            +{lastScore.toLocaleString()}
                          </p>
                          {lastZone && (
                            <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                              {lastZone.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom input panel */}
            {phase === "playing" && (
              <div style={{
                position: "absolute", bottom: 32, left: "50%",
                transform: "translateX(-50%)",
                width: "min(560px, 92vw)",
                ...panelBase, padding: "16px 20px",
                zIndex: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                  <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />
                  <div style={{ flex: 1, position: "relative" }}>
                    {/* Autocomplete above input */}
                    {suggestions.length > 0 && (
                      <div style={{
                        position: "absolute", bottom: "100%", left: 0, right: 0,
                        background: "#060d1c", border: "2px solid #1a2a4a",
                        boxShadow: "4px 4px 0 #000", marginBottom: 4, zIndex: 60,
                      }}>
                        {suggestions.map((s, i) => (
                          <button
                            key={s.name}
                            onMouseDown={e => { e.preventDefault(); selectSuggestion(s); }}
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
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKey}
                      placeholder="Type your answer…"
                      className="w-full bg-transparent text-white placeholder-white/25 text-sm py-2 outline-none"
                      style={{
                        fontFamily: "var(--font-vt323), monospace",
                        fontSize: "1.2rem", letterSpacing: "0.06em",
                        borderBottom: "2px solid rgba(132,204,22,0.6)",
                      }}
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    />
                  </div>
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
                  >
                    SUBMIT
                  </button>
                </div>
                <p style={{
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "0.8rem", color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.08em", marginTop: 8, textAlign: "center",
                }}>
                  SCORE: {totalScore.toLocaleString()} pts
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            className="absolute inset-0 flex items-center justify-center"
            style={{ overflowY: "auto", padding: "60px 16px" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div style={{ ...panelBase, padding: "32px 28px", width: "min(480px, 92vw)", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "0.45rem", color: "#84cc16",
                letterSpacing: "0.2em", marginBottom: 12,
              }}>
                {alreadyPlayed ? "TODAY'S RESULT" : "GAME OVER"}
              </p>
              <h2 style={{
                fontFamily: "var(--font-press-start), monospace",
                fontSize: "clamp(16px, 3vw, 24px)",
                color: "white", lineHeight: 1.4,
                textShadow: "4px 4px 0 #1a3000",
                marginBottom: 6,
              }}>
                {finalZone.label}
              </h2>
              <p style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "1rem", color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em", marginBottom: 24,
              }}>
                {finalZone.sub}
              </p>

              {/* Total score */}
              <div style={{
                background: "rgba(132,204,22,0.08)",
                border: "1px solid rgba(132,204,22,0.2)",
                padding: "18px 24px", marginBottom: 20,
              }}>
                <p style={{ fontFamily: "var(--font-press-start), monospace", fontSize: "0.4rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginBottom: 6 }}>
                  TOTAL SCORE
                </p>
                <p style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "2rem", color: "#84cc16", lineHeight: 1,
                }}>
                  {totalScore.toLocaleString()}
                </p>
                <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  avg {Math.round(totalScore / TOTAL_ROUNDS).toLocaleString()} / round
                </p>
              </div>

              {/* Result breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ textAlign: "left", flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 2 }}>
                        {r.question.prompt}
                      </p>
                      <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "1.1rem", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.answer}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-press-start), monospace",
                        fontSize: "0.65rem",
                        color: r.score > 0 ? "#84cc16" : "rgba(255,255,255,0.3)",
                      }}>
                        +{r.score.toLocaleString()}
                      </p>
                      {r.matched && (
                        <p style={{ fontFamily: "var(--font-vt323), monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                          {r.crowdPct}% picked
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/"
                style={{
                  display: "block", padding: "14px",
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: "0.5rem", letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textDecoration: "none", textAlign: "center",
                }}
              >
                ← BACK HOME
              </a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
