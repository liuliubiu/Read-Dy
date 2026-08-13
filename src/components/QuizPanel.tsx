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
      <div className="quiz-toolbar">
        {mode === 'mapping' && (
          <div className="segmented" role="group" aria-label="映射类型">
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
                className={`segmented-btn ${mappingSettings.kind === value ? 'active' : ''}`}
                onClick={() => setMappingKind(value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {mode === 'staff' && (
          <>
            <div className="segmented" role="group" aria-label="谱号">
              {(['treble', 'bass', 'mixed'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-btn ${staffSettings.clef === value ? 'active' : ''}`}
                  onClick={() => setClef(value)}
                >
                  {value === 'treble' ? '高音' : value === 'bass' ? '低音' : '混合'}
                </button>
              ))}
            </div>
            <div className="segmented" role="group" aria-label="作答方式">
              {(['letter', 'solfege', 'mixed'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-btn ${staffSettings.answerType === value ? 'active' : ''}`}
                  onClick={() => setAnswerType(value)}
                >
                  {value === 'letter' ? '音名' : value === 'solfege' ? '唱名' : '混合'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="question-card">
        <StatsBar stats={stats} />
        <div className="question-stage">
          {question.type === 'mapping' ? (
            <MappingQuestionView question={question} />
          ) : (
            <StaffQuestionView question={question} />
          )}
        </div>
      </div>

      <OptionButtons
        options={question.options}
        correctIndex={question.correctIndex}
        answerState={answerState}
        selectedIndex={selectedIndex}
        onAnswer={onAnswer}
        onSkipFeedback={onSkipFeedback}
      />

      <p className="keyboard-hint">1–4 选择 · 空格下一题 · Esc 隐藏</p>
    </div>
  );
}
