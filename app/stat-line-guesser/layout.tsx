import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Stat Line Guesser — Name the Player",
  description: "A stat line appears — can you name the NBA player? Guess from points, rebounds, assists, and more. Free NBA stats trivia game.",
  keywords: ["NBA stat line guesser", "guess the NBA player stats", "NBA stats quiz", "basketball stat game", "NBA trivia"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
