"use client";

import { useState } from "react";
import { NBA_HEADSHOT_IDS } from "@/lib/nbaHeadshotIds";

// Historical/retired players → NBA.com player IDs
// URL: https://cdn.nba.com/headshots/nba/latest/260x190/{id}.png
// (same CDN the Guess Who game uses successfully for current players)
const HISTORICAL_NBACOM_IDS: Record<string, number> = {
  jordan:   893,    // Michael Jordan
  kobe:     977,    // Kobe Bryant
  magic:    1726,   // Magic Johnson
  bird:     1449,   // Larry Bird
  shaq:     406,    // Shaquille O'Neal
  kareem:   76003,  // Kareem Abdul-Jabbar
  wilt:     76375,  // Wilt Chamberlain
  russell:  76384,  // Bill Russell
  timD:     1495,   // Tim Duncan
  dirk:     1717,   // Dirk Nowitzki
  kg:       708,    // Kevin Garnett
  dwyane:   2548,   // Dwyane Wade
  cp3:      101108, // Chris Paul
  hakeem:   165,    // Hakeem Olajuwon
  ewing:    761,    // Patrick Ewing
  iverson:  947,    // Allen Iverson
  pippen:   1008,   // Scottie Pippen
  isiah:    802,    // Isiah Thomas
  barkley:  787,    // Charles Barkley
  drexler:  432,    // Clyde Drexler
  stockton: 303,    // John Stockton
  malone:   1181,   // Karl Malone
  vince:    1713,   // Vince Carter
  tmac:     1892,   // Tracy McGrady
};

type Source = { id: number; cdn: "espn" | "nba" };

function lookup(playerId: string): Source | null {
  // ESPN CDN — confirmed working IDs from nbaHeadshotIds.ts
  const espnId = NBA_HEADSHOT_IDS[playerId];
  if (espnId) return { id: espnId, cdn: "espn" };

  // Strip _c suffix (e.g. "jokic_c" → "jokic") for current-era players
  if (playerId.endsWith("_c")) {
    const base = playerId.slice(0, -2);
    const baseId = NBA_HEADSHOT_IDS[base];
    if (baseId) return { id: baseId, cdn: "espn" };
  }

  // NBA.com CDN — for retired legends
  const nbaId = HISTORICAL_NBACOM_IDS[playerId];
  if (nbaId) return { id: nbaId, cdn: "nba" };

  return null;
}

function imgUrl(src: Source): string {
  return src.cdn === "espn"
    ? `https://a.espncdn.com/i/headshots/nba/players/full/${src.id}.png`
    : `https://cdn.nba.com/headshots/nba/latest/260x190/${src.id}.png`;
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
  const src = lookup(playerId);

  if (!src || failed) {
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
        src={imgUrl(src)}
        alt=""
        className="w-full h-full object-cover object-top"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
