import type {
  AnswerMode,
  ClefSetting,
  IntervalDirection,
  IntervalSettings,
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
import IntervalQuestionView from './IntervalQuestion';
import OptionButtons from './OptionButtons';
import DirectAnswer from './DirectAnswer';
import StatsBar from './StatsBar';

interface QuizPanelProps {
  mode: QuizMode;
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

export default function QuizPanel({
  mode,
  mappingSettings,
  staffSettings,
  intervalSettings,
  answerMode,
  onMappingSettingsChange,
  onStaffSettingsChange,
  onIntervalSettingsChange,
  onAnswerModeChange,
  question,
  stats,
  answerState,
  selectedIndex,
  onAnswer,
  onAnswerValue,
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

  const setIntervalClef = (clef: ClefSetting) => {
    onIntervalSettingsChange({ ...intervalSettings, clef });
  };

  const setIntervalDirection = (direction: IntervalDirection) => {
    onIntervalSettingsChange({ ...intervalSettings, direction });
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
            <div className="segmented" role="group" aria-label="答案类型">
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

        {mode === 'interval' && (
          <>
            <div className="segmented" role="group" aria-label="谱号">
              {(['treble', 'bass', 'mixed'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-btn ${intervalSettings.clef === value ? 'active' : ''}`}
                  onClick={() => setIntervalClef(value)}
                >
                  {value === 'treble' ? '高音' : value === 'bass' ? '低音' : '混合'}
                </button>
              ))}
            </div>
            <div className="segmented" role="group" aria-label="音程方向">
              {(['up', 'down', 'mixed'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-btn ${intervalSettings.direction === value ? 'active' : ''}`}
                  onClick={() => setIntervalDirection(value)}
                >
                  {value === 'up' ? '上行' : value === 'down' ? '下行' : '混合'}
                </button>
              ))}
            </div>
          </>
        )}

        {(mode === 'mapping' || mode === 'staff') && (
          <div className="segmented" role="group" aria-label="作答方式">
            {(['options', 'direct'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`segmented-btn ${answerMode === value ? 'active' : ''}`}
                onClick={() => onAnswerModeChange(value)}
              >
                {value === 'options' ? '选项' : '直答'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="question-card">
        <StatsBar stats={stats} />
        <div className="question-stage">
          {question.type === 'mapping' ? (
            <MappingQuestionView question={question} />
          ) : question.type === 'interval' ? (
            <IntervalQuestionView question={question} />
          ) : (
            <StaffQuestionView question={question} />
          )}
        </div>
      </div>

      {answerMode === 'direct' && question.type !== 'interval' ? (
        <DirectAnswer
          question={question}
          answerState={answerState}
          selectedIndex={selectedIndex}
          onAnswerValue={onAnswerValue}
          onSkipFeedback={onSkipFeedback}
        />
      ) : (
        <OptionButtons
          options={question.options}
          correctIndex={question.correctIndex}
          answerState={answerState}
          selectedIndex={selectedIndex}
          onAnswer={onAnswer}
          onSkipFeedback={onSkipFeedback}
        />
      )}

      <p className="keyboard-hint">
        {answerMode === 'direct' && question.type !== 'interval'
          ? '空格下一题 · Esc 隐藏'
          : '1–4 选择 · 空格下一题 · Esc 隐藏'}
      </p>
    </div>
  );
}
