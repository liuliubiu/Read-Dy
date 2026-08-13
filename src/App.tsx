import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import WindowBar from './components/WindowBar';
import QuizPanel from './components/QuizPanel';
import MiniWidget from './components/MiniWidget';
import { useQuiz } from './hooks/useQuiz';
import type {
  AnswerMode,
  ClefSetting,
  IntervalDirection,
  IntervalSettings,
  MappingKind,
  MappingSettings,
  QuizMode,
  StaffAnswerSetting,
  StaffSettings,
} from './quiz/types';
import { DEFAULT_INTERVAL_SETTINGS, DEFAULT_MAPPING_SETTINGS, DEFAULT_STAFF_SETTINGS } from './quiz/types';
import './App.css';

const NORMAL_SIZE = { width: 300, height: 430 };
const MINI_SIZE = { width: 288, height: 136 };
const EXPANDED_STORAGE_KEY = 'quick-ms-expanded';
const MODE_STORAGE_KEY = 'quick-ms-mode';
const MAPPING_KIND_KEY = 'quick-ms-mapping-kind';
const STAFF_CLEF_KEY = 'quick-ms-staff-clef';
const STAFF_ANSWER_KEY = 'quick-ms-staff-answer';
const INTERVAL_CLEF_KEY = 'quick-ms-interval-clef';
const INTERVAL_DIRECTION_KEY = 'quick-ms-interval-direction';
const ANSWER_MODE_KEY = 'quick-ms-answer-mode';

