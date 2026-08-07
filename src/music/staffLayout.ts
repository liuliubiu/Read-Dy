import type { ClefType, NotePitch } from './notes';
import { pitchKey } from './notes';

export const STAFF_LINE_SPACING = 10;
export const STAFF_TOP_LINE_Y = 36;
export const STAFF_BOTTOM_LINE_Y = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 4;

const TREBLE_DIATONIC_STEPS: Record<string, number> = {
  C4: -6,
  D4: -5,
  E4: -4,
  F4: -3,
  G4: -2,
  A4: -1,
  B4: 0,
  C5: 1,
  D5: 2,
  E5: 3,
  F5: 4,
  G5: 5,
  A5: 6,
};

const BASS_DIATONIC_STEPS: Record<string, number> = {
  E2: -6,
  F2: -5,
  G2: -4,
  A2: -3,
  B2: -2,
  C3: -1,
  D3: 0,
  E3: 1,
  F3: 2,
  G3: 3,
  A3: 4,
  B3: 5,
  C4: 6,
};

function getStepTable(clef: ClefType): Record<string, number> {
  return clef === 'treble' ? TREBLE_DIATONIC_STEPS : BASS_DIATONIC_STEPS;
}

function diatonicSteps(pitch: NotePitch, clef: ClefType): number {
  const key = pitchKey(pitch);
  const steps = getStepTable(clef)[key];
  if (steps === undefined) {
    throw new Error(`Unsupported ${clef} staff pitch: ${key}`);
  }
  return steps;
}

/** Middle line: B4 (treble) or D3 (bass). */
export function getStaffY(pitch: NotePitch, clef: ClefType): number {
  const middleLineY = STAFF_TOP_LINE_Y + STAFF_LINE_SPACING * 2;
  return middleLineY - diatonicSteps(pitch, clef) * (STAFF_LINE_SPACING / 2);
}

/** Ledger lines only appear when the note sits on a line, not in a space. */
export function getLedgerLineYs(noteY: number, pitch: NotePitch, clef: ClefType): number[] {
  if (diatonicSteps(pitch, clef) % 2 !== 0) {
    return [];
  }

  if (noteY > STAFF_BOTTOM_LINE_Y || noteY < STAFF_TOP_LINE_Y) {
    return [noteY];
  }

  return [];
}

/** F3 line Y for bass clef dots. */
export function getBassClefDotY(): number {
  return STAFF_TOP_LINE_Y + STAFF_LINE_SPACING;
}
