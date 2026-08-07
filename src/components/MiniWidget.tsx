import type { Question, QuizStats, AnswerState } from '../quiz/types';
import { useWindowDrag } from '../hooks/useWindowDrag';
import MappingQuestionView from './MappingQuestion';
import StaffQuestionView from './StaffQuestion';
import OptionButtons from './OptionButtons';

interface MiniWidgetProps {
  question: Question;
  stats: QuizStats;
  answerState: AnswerState;
  selectedIndex: number | null;
  isPinned: boolean;
  onAnswer: (index: number) => void;
  onSkipFeedback: () => void;
  onToggleExpand: () => void;
  onTogglePin: () => void;
  onHide: () => void;
}

export default function MiniWidget({
  question,
  stats,
  answerState,
  selectedIndex,
  isPinned,
  onAnswer,
  onSkipFeedback,
  onToggleExpand,
  onTogglePin,
  onHide,
}: MiniWidgetProps) {
  const dragRef = useWindowDrag<HTMLDivElement>();
  const isStaff = question.type === 'staff';

  return (
    <div className={`mini-widget ${isStaff ? 'mini-widget-staff' : 'mini-widget-mapping'}`}>
      <div className="mini-header mini-header-drag" ref={dragRef}>
        <span className="mini-stat">{stats.correct}/{stats.total}</span>
        <div className="mini-actions">
          <button className="mini-btn" onClick={onToggleExpand} title="展开" aria-label="Expand">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            className={`mini-btn ${isPinned ? 'active' : ''}`}
            onClick={onTogglePin}
            title={isPinned ? '取消置顶' : '窗口置顶'}
            aria-label={isPinned ? 'Unpin' : 'Pin'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-2.5c0-.83-.67-1.5-1.5-1.5h-1V8.37c0-.57-.4-1.06-.94-1.21L12 6.34l-3.56.82c-.55.15-.94.64-.94 1.21V13h-1C5.67 13 5 13.67 5 14.5V17Z" />
            </svg>
          </button>
          <button className="mini-btn mini-btn-close" onClick={onHide} title="隐藏 (Esc / Ctrl+Shift+H)" aria-label="Hide">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`mini-question ${isStaff ? 'mini-question-staff' : 'mini-question-mapping'}`}>
        {isStaff ? (
          <StaffQuestionView question={question} compact />
        ) : (
          <MappingQuestionView question={question} compact />
        )}
      </div>

      <OptionButtons
        options={question.options}
        correctIndex={question.correctIndex}
        answerState={answerState}
        selectedIndex={selectedIndex}
        compact
        onAnswer={onAnswer}
        onSkipFeedback={onSkipFeedback}
      />
    </div>
  );
}
