"use client";

import { useState } from "react";
import { NBA_HEADSHOT_IDS } from "@/lib/nbaHeadshotIds";

// ESPN IDs for retired/historical players not in nbaHeadshotIds.ts
// URL: https://a.espncdn.com/i/headshots/nba/players/full/{id}.png
const HISTORICAL_ESPN_IDS: Record<string, number> = {
  jordan:   173,   // Michael Jordan
  kobe:     110,   // Kobe Bryant
  shaq:     614,   // Shaquille O'Neal
  magic:    1749,  // Magic Johnson
  bird:     1712,  // Larry Bird
  timD:     207,   // Tim Duncan
  dirk:     1717,  // Dirk Nowitzki
  kg:       698,   // Kevin Garnett
  dwyane:   1714,  // Dwyane Wade
  cp3:      2779,  // Chris Paul
  hakeem:   165,   // Hakeem Olajuwon
  ewing:    761,   // Patrick Ewing
  vince:    685,   // Vince Carter
  tmac:     1054,  // Tracy McGrady
  iverson:  647,   // Allen Iverson
  barkley:  186,   // Charles Barkley
  pippen:   1008,  // Scottie Pippen
  isiah:    1034,  // Isiah Thomas
  kareem:   3428,  // Kareem Abdul-Jabbar
  stockton: 303,   // John Stockton
  malone:   1181,  // Karl Malone
  drexler:  432,   // Clyde Drexler
};

// Merge confirmed ESPN IDs from nbaHeadshotIds.ts with historical additions
const ALL_ESPN_IDS: Record<string, number> = {
  ...NBA_HEADSHOT_IDS,
  ...HISTORICAL_ESPN_IDS,
};

function lookupEspnId(playerId: string): number | undefined {
  if (ALL_ESPN_IDS[playerId]) return ALL_ESPN_IDS[playerId];
  // Strip _c suffix (e.g. "jokic_c" → "jokic")
  if (playerId.endsWith("_c")) {
    const base = playerId.slice(0, -2);
    return ALL_ESPN_IDS[base];
  }
  return undefined;
}

export default function PlayerHeadshot({
  playerId,
  teamColor,
  jersey,
  size = 80,
  className = "",
}: {
  playerId: string;
  teamColor: string;
  jersey: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const espnId = lookupEspnId(playerId);

  if (!espnId || failed) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-black text-white shadow-md shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: teamColor, fontSize: size * 0.3 }}
      >
        {jersey}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden shadow-md shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: teamColor }}
    >
      <img
        src={`https://a.espncdn.com/i/headshots/nba/players/full/${espnId}.png`}
        alt=""
        className="w-full h-full object-cover object-top"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
