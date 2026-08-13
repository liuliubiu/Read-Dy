import {
  INTERVAL_NAMES,
  LETTERS,
  NUMBERS,
  SOLFEGE,
  getStaffNoteRange,
  letterToNumber,
  letterToSolfege,
  numberToLetter,
  numberToSolfege,
  pickDistractors,
  pickRandom,
  shuffle,
  solfegeToLetter,
  solfegeToNumber,
  type ClefType,
  type LetterName,
  type NumberName,
  type SolfegeName,
} from '../music/notes';
import type {
  ClefSetting,
  IntervalDirection,
  IntervalSettings,
  MappingDirection,
  MappingKind,
  MappingSettings,
  Question,
  QuizConfig,
  StaffAnswerSetting,
  StaffAnswerType,
  StaffSettings,
} from './types';

let questionCounter = 0;

function nextId(): string {
  questionCounter += 1;
  return `q-${questionCounter}`;
}

function buildOptions(correct: string, pool: readonly string[]): { options: string[]; correctIndex: number } {
  const distractors = pickDistractors(pool, correct, 3);
  const options = shuffle([correct, ...distractors]);
  return { options, correctIndex: options.indexOf(correct) };
}

function resolveClef(setting: ClefSetting): ClefType {
  if (setting === 'mixed') {
    return Math.random() < 0.5 ? 'treble' : 'bass';
  }
  return setting;
}

function resolveAnswerType(setting: StaffAnswerSetting): StaffAnswerType {
  if (setting === 'mixed') {
    return Math.random() < 0.5 ? 'letter' : 'solfege';
  }
  return setting;
}

function resolveMappingKind(setting: MappingKind): Exclude<MappingKind, 'mixed'> {
  if (setting === 'mixed') {
    const kinds: Exclude<MappingKind, 'mixed'>[] = ['letterSolfege', 'letterNumber', 'solfegeNumber'];
    return pickRandom(kinds);
  }
  return setting;
}

function randomDirection(forward: MappingDirection, backward: MappingDirection): MappingDirection {
  return Math.random() < 0.5 ? forward : backward;
}

function generateLetterSolfegeQuestion(): Question {
  const direction = randomDirection('letterToSolfege', 'solfegeToLetter');

  if (direction === 'letterToSolfege') {
    const letter = pickRandom(LETTERS);
    const correct = letterToSolfege(letter);
    const { options, correctIndex } = buildOptions(correct, SOLFEGE);
    return { id: nextId(), type: 'mapping', direction, prompt: letter, options, correctIndex };
  }

  const solfege = pickRandom(SOLFEGE);
  const correct = solfegeToLetter(solfege);
  const { options, correctIndex } = buildOptions(correct, LETTERS);
  return { id: nextId(), type: 'mapping', direction, prompt: solfege, options, correctIndex };
}

function generateLetterNumberQuestion(): Question {
  const direction = randomDirection('letterToNumber', 'numberToLetter');

  if (direction === 'letterToNumber') {
    const letter = pickRandom(LETTERS);
    const correct = letterToNumber(letter);
    const { options, correctIndex } = buildOptions(correct, NUMBERS);
    return { id: nextId(), type: 'mapping', direction, prompt: letter, options, correctIndex };
  }

  const number = pickRandom(NUMBERS);
  const correct = numberToLetter(number);
  const { options, correctIndex } = buildOptions(correct, LETTERS);
  return { id: nextId(), type: 'mapping', direction, prompt: number, options, correctIndex };
}

function generateSolfegeNumberQuestion(): Question {
  const direction = randomDirection('solfegeToNumber', 'numberToSolfege');

  if (direction === 'solfegeToNumber') {
    const solfege = pickRandom(SOLFEGE);
    const correct = solfegeToNumber(solfege);
    const { options, correctIndex } = buildOptions(correct, NUMBERS);
    return { id: nextId(), type: 'mapping', direction, prompt: solfege, options, correctIndex };
  }

  const number = pickRandom(NUMBERS);
  const correct = numberToSolfege(number);
  const { options, correctIndex } = buildOptions(correct, SOLFEGE);
  return { id: nextId(), type: 'mapping', direction, prompt: number, options, correctIndex };
}

function generateMappingQuestion(settings: MappingSettings): Question {
  const kind = resolveMappingKind(settings.kind);
  if (kind === 'letterNumber') {
    return generateLetterNumberQuestion();
  }
  if (kind === 'solfegeNumber') {
    return generateSolfegeNumberQuestion();
  }
  return generateLetterSolfegeQuestion();
}

function resolveIntervalDirection(setting: IntervalDirection): 'up' | 'down' {
  if (setting === 'mixed') {
    return Math.random() < 0.5 ? 'up' : 'down';
  }
  return setting;
}

function generateIntervalQuestion(settings: IntervalSettings): Question {
  const clef = resolveClef(settings.clef);
  const direction = resolveIntervalDirection(settings.direction);
  // 音域数组本身是从低到高的自然音序列，索引差即度数（1 = 二度 … 7 = 八度）。
  const range = getStaffNoteRange(clef);
  const distance = 1 + Math.floor(Math.random() * 7);
  const maxFirstIndex = range.length - 1 - distance;
  const firstIndex = Math.floor(Math.random() * (maxFirstIndex + 1));
  const lower = range[firstIndex]!;
  const upper = range[firstIndex + distance]!;
  const correct = INTERVAL_NAMES[distance - 1]!;
  const { options, correctIndex } = buildOptions(correct, INTERVAL_NAMES);

  return {
    id: nextId(),
    type: 'interval',
    first: direction === 'up' ? lower : upper,
    second: direction === 'up' ? upper : lower,
    clef,
    intervalName: correct,
    options,
    correctIndex,
  };
}

function generateStaffQuestion(staffSettings: StaffSettings): Question {
  const clef = resolveClef(staffSettings.clef);
  const answerType = resolveAnswerType(staffSettings.answerType);
  const pitch = pickRandom(getStaffNoteRange(clef));

  if (answerType === 'solfege') {
    const correct = letterToSolfege(pitch.letter);
    const { options, correctIndex } = buildOptions(correct, SOLFEGE);
    return {
      id: nextId(),
      type: 'staff',
      pitch,
      clef,
      answerType,
      options,
      correctIndex,
    };
  }

  const correct = pitch.letter;
  const { options, correctIndex } = buildOptions(correct, LETTERS);
  return {
    id: nextId(),
    type: 'staff',
    pitch,
    clef,
    answerType,
    options,
    correctIndex,
  };
}

export function generateQuestion(config: QuizConfig): Question {
  if (config.mode === 'mapping') {
    return generateMappingQuestion(config.mappingSettings);
  }
  if (config.mode === 'interval') {
    return generateIntervalQuestion(config.intervalSettings);
  }
  return generateStaffQuestion(config.staffSettings);
}

export function getMappingHint(direction: MappingDirection): string {
  switch (direction) {
    case 'letterToSolfege':
      return '选择对应的唱名';
    case 'solfegeToLetter':
      return '选择对应的音名';
    case 'letterToNumber':
      return '选择对应的数字';
    case 'numberToLetter':
      return '选择对应的音名';
    case 'solfegeToNumber':
      return '选择对应的数字';
    case 'numberToSolfege':
      return '选择对应的唱名';
  }
}

export type { LetterName, SolfegeName, NumberName };
