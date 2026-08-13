import type { QuizStats } from '../quiz/types';

interface StatsBarProps {
  stats: QuizStats;
  compact?: boolean;
}

export default function StatsBar({ stats, compact = false }: StatsBarProps) {
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  return (
    <div className={`stats-bar ${compact ? 'stats-bar-compact' : ''}`}>
      <span className="stat-item">
        <span className="stat-value">{stats.correct}</span>
        <span className="stat-muted">/{stats.total}</span>
      </span>
      <span className="stat-item">{accuracy}%</span>
      <span className="stat-item">连 {stats.streak}</span>
      {!compact && <span className="stat-item">最佳 {stats.bestStreak}</span>}
    </div>
  );
}
