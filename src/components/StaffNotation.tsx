import type { ClefType, NotePitch } from '../music/notes';
import { pitchKey } from '../music/notes';
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
  /** 传入第二个音时渲染双音符（音程训练用），两个符头在 X 方向错开避免二度重叠。 */
  secondPitch?: NotePitch;
}

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 96;
const COMPACT_VIEW_WIDTH = 136;
const STAFF_LEFT = 52;
const STAFF_RIGHT = 188;
const NOTE_X = 142;
const COMPACT_STAFF_LEFT = 40;
const COMPACT_STAFF_RIGHT = 126;
const COMPACT_NOTE_X = 94;
const TREBLE_G_LINE_Y = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 3;
const BASS_F_LINE_Y = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING;

export default function StaffNotation({
  pitch,
  clef,
  compact = false,
  secondPitch,
}: StaffNotationProps) {
  const lines = Array.from({ length: 5 }, (_, index) => STAFF_TOP_LINE_Y + index * STAFF_LINE_SPACING);

  const viewWidth = compact ? COMPACT_VIEW_WIDTH : VIEW_WIDTH;
  const staffLeft = compact ? COMPACT_STAFF_LEFT : STAFF_LEFT;
  const staffRight = compact ? COMPACT_STAFF_RIGHT : STAFF_RIGHT;
  const noteX = compact ? COMPACT_NOTE_X : NOTE_X;
  const clefX = compact ? 8 : 14;
  const bassDotX = compact ? 34 : 46;

  const noteOffset = compact ? 10 : 14;
  const notes = secondPitch
    ? [
        { pitch, x: noteX - noteOffset },
        { pitch: secondPitch, x: noteX + noteOffset },
      ]
    : [{ pitch, x: noteX }];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}
      className={`staff-notation ${compact ? 'staff-notation-compact' : ''}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {lines.map((y) => (
        <line
          key={y}
          x1={staffLeft}
          y1={y}
          x2={staffRight}
          y2={y}
          className="staff-line"
        />
      ))}

      {clef === 'treble' ? (
        <text
          x={clefX}
          y={TREBLE_G_LINE_Y + 1}
          className="staff-clef-text"
          fontSize={compact ? 52 : 62}
          dominantBaseline="middle"
        >
          {'\u{1D11E}'}
        </text>
      ) : (
        <>
          <text
            x={clefX}
            y={STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 2 + 1}
            className="staff-clef-text"
            fontSize={compact ? 44 : 54}
            dominantBaseline="middle"
          >
            {'\u{1D122}'}
          </text>
          <circle cx={bassDotX} cy={BASS_F_LINE_Y - STAFF_LINE_SPACING / 2} r={2.5} className="staff-clef" />
          <circle cx={bassDotX} cy={BASS_F_LINE_Y + STAFF_LINE_SPACING / 2} r={2.5} className="staff-clef" />
        </>
      )}

      {notes
        .flatMap(({ pitch: p, x }) =>
          getLedgerLineYs(getStaffY(p, clef), p, clef).map((y) => ({ x, y })),
        )
        .map(({ x, y }) => (
          <line
            key={`ledger-${x}-${y}`}
            x1={x - 12}
            y1={y}
            x2={x + 12}
            y2={y}
            className="staff-ledger"
          />
        ))}

      {notes.map(({ pitch: p, x }) => (
        <ellipse
          key={pitchKey(p)}
          cx={x}
          cy={getStaffY(p, clef)}
          rx={compact ? 6.5 : 8}
          ry={compact ? 5 : 6}
          className="staff-note"
        />
      ))}
    </svg>
  );
}
