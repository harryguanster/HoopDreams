import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Connections — Group the Players",
  description: "Find the four NBA players that share a hidden connection. A basketball twist on the classic Connections word game. Free daily NBA trivia.",
  keywords: ["NBA connections", "NBA trivia game", "basketball connections game", "NBA word game", "NBA grouping game"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
