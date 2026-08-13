import { useEffect } from 'react';
import { directKeyToValue, getDirectKeyHint } from '../quiz/directAnswer';
import type { AnswerState, Question } from '../quiz/types';

interface DirectAnswerProps {
  question: Question;
  answerState: AnswerState;
  selectedIndex: number | null;
  compact?: boolean;
  onAnswerValue: (value: string) => void;
  onSkipFeedback: () => void;
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
        <span className="direct-hint">{getDirectKeyHint(question)}</span>
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
