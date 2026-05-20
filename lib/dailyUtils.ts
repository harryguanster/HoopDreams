export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDailyIndex(poolSize: number, salt = 0): number {
  const dayNum = Math.floor(Date.now() / 86400000);
  return (dayNum + salt) % poolSize;
}

const DAILY_KEY = "courtside_daily_v1";
const STREAK_KEY = "courtside_streak_v1";

export type DailyData = {
  date: string;
  guessWhoWon: boolean | null;
  statLineWon: boolean | null;
};

export type StreakData = {
  count: number;
  lastDate: string;
};

function emptyDaily(): DailyData {
  return { date: getTodayStr(), guessWhoWon: null, statLineWon: null };
}

export function loadDailyData(): DailyData {
  if (typeof window === "undefined") return emptyDaily();
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return emptyDaily();
    const data: DailyData = JSON.parse(raw);
    if (data.date !== getTodayStr()) return emptyDaily();
    return data;
  } catch {
    return emptyDaily();
  }
}

export function saveDailyData(data: DailyData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("daily-update"));
}

export function loadStreak(): StreakData {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: "" };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: "" };
  }
}

export function updateStreak(): StreakData {
  const today = getTodayStr();
  const streak = loadStreak();

  if (streak.lastDate === today) return streak;

  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  const yesterday = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, "0")}-${String(yDate.getDate()).padStart(2, "0")}`;

  const newStreak: StreakData =
    streak.lastDate === yesterday
      ? { count: streak.count + 1, lastDate: today }
      : { count: 1, lastDate: today };

  localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
  window.dispatchEvent(new Event("daily-update"));
  return newStreak;
}
