import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Lineup Guesser — Name the Starting Five",
  description: "Can you name the starting lineup? Identify five NBA players from a given team and era. Free NBA trivia game.",
  keywords: ["NBA lineup guesser", "NBA starting five quiz", "guess the NBA lineup", "basketball trivia", "NBA team quiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
