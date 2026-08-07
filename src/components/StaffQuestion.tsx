import type { StaffQuestion } from '../quiz/types';
import StaffNotation from './StaffNotation';

interface StaffQuestionViewProps {
  question: StaffQuestion;
  compact?: boolean;
}

export default function StaffQuestionView({ question, compact = false }: StaffQuestionViewProps) {
  return (
    <div className={`question-staff ${compact ? 'question-staff-compact' : ''}`}>
      <StaffNotation pitch={question.pitch} clef={question.clef} compact={compact} />
    </div>
  );
}
