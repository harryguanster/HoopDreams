import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Higher or Lower — Player Stats Game",
  description: "Guess whether the next NBA player scored higher or lower in points, rebounds, or assists. Free NBA trivia game — how far can you go?",
  keywords: ["NBA higher lower", "NBA higher or lower game", "NBA stats game", "basketball higher lower"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
