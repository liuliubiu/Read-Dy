import type { ClefType, NotePitch } from '../music/notes';

export type QuizMode = 'mapping' | 'staff';

export type MappingDirection =
  | 'letterToSolfege'
  | 'solfegeToLetter'
  | 'letterToNumber'
  | 'numberToLetter'
  | 'solfegeToNumber'
  | 'numberToSolfege';

export type MappingKind = 'letterSolfege' | 'letterNumber' | 'solfegeNumber' | 'mixed';

export interface MappingSettings {
  kind: MappingKind;
}

export const DEFAULT_MAPPING_SETTINGS: MappingSettings = {
  kind: 'letterSolfege',
};

export type ClefSetting = 'treble' | 'bass' | 'mixed';
export type StaffAnswerSetting = 'letter' | 'solfege' | 'mixed';
export type StaffAnswerType = 'letter' | 'solfege';

export interface StaffSettings {
  clef: ClefSetting;
  answerType: StaffAnswerSetting;
}

export const DEFAULT_STAFF_SETTINGS: StaffSettings = {
  clef: 'mixed',
  answerType: 'mixed',
};

export interface BaseQuestion {
  id: string;
  options: string[];
  correctIndex: number;
}

export interface MappingQuestion extends BaseQuestion {
  type: 'mapping';
  direction: MappingDirection;
  prompt: string;
}

export interface StaffQuestion extends BaseQuestion {
  type: 'staff';
  pitch: NotePitch;
  clef: ClefType;
  answerType: StaffAnswerType;
}

export type Question = MappingQuestion | StaffQuestion;

export interface QuizStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export type AnswerState = 'idle' | 'answered';

export interface QuizConfig {
  mode: QuizMode;
  mappingSettings: MappingSettings;
  staffSettings: StaffSettings;
}
