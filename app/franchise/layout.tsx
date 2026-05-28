import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Franchise Mode Simulator",
  description: "Build a 12-man NBA roster on a salary cap, simulate full 82-game seasons, manage trades, injuries, and player development year over year. Free NBA franchise simulator.",
  keywords: ["NBA franchise mode", "NBA simulator", "NBA roster builder", "NBA salary cap game", "basketball franchise simulator"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
