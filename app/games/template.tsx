"use client";

import { useEffect } from "react";

export default function GamesTemplate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return <>{children}</>;
}