function readExpandedPreference(): boolean {
  try {
    return localStorage.getItem(EXPANDED_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function persistExpandedPreference(expanded: boolean) {
  try {
    localStorage.setItem(EXPANDED_STORAGE_KEY, String(expanded));
  } catch {
    // ignore
  }
}

function readModePreference(): QuizMode {
  try {
    const value = localStorage.getItem(MODE_STORAGE_KEY);
    return value === 'staff' || value === 'interval' ? value : 'mapping';
  } catch {
    return 'mapping';
  }
}

function persistModePreference(mode: QuizMode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

function readMappingSettings(): MappingSettings {
  try {
    const kind = localStorage.getItem(MAPPING_KIND_KEY) as MappingKind | null;
    const valid: MappingKind[] = ['letterSolfege', 'letterNumber', 'solfegeNumber', 'mixed'];
    return {
      kind: kind && valid.includes(kind) ? kind : DEFAULT_MAPPING_SETTINGS.kind,
    };
  } catch {
    return DEFAULT_MAPPING_SETTINGS;
  }
}

function persistMappingSettings(settings: MappingSettings) {
  try {
    localStorage.setItem(MAPPING_KIND_KEY, settings.kind);
  } catch {
    // ignore
  }
}

function readStaffSettings(): StaffSettings {
  try {
    const clef = localStorage.getItem(STAFF_CLEF_KEY) as ClefSetting | null;
    const answerType = localStorage.getItem(STAFF_ANSWER_KEY) as StaffAnswerSetting | null;
    return {
      clef: clef === 'treble' || clef === 'bass' || clef === 'mixed' ? clef : DEFAULT_STAFF_SETTINGS.clef,
      answerType:
        answerType === 'letter' || answerType === 'solfege' || answerType === 'mixed'
          ? answerType
          : DEFAULT_STAFF_SETTINGS.answerType,
    };
  } catch {
    return DEFAULT_STAFF_SETTINGS;
  }
}

function persistStaffSettings(settings: StaffSettings) {
  try {
    localStorage.setItem(STAFF_CLEF_KEY, settings.clef);
    localStorage.setItem(STAFF_ANSWER_KEY, settings.answerType);
  } catch {
    // ignore
  }
}

function readIntervalSettings(): IntervalSettings {
  try {
    const clef = localStorage.getItem(INTERVAL_CLEF_KEY) as ClefSetting | null;
    const direction = localStorage.getItem(INTERVAL_DIRECTION_KEY) as IntervalDirection | null;
    return {
      clef: clef === 'treble' || clef === 'bass' || clef === 'mixed' ? clef : DEFAULT_INTERVAL_SETTINGS.clef,
      direction:
        direction === 'up' || direction === 'down' || direction === 'mixed'
          ? direction
          : DEFAULT_INTERVAL_SETTINGS.direction,
    };
  } catch {
    return DEFAULT_INTERVAL_SETTINGS;
  }
}

function persistIntervalSettings(settings: IntervalSettings) {
  try {
    localStorage.setItem(INTERVAL_CLEF_KEY, settings.clef);
    localStorage.setItem(INTERVAL_DIRECTION_KEY, settings.direction);
  } catch {
    // ignore
  }
}

function readAnswerMode(): AnswerMode {
  try {
    return localStorage.getItem(ANSWER_MODE_KEY) === 'direct' ? 'direct' : 'options';
  } catch {
    return 'options';
  }
}

function persistAnswerMode(mode: AnswerMode) {
  try {
    localStorage.setItem(ANSWER_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function App() {
  const [isExpanded, setIsExpanded] = useState(readExpandedPreference);
  const [isPinned, setIsPinned] = useState(false);
  const [mode, setMode] = useState<QuizMode>(readModePreference);
  const [mappingSettings, setMappingSettings] = useState<MappingSettings>(readMappingSettings);
  const [staffSettings, setStaffSettings] = useState<StaffSettings>(readStaffSettings);
  const [intervalSettings, setIntervalSettings] = useState<IntervalSettings>(readIntervalSettings);
  const [answerMode, setAnswerMode] = useState<AnswerMode>(readAnswerMode);
  const isFirstResize = useRef(true);

  const { question, stats, answerState, selectedIndex, answer, answerValue, skipFeedback } = useQuiz({
    mode,
    mappingSettings,
    staffSettings,
    intervalSettings,
  });

  useEffect(() => {
    persistModePreference(mode);
  }, [mode]);

  useEffect(() => {
    persistMappingSettings(mappingSettings);
  }, [mappingSettings]);

  useEffect(() => {
    persistStaffSettings(staffSettings);
  }, [staffSettings]);

  useEffect(() => {
    persistIntervalSettings(intervalSettings);
  }, [intervalSettings]);

  useEffect(() => {
    persistAnswerMode(answerMode);
  }, [answerMode]);

  useEffect(() => {
    persistExpandedPreference(isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    async function applySize() {
      const size = isExpanded ? NORMAL_SIZE : MINI_SIZE;
      await invoke('resize_window', { width: size.width, height: size.height });
      isFirstResize.current = false;
    }

    applySize().catch(() => {});
  }, [isExpanded]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((value) => {
      const next = !value;
      persistExpandedPreference(next);
      return next;
    });
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => {
      invoke('toggle_always_on_top').catch(() => {});
      return !prev;
    });
  }, []);

  const hideWindow = useCallback(() => {
    persistExpandedPreference(isExpanded);
    invoke('hide_window').catch(() => {});
  }, [isExpanded]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      event.preventDefault();
      hideWindow();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hideWindow]);

  const handleModeChange = useCallback((nextMode: QuizMode) => {
    setMode(nextMode);
  }, []);

  const handleStaffSettingsChange = useCallback((nextSettings: StaffSettings) => {
    setStaffSettings(nextSettings);
  }, []);

  const handleMappingSettingsChange = useCallback((nextSettings: MappingSettings) => {
    setMappingSettings(nextSettings);
  }, []);

  const handleIntervalSettingsChange = useCallback((nextSettings: IntervalSettings) => {
    setIntervalSettings(nextSettings);
  }, []);

  const handleAnswerModeChange = useCallback((nextMode: AnswerMode) => {
    setAnswerMode(nextMode);
  }, []);

  return (
    <div className={`app ${isExpanded ? 'app-normal' : 'app-mini'}`}>
      {isExpanded ? (
        <>
          <WindowBar
            isExpanded={isExpanded}
            isPinned={isPinned}
            mode={mode}
            onModeChange={handleModeChange}
            onToggleExpand={toggleExpand}
            onTogglePin={togglePin}
            onHide={hideWindow}
          />
          <QuizPanel
            mode={mode}
            mappingSettings={mappingSettings}
            staffSettings={staffSettings}
            intervalSettings={intervalSettings}
            answerMode={answerMode}
            onMappingSettingsChange={handleMappingSettingsChange}
            onStaffSettingsChange={handleStaffSettingsChange}
            onIntervalSettingsChange={handleIntervalSettingsChange}
            onAnswerModeChange={handleAnswerModeChange}
            question={question}
            stats={stats}
            answerState={answerState}
            selectedIndex={selectedIndex}
            onAnswer={answer}
            onAnswerValue={answerValue}
            onSkipFeedback={skipFeedback}
          />
        </>
      ) : (
        <MiniWidget
          question={question}
          stats={stats}
          answerState={answerState}
          selectedIndex={selectedIndex}
          answerMode={answerMode}
          isPinned={isPinned}
          onAnswer={answer}
          onAnswerValue={answerValue}
          onSkipFeedback={skipFeedback}
          onToggleExpand={toggleExpand}
          onTogglePin={togglePin}
          onHide={hideWindow}
        />
      )}
    </div>
  );
}

export default App;
