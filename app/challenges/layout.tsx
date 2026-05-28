import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NBA Daily Challenges",
  description: "Take on daily NBA trivia challenges — name the players, identify draft classes, and more. New challenges every day.",
  keywords: ["NBA daily challenge", "NBA trivia challenge", "daily basketball quiz", "NBA challenge game"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
