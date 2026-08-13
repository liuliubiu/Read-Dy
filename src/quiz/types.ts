import type { ClefType, NotePitch } from '../music/notes';

export type QuizMode = 'mapping' | 'staff' | 'interval';

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

export type IntervalDirection = 'up' | 'down' | 'mixed';

export interface IntervalSettings {
  clef: ClefSetting;
  direction: IntervalDirection;
}

export const DEFAULT_INTERVAL_SETTINGS: IntervalSettings = {
  clef: 'mixed',
  direction: 'mixed',
};

/** 作答方式：四选一 / 键盘直答。纯 UI 层设置，不参与出题内容。 */
export type AnswerMode = 'options' | 'direct';

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

export interface IntervalQuestion extends BaseQuestion {
  type: 'interval';
  /** 左音符（上行时为低音，下行时为高音）。 */
  first: NotePitch;
  /** 右音符。 */
  second: NotePitch;
  clef: ClefType;
  intervalName: string;
}

export type Question = MappingQuestion | StaffQuestion | IntervalQuestion;

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
  intervalSettings: IntervalSettings;
}
