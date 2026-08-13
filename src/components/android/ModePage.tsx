import type {
  AnswerMode,
  AnswerState,
  IntervalSettings,
  MappingSettings,
  Question,
  QuizMode,
  StaffSettings,
} from '../../quiz/types';
import MappingQuestionView from '../MappingQuestion';
import StaffQuestionView from '../StaffQuestion';
import IntervalQuestionView from '../IntervalQuestion';
import OptionButtons from '../OptionButtons';
import DirectAnswer from '../DirectAnswer';

interface ModePageProps {
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
  answerState: AnswerState;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
  onAnswerValue: (value: string) => void;
  onSkipFeedback: () => void;
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`android-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function ModePage({
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
  answerState,
  selectedIndex,
  onAnswer,
  onAnswerValue,
  onSkipFeedback,
}: ModePageProps) {
  return (
    <div className="android-page">
      <div className="android-settings">
        {mode === 'mapping' && (
          <div className="android-chips-row" role="group" aria-label="映射类型">
            {(
              [
                ['letterSolfege', '音↔唱'],
                ['letterNumber', '音↔数'],
                ['solfegeNumber', '唱↔数'],
                ['mixed', '混合'],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                active={mappingSettings.kind === value}
                onClick={() => onMappingSettingsChange({ ...mappingSettings, kind: value })}
              />
            ))}
          </div>
        )}

        {mode === 'staff' && (
          <>
            <div className="android-chips-row" role="group" aria-label="谱号">
              {(['treble', 'bass', 'mixed'] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === 'treble' ? '高音谱' : value === 'bass' ? '低音谱' : '混合'}
                  active={staffSettings.clef === value}
                  onClick={() => onStaffSettingsChange({ ...staffSettings, clef: value })}
                />
              ))}
            </div>
            <div className="android-chips-row" role="group" aria-label="答案类型">
              {(['letter', 'solfege', 'mixed'] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === 'letter' ? '音名' : value === 'solfege' ? '唱名' : '混合'}
                  active={staffSettings.answerType === value}
                  onClick={() => onStaffSettingsChange({ ...staffSettings, answerType: value })}
                />
              ))}
            </div>
          </>
        )}

        {mode === 'interval' && (
          <>
            <div className="android-chips-row" role="group" aria-label="谱号">
              {(['treble', 'bass', 'mixed'] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === 'treble' ? '高音谱' : value === 'bass' ? '低音谱' : '混合'}
                  active={intervalSettings.clef === value}
                  onClick={() => onIntervalSettingsChange({ ...intervalSettings, clef: value })}
                />
              ))}
            </div>
            <div className="android-chips-row" role="group" aria-label="音程方向">
              {(['up', 'down', 'mixed'] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === 'up' ? '上行' : value === 'down' ? '下行' : '混合'}
                  active={intervalSettings.direction === value}
                  onClick={() => onIntervalSettingsChange({ ...intervalSettings, direction: value })}
                />
              ))}
            </div>
          </>
        )}

        {(mode === 'mapping' || mode === 'staff') && (
          <div className="android-chips-row" role="group" aria-label="作答方式">
            {(['options', 'direct'] as const).map((value) => (
              <Chip
                key={value}
                label={value === 'options' ? '选项作答' : '键盘直答'}
                active={answerMode === value}
                onClick={() => onAnswerModeChange(value)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="question-card">
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
    </div>
  );
}
