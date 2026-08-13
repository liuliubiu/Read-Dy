import type { ReactElement } from 'react';
import type { AndroidTab } from './AndroidApp';

interface BottomNavProps {
  tab: AndroidTab;
  onSelect: (tab: AndroidTab) => void;
}

const ITEMS: { key: AndroidTab; label: string; icon: ReactElement }[] = [
  {
    key: 'mapping',
    label: '映射',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4 3 8l4 4" />
        <path d="M3 8h13" />
        <path d="m17 20 4-4-4-4" />
        <path d="M21 16H8" />
      </svg>
    ),
  },
  {
    key: 'staff',
    label: '五线谱',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: 'interval',
    label: '音程',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 17V5l9-1.5v11" />
        <circle cx="5" cy="17" r="2.6" />
        <circle cx="14" cy="14.5" r="2.6" />
        <path d="M14.5 5.5 17.5 5v6" opacity="0.5" />
        <circle cx="16" cy="12.5" r="1.6" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'stats',
    label: '统计',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 20v-7" />
        <path d="M12 20V5" />
        <path d="M19 20v-4" />
      </svg>
    ),
  },
];

export default function BottomNav({ tab, onSelect }: BottomNavProps) {
  return (
    <nav className="android-bottomnav">
      {ITEMS.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          className={`android-nav-item ${tab === key ? 'active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <span className="android-nav-icon">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
