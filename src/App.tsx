import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import WindowBar from './components/WindowBar';
import QuizPanel from './components/QuizPanel';
import MiniWidget from './components/MiniWidget';
import { useQuiz } from './hooks/useQuiz';
import type { ClefSetting, MappingKind, MappingSettings, QuizMode, StaffAnswerSetting, StaffSettings } from './quiz/types';
import { DEFAULT_MAPPING_SETTINGS, DEFAULT_STAFF_SETTINGS } from './quiz/types';
import './App.css';

const NORMAL_SIZE = { width: 300, height: 430 };
const MINI_SIZE_MAPPING = { width: 220, height: 200 };
const MINI_SIZE_STAFF = { width: 220, height: 218 };
const EXPANDED_STORAGE_KEY = 'quick-ms-expanded';
const MODE_STORAGE_KEY = 'quick-ms-mode';
const MAPPING_KIND_KEY = 'quick-ms-mapping-kind';
const STAFF_CLEF_KEY = 'quick-ms-staff-clef';
const STAFF_ANSWER_KEY = 'quick-ms-staff-answer';

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
    return localStorage.getItem(MODE_STORAGE_KEY) === 'staff' ? 'staff' : 'mapping';
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

function App() {
  const [isExpanded, setIsExpanded] = useState(readExpandedPreference);
  const [isPinned, setIsPinned] = useState(false);
  const [mode, setMode] = useState<QuizMode>(readModePreference);
  const [mappingSettings, setMappingSettings] = useState<MappingSettings>(readMappingSettings);
  const [staffSettings, setStaffSettings] = useState<StaffSettings>(readStaffSettings);
  const isFirstResize = useRef(true);

  const { question, stats, answerState, selectedIndex, answer, skipFeedback } = useQuiz({
    mode,
    mappingSettings,
    staffSettings,
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
    persistExpandedPreference(isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    async function applySize() {
      const size = isExpanded
        ? NORMAL_SIZE
        : mode === 'staff'
          ? MINI_SIZE_STAFF
          : MINI_SIZE_MAPPING;
      await invoke('resize_window', { width: size.width, height: size.height });
      isFirstResize.current = false;
    }

    applySize().catch(() => {});
  }, [isExpanded, mode]);

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

  return (
    <div className={`app ${isExpanded ? 'app-normal' : 'app-mini'}`}>
      {isExpanded ? (
        <>
          <WindowBar
            isExpanded={isExpanded}
            isPinned={isPinned}
            onToggleExpand={toggleExpand}
            onTogglePin={togglePin}
            onHide={hideWindow}
          />
          <QuizPanel
            mode={mode}
            mappingSettings={mappingSettings}
            staffSettings={staffSettings}
            onModeChange={handleModeChange}
            onMappingSettingsChange={handleMappingSettingsChange}
            onStaffSettingsChange={handleStaffSettingsChange}
            question={question}
            stats={stats}
            answerState={answerState}
            selectedIndex={selectedIndex}
            onAnswer={answer}
            onSkipFeedback={skipFeedback}
          />
        </>
      ) : (
        <MiniWidget
          question={question}
          stats={stats}
          answerState={answerState}
          selectedIndex={selectedIndex}
          isPinned={isPinned}
          onAnswer={answer}
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
