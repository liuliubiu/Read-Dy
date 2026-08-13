import type { IntervalQuestion } from '../quiz/types';
import StaffNotation from './StaffNotation';

interface IntervalQuestionViewProps {
  question: IntervalQuestion;
  compact?: boolean;
}

export default function IntervalQuestionView({ question, compact = false }: IntervalQuestionViewProps) {
  return (
    <div className={`question-interval ${compact ? 'question-interval-compact' : ''}`}>
      <div className="question-interval-staff">
        <StaffNotation
          pitch={question.first}
          secondPitch={question.second}
          clef={question.clef}
          compact={compact}
        />
      </div>
      {!compact && <span className="question-hint">两音相距几度？</span>}
    </div>
  );
}
