import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Bench Cut — NBA Edition",
  description: "Start, Bench, or Cut three NBA players — make the tough decisions. A free NBA trivia game that tests your basketball opinions.",
  keywords: ["start bench cut NBA", "start sit cut NBA", "NBA trivia game", "basketball start bench cut", "NBA player game"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
