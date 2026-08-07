import { useWindowDrag } from '../hooks/useWindowDrag';

interface WindowBarProps {
  isExpanded: boolean;
  isPinned: boolean;
  onToggleExpand: () => void;
  onTogglePin: () => void;
  onHide: () => void;
}

export default function WindowBar({
  isExpanded,
  isPinned,
  onToggleExpand,
  onTogglePin,
  onHide,
}: WindowBarProps) {
  const barRef = useWindowDrag<HTMLDivElement>();

  return (
    <div className="window-bar">
      <div className="window-bar-drag" ref={barRef}>
        <span className="window-title">Ref</span>
      </div>
      <div className="window-actions">
        <button
          className="win-btn"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Mini mode' : 'Expand'}
          title={isExpanded ? '迷你模式' : '展开'}
        >
          {isExpanded ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>

        <button
          className={`win-btn ${isPinned ? 'active' : ''}`}
          onClick={onTogglePin}
          aria-label={isPinned ? 'Unpin' : 'Pin on top'}
          title={isPinned ? '取消置顶' : '窗口置顶'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-2.5c0-.83-.67-1.5-1.5-1.5h-1V8.37c0-.57-.4-1.06-.94-1.21L12 6.34l-3.56.82c-.55.15-.94.64-.94 1.21V13h-1C5.67 13 5 13.67 5 14.5V17Z" />
          </svg>
        </button>

        <button
          className="win-btn win-close"
          onClick={onHide}
          aria-label="Hide to tray"
          title="隐藏到托盘 (Esc / Ctrl+Shift+H)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
