import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Guess Who — Identify the Player",
  description: "Use clues to identify the mystery NBA player. Test your knowledge of current and historical NBA rosters. Free NBA trivia game.",
  keywords: ["NBA guess who", "NBA player quiz", "NBA trivia", "guess the NBA player", "basketball quiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
