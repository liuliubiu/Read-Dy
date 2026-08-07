import { useEffect } from 'react';
import type { AnswerState } from '../quiz/types';

interface OptionButtonsProps {
  options: string[];
  correctIndex: number;
  answerState: AnswerState;
  selectedIndex: number | null;
  compact?: boolean;
  onAnswer: (index: number) => void;
  onSkipFeedback: () => void;
}

export default function OptionButtons({
  options,
  correctIndex,
  answerState,
  selectedIndex,
  compact = false,
  onAnswer,
  onSkipFeedback,
}: OptionButtonsProps) {
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

      const keyIndex = Number.parseInt(event.key, 10) - 1;
      if (keyIndex >= 0 && keyIndex < options.length) {
        onAnswer(keyIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAnswer, onSkipFeedback, options.length]);

  return (
    <div className={`option-grid ${compact ? 'option-grid-compact' : ''}`}>
      {options.map((option, index) => {
        let stateClass = '';
        if (answerState === 'answered') {
          if (index === correctIndex) {
            stateClass = 'option-correct';
          } else if (index === selectedIndex) {
            stateClass = 'option-wrong';
          }
        }

        return (
          <button
            key={`${option}-${index}`}
            type="button"
            className={`option-btn ${stateClass}`}
            onClick={() => onAnswer(index)}
            disabled={answerState === 'answered'}
          >
            <span className="option-key">{index + 1}</span>
            <span className="option-label">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
