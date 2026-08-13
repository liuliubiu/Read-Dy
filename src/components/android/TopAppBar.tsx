import type { QuizStats } from '../../quiz/types';

interface TopAppBarProps {
  title: string;
  stats: QuizStats;
}

export default function TopAppBar({ title, stats }: TopAppBarProps) {
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  return (
    <header className="android-appbar">
      <span className="android-appbar-title">{title}</span>
      <span className="android-appbar-stats">
        <span className="android-appbar-stat">🔥 {stats.streak}</span>
        <span className="android-appbar-stat">{accuracy}%</span>
      </span>
    </header>
  );
}
