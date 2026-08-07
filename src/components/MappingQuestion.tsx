import { getMappingHint } from '../quiz/generator';
import type { MappingQuestion } from '../quiz/types';

interface MappingQuestionViewProps {
  question: MappingQuestion;
  compact?: boolean;
}

export default function MappingQuestionView({ question, compact = false }: MappingQuestionViewProps) {
  const hint = getMappingHint(question.direction);

  return (
    <div className={`question-prompt ${compact ? 'question-prompt-compact' : ''}`}>
      {!compact && <span className="question-hint">{hint}</span>}
      <span className="question-main">{question.prompt}</span>
    </div>
  );
}
