import { useState } from 'react';
import type {
  AnswerMode,
  AnswerState,
  IntervalSettings,
  MappingSettings,
  Question,
  QuizMode,
  QuizStats,
  StaffSettings,
} from '../../quiz/types';
import TopAppBar from './TopAppBar';
import BottomNav from './BottomNav';
import ModePage from './ModePage';
import StatsPage from './StatsPage';

export type AndroidTab = QuizMode | 'stats';

const TAB_TITLES: Record<AndroidTab, string> = {
  mapping: '映射',
  staff: '五线谱',
  interval: '音程',
  stats: '统计',
};

export interface AndroidAppProps {
  mode: QuizMode;
  onModeChange: (mode: QuizMode) => void;
  mappingSettings: MappingSettings;
  staffSettings: StaffSettings;
  intervalSettings: IntervalSettings;
  answerMode: AnswerMode;
  onMappingSettingsChange: (settings: MappingSettings) => void;
  onStaffSettingsChange: (settings: StaffSettings) => void;
  onIntervalSettingsChange: (settings: IntervalSettings) => void;
  onAnswerModeChange: (mode: AnswerMode) => void;
  question: Question;
  stats: QuizStats;
  answerState: AnswerState;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
  onAnswerValue: (value: string) => void;
  onSkipFeedback: () => void;
}

export default function AndroidApp({
  mode,
  onModeChange,
  ...pageProps
}: AndroidAppProps) {
  const [showStats, setShowStats] = useState(false);
  const tab: AndroidTab = showStats ? 'stats' : mode;

  const handleTabSelect = (next: AndroidTab) => {
    if (next === 'stats') {
      setShowStats(true);
      return;
    }
    setShowStats(false);
    onModeChange(next);
  };

  return (
    <div className="app app-android">
      <TopAppBar title={TAB_TITLES[tab]} stats={pageProps.stats} />
      <main className="android-content">
        {showStats ? <StatsPage /> : <ModePage mode={mode} {...pageProps} />}
      </main>
      <BottomNav tab={tab} onSelect={handleTabSelect} />
    </div>
  );
}
