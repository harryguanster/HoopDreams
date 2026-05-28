import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Season Simulator",
  description: "Simulate NBA seasons and see how teams stack up. Run playoff brackets and predict championships. Free NBA season simulator.",
  keywords: ["NBA season simulator", "NBA playoff simulator", "simulate NBA season", "NBA prediction game", "basketball simulator"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
