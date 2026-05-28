import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Games & Trivia",
  description: "Play free NBA trivia games: Higher or Lower, Connections, Franchise Mode simulator, Guess Who, Start Bench Cut, Stat Line Guesser, and more. No sign-up required.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
