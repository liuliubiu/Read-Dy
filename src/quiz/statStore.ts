import type { QuizMode } from './types';

const STATS_KEY = 'quick-ms-practice-stats';
// 与 useQuiz.ts 中的 BEST_STREAK_KEY 保持一致（最高连击仍由 useQuiz 维护）。
const BEST_STREAK_KEY = 'quick-ms-best-streak';

export interface PracticeCount {
  total: number;
  correct: number;
}

export interface PracticeStats {
  total: number;
  correct: number;
  byMode: Record<QuizMode, PracticeCount>;
  byDay: Record<string, PracticeCount>;
}

function emptyCount(): PracticeCount {
  return { total: 0, correct: 0 };
}

function emptyStats(): PracticeStats {
  return {
    total: 0,
    correct: 0,
    byMode: {
      mapping: emptyCount(),
      staff: emptyCount(),
      interval: emptyCount(),
    },
    byDay: {},
  };
}

function withDefaults(parsed: Partial<PracticeStats> | null): PracticeStats {
  const base = emptyStats();
  if (!parsed) {
    return base;
  }
  return {
    total: parsed.total ?? 0,
    correct: parsed.correct ?? 0,
    byMode: {
      mapping: parsed.byMode?.mapping ?? emptyCount(),
      staff: parsed.byMode?.staff ?? emptyCount(),
      interval: parsed.byMode?.interval ?? emptyCount(),
    },
    byDay: parsed.byDay ?? {},
  };
}

export function readPracticeStats(): PracticeStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return withDefaults(raw ? (JSON.parse(raw) as Partial<PracticeStats>) : null);
  } catch {
    return emptyStats();
  }
}

function localDateKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** 每次作答后记录一次练习数据（按模式 + 按天），供统计页使用。 */
export function recordAnswer(mode: QuizMode, isCorrect: boolean) {
  try {
    const stats = readPracticeStats();
    stats.total += 1;
    if (isCorrect) {
      stats.correct += 1;
    }
    stats.byMode[mode].total += 1;
    if (isCorrect) {
      stats.byMode[mode].correct += 1;
    }
    const dayKey = localDateKey();
    const day = stats.byDay[dayKey] ?? (stats.byDay[dayKey] = emptyCount());
    day.total += 1;
    if (isCorrect) {
      day.correct += 1;
    }
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function readBestStreak(): number {
  try {
    const value = localStorage.getItem(BEST_STREAK_KEY);
    return value ? Number.parseInt(value, 10) : 0;
  } catch {
    return 0;
  }
}

export function accuracyOf(count: PracticeCount): number {
  return count.total === 0 ? 0 : Math.round((count.correct / count.total) * 100);
}
