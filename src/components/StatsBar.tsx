import type { QuizStats } from '../quiz/types';

interface StatsBarProps {
  stats: QuizStats;
  compact?: boolean;
}

export default function StatsBar({ stats, compact = false }: StatsBarProps) {
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  return (
    <div className={`stats-bar ${compact ? 'stats-bar-compact' : ''}`}>
      <span>{stats.correct}/{stats.total}</span>
      <span>{accuracy}%</span>
      <span>连 {stats.streak}</span>
      {!compact && <span>最佳 {stats.bestStreak}</span>}
    </div>
  );
}
