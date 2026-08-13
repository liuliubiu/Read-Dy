import { useEffect } from 'react';
import { directKeyToValue, getDirectKeyHint, getDirectKeymap } from '../quiz/directAnswer';
import { IS_ANDROID } from '../platform';
import { SOLFEGE } from '../music/notes';
import type { AnswerState, Question } from '../quiz/types';

interface DirectAnswerProps {
  question: Question;
  answerState: AnswerState;
  selectedIndex: number | null;
  compact?: boolean;
  onAnswerValue: (value: string) => void;
  onSkipFeedback: () => void;
}

const LETTER_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

/** 移动端触屏虚拟键盘：音名键 C–G 或数字键 1–7（下标注唱名）。 */
function DirectKeypad({
  question,
  onAnswerValue,
}: {
  question: Question;
  onAnswerValue: (value: string) => void;
}) {
  const letters = getDirectKeymap(question) === 'letters';
  const keys: readonly string[] = letters ? LETTER_KEYS : DIGIT_KEYS;

  return (
    <div className="direct-keypad">
      {keys.map((key, index) => {
        const value = directKeyToValue(key, question);
        return (
          <button
            key={key}
            type="button"
            className="direct-key"
            onClick={() => {
              if (value !== null) {
                onAnswerValue(value);
              }
            }}
          >
            <span className="direct-key-main">{key}</span>
            {!letters && <span className="direct-key-sub">{SOLFEGE[index]}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function DirectAnswer({
  question,
  answerState,
  selectedIndex,
  compact = false,
  onAnswerValue,
  onSkipFeedback,
}: DirectAnswerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        onSkipFeedback();
        return;
      }

      const value = directKeyToValue(event.key, question);
      if (value !== null) {
        onAnswerValue(value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, onAnswerValue, onSkipFeedback]);

  const correct = question.options[question.correctIndex];
  const answeredValue =
    answerState === 'answered' && selectedIndex !== null ? question.options[selectedIndex] : null;

  return (
    <div className={`direct-answer ${compact ? 'direct-answer-compact' : ''}`}>
      {answerState === 'idle' ? (
        IS_ANDROID ? (
          <DirectKeypad question={question} onAnswerValue={onAnswerValue} />
        ) : (
          <span className="direct-hint">{getDirectKeyHint(question)}</span>
        )
      ) : (
        <span className="direct-result">
          <span className="direct-result-correct">✓ {correct}</span>
          {answeredValue !== null && answeredValue !== correct && (
            <span className="direct-result-wrong">✗ {answeredValue}</span>
          )}
        </span>
      )}
    </div>
  );
}
