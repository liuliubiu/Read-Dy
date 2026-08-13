import { accuracyOf, readBestStreak, readPracticeStats } from '../../quiz/statStore';
import type { PracticeCount } from '../../quiz/statStore';
import type { QuizMode } from '../../quiz/types';

const MODE_LABELS: Record<QuizMode, string> = {
  mapping: '映射',
  staff: '五线谱',
  interval: '音程',
};

function localDateKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function StatsPage() {
  const stats = readPracticeStats();
  const today: PracticeCount = stats.byDay[localDateKey()] ?? { total: 0, correct: 0 };
  const bestStreak = readBestStreak();
  const modes = (['mapping', 'staff', 'interval'] as const).map((m) => ({
    key: m,
    label: MODE_LABELS[m],
    count: stats.byMode[m],
  }));

  return (
    <div className="android-stats">
      <div className="android-stat-row">
        <div className="android-stat-card">
          <span className="android-stat-card-title">今日练习</span>
          <span className="android-stat-card-value">{today.total} 题</span>
          <span className="android-stat-card-sub">正确率 {accuracyOf(today)}%</span>
        </div>
        <div className="android-stat-card">
          <span className="android-stat-card-title">累计答题</span>
          <span className="android-stat-card-value">{stats.total} 题</span>
          <span className="android-stat-card-sub">正确率 {accuracyOf(stats)}%</span>
        </div>
      </div>

      <div className="android-stat-card">
        <span className="android-stat-card-title">最高连击</span>
        <span className="android-stat-card-value">🔥 {bestStreak}</span>
      </div>

      <div className="android-stat-card">
        <span className="android-stat-card-title">各模式练习量</span>
        {modes.map(({ key, label, count }) => (
          <div className="android-mode-stat" key={key}>
            <div className="android-mode-stat-head">
              <span className="android-mode-label">{label}</span>
              <span className="android-mode-nums">
                {count.total} 题 · {accuracyOf(count)}%
              </span>
            </div>
            <div className="android-progress">
              <div
                className="android-progress-fill"
                style={{ width: `${accuracyOf(count)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
