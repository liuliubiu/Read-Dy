import type {
  ClefSetting,
  MappingKind,
  MappingSettings,
  Question,
  QuizMode,
  QuizStats,
  AnswerState,
  StaffAnswerSetting,
  StaffSettings,
} from '../quiz/types';
import MappingQuestionView from './MappingQuestion';
import StaffQuestionView from './StaffQuestion';
import OptionButtons from './OptionButtons';
import StatsBar from './StatsBar';

interface QuizPanelProps {
  mode: QuizMode;
  mappingSettings: MappingSettings;
  staffSettings: StaffSettings;
  onModeChange: (mode: QuizMode) => void;
  onMappingSettingsChange: (settings: MappingSettings) => void;
  onStaffSettingsChange: (settings: StaffSettings) => void;
  question: Question;
  stats: QuizStats;
  answerState: AnswerState;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
  onSkipFeedback: () => void;
}

export default function QuizPanel({
  mode,
  mappingSettings,
  staffSettings,
  onModeChange,
  onMappingSettingsChange,
  onStaffSettingsChange,
  question,
  stats,
  answerState,
  selectedIndex,
  onAnswer,
  onSkipFeedback,
}: QuizPanelProps) {
  const setMappingKind = (kind: MappingKind) => {
    onMappingSettingsChange({ ...mappingSettings, kind });
  };

  const setClef = (clef: ClefSetting) => {
    onStaffSettingsChange({ ...staffSettings, clef });
  };

  const setAnswerType = (answerType: StaffAnswerSetting) => {
    onStaffSettingsChange({ ...staffSettings, answerType });
  };

  return (
    <div className="quiz-panel">
      <div className="mode-tabs">
        <button
          type="button"
          className={`mode-tab ${mode === 'mapping' ? 'active' : ''}`}
          onClick={() => onModeChange('mapping')}
        >
          映射
        </button>
        <button
          type="button"
          className={`mode-tab ${mode === 'staff' ? 'active' : ''}`}
          onClick={() => onModeChange('staff')}
        >
          五线谱
        </button>
      </div>

      {mode === 'mapping' && (
        <div className="staff-settings">
          <div className="staff-setting-row mapping-setting-row">
            <span className="staff-setting-label">类型</span>
            {(
              [
                ['letterSolfege', '音↔唱'],
                ['letterNumber', '音↔数'],
                ['solfegeNumber', '唱↔数'],
                ['mixed', '混合'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`staff-setting-btn ${mappingSettings.kind === value ? 'active' : ''}`}
                onClick={() => setMappingKind(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'staff' && (
        <div className="staff-settings">
          <div className="staff-setting-row">
            <span className="staff-setting-label">谱号</span>
            {(['treble', 'bass', 'mixed'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`staff-setting-btn ${staffSettings.clef === value ? 'active' : ''}`}
                onClick={() => setClef(value)}
              >
                {value === 'treble' ? '高音' : value === 'bass' ? '低音' : '混合'}
              </button>
            ))}
          </div>
          <div className="staff-setting-row">
            <span className="staff-setting-label">选项</span>
            {(['letter', 'solfege', 'mixed'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`staff-setting-btn ${staffSettings.answerType === value ? 'active' : ''}`}
                onClick={() => setAnswerType(value)}
              >
                {value === 'letter' ? '音名' : value === 'solfege' ? '唱名' : '混合'}
              </button>
            ))}
          </div>
        </div>
      )}

      <StatsBar stats={stats} />

      <div className="question-area">
        {question.type === 'mapping' ? (
          <MappingQuestionView question={question} />
        ) : (
          <StaffQuestionView question={question} />
        )}
      </div>

      <OptionButtons
        options={question.options}
        correctIndex={question.correctIndex}
        answerState={answerState}
        selectedIndex={selectedIndex}
        onAnswer={onAnswer}
        onSkipFeedback={onSkipFeedback}
      />

      <p className="keyboard-hint">1-4 选择 · 空格下一题 · Esc 老板键</p>
    </div>
  );
}
