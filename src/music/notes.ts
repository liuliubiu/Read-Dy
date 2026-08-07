export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const SOLFEGE = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'] as const;
export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7'] as const;

export type LetterName = (typeof LETTERS)[number];
export type SolfegeName = (typeof SOLFEGE)[number];
export type NumberName = (typeof NUMBERS)[number];
export type ClefType = 'treble' | 'bass';

export interface NotePitch {
  letter: LetterName;
  octave: number;
}

/** Natural notes from C4 through A5 for treble staff drills. */
export const TREBLE_STAFF_NOTE_RANGE: NotePitch[] = [
  { letter: 'C', octave: 4 },
  { letter: 'D', octave: 4 },
  { letter: 'E', octave: 4 },
  { letter: 'F', octave: 4 },
  { letter: 'G', octave: 4 },
  { letter: 'A', octave: 4 },
  { letter: 'B', octave: 4 },
  { letter: 'C', octave: 5 },
  { letter: 'D', octave: 5 },
  { letter: 'E', octave: 5 },
  { letter: 'F', octave: 5 },
  { letter: 'G', octave: 5 },
  { letter: 'A', octave: 5 },
];

/** Natural notes from E2 through C4 for bass staff drills. */
export const BASS_STAFF_NOTE_RANGE: NotePitch[] = [
  { letter: 'E', octave: 2 },
  { letter: 'F', octave: 2 },
  { letter: 'G', octave: 2 },
  { letter: 'A', octave: 2 },
  { letter: 'B', octave: 2 },
  { letter: 'C', octave: 3 },
  { letter: 'D', octave: 3 },
  { letter: 'E', octave: 3 },
  { letter: 'F', octave: 3 },
  { letter: 'G', octave: 3 },
  { letter: 'A', octave: 3 },
  { letter: 'B', octave: 3 },
  { letter: 'C', octave: 4 },
];

/** @deprecated Use TREBLE_STAFF_NOTE_RANGE */
export const STAFF_NOTE_RANGE = TREBLE_STAFF_NOTE_RANGE;

export function letterToSolfege(letter: LetterName): SolfegeName {
  return SOLFEGE[LETTERS.indexOf(letter)];
}

export function solfegeToLetter(solfege: SolfegeName): LetterName {
  return LETTERS[SOLFEGE.indexOf(solfege)];
}

export function letterToNumber(letter: LetterName): NumberName {
  return NUMBERS[LETTERS.indexOf(letter)];
}

export function numberToLetter(number: NumberName): LetterName {
  return LETTERS[NUMBERS.indexOf(number)];
}

export function solfegeToNumber(solfege: SolfegeName): NumberName {
  return NUMBERS[SOLFEGE.indexOf(solfege)];
}

export function numberToSolfege(number: NumberName): SolfegeName {
  return SOLFEGE[NUMBERS.indexOf(number)];
}

export function pitchKey(pitch: NotePitch): string {
  return `${pitch.letter}${pitch.octave}`;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function pickDistractors<T>(pool: readonly T[], correct: T, count: number): T[] {
  const candidates = pool.filter((item) => item !== correct);
  return shuffle(candidates).slice(0, count);
}

export function getStaffNoteRange(clef: ClefType): readonly NotePitch[] {
  return clef === 'treble' ? TREBLE_STAFF_NOTE_RANGE : BASS_STAFF_NOTE_RANGE;
}
