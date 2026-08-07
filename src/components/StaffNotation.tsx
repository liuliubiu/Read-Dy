import type { ClefType, NotePitch } from '../music/notes';
import {
  getLedgerLineYs,
  getStaffY,
  STAFF_LINE_SPACING,
  STAFF_TOP_LINE_Y,
} from '../music/staffLayout';

interface StaffNotationProps {
  pitch: NotePitch;
  clef: ClefType;
  compact?: boolean;
}

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 96;
const STAFF_LEFT = 52;
const STAFF_RIGHT = 188;
const NOTE_X = 142;
const TREBLE_G_LINE_Y = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 3;
const BASS_F_LINE_Y = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING;

export default function StaffNotation({ pitch, clef, compact = false }: StaffNotationProps) {
  const noteY = getStaffY(pitch, clef);
  const ledgerYs = getLedgerLineYs(noteY, pitch, clef);
  const lines = Array.from({ length: 5 }, (_, index) => STAFF_TOP_LINE_Y + index * STAFF_LINE_SPACING);

  const displayWidth = compact ? '100%' : 220;
  const displayHeight = compact ? '100%' : 96;

  return (
    <svg
      width={displayWidth}
      height={displayHeight}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={`staff-notation ${compact ? 'staff-notation-compact' : ''}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {lines.map((y) => (
        <line
          key={y}
          x1={STAFF_LEFT}
          y1={y}
          x2={STAFF_RIGHT}
          y2={y}
          className="staff-line"
        />
      ))}

      {clef === 'treble' ? (
        <text
          x={14}
          y={TREBLE_G_LINE_Y + 1}
          className="staff-clef-text"
          fontSize={compact ? 56 : 62}
          dominantBaseline="middle"
        >
          {'\u{1D11E}'}
        </text>
      ) : (
        <>
          <text
            x={14}
            y={STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 2 + 1}
            className="staff-clef-text"
            fontSize={compact ? 48 : 54}
            dominantBaseline="middle"
          >
            {'\u{1D122}'}
          </text>
          <circle cx={46} cy={BASS_F_LINE_Y - STAFF_LINE_SPACING / 2} r={2.5} className="staff-clef" />
          <circle cx={46} cy={BASS_F_LINE_Y + STAFF_LINE_SPACING / 2} r={2.5} className="staff-clef" />
        </>
      )}

      {ledgerYs.map((y) => (
        <line
          key={`ledger-${y}`}
          x1={NOTE_X - 14}
          y1={y}
          x2={NOTE_X + 14}
          y2={y}
          className="staff-ledger"
        />
      ))}

      <ellipse
        cx={NOTE_X}
        cy={noteY}
        rx={compact ? 7 : 8}
        ry={compact ? 5.5 : 6}
        className="staff-note"
      />
    </svg>
  );
}
