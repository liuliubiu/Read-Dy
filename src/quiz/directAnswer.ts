import { LETTERS, NUMBERS, SOLFEGE } from '../music/notes';
import type { Question } from './types';

export type DirectKeymap = 'letters' | 'digits';

/** 直答模式下当前题目的键位：音名键（C–G）或数字键（1–7，DO=1 … SI=7）。 */
export function getDirectKeymap(question: Question): DirectKeymap {
  if (question.type === 'staff') {
    return question.answerType === 'letter' ? 'letters' : 'digits';
  }
  if (question.type === 'mapping') {
    return question.direction === 'solfegeToLetter' || question.direction === 'numberToLetter'
      ? 'letters'
      : 'digits';
  }
  // 音程题不启用直答，防御性兜底。
  return 'letters';
}

/** 键盘按键 → 答案值；无效键返回 null。音程题恒返回 null。 */
export function directKeyToValue(key: string, question: Question): string | null {
  if (question.type === 'interval') {
    return null;
  }

  if (getDirectKeymap(question) === 'letters') {
    const letter = key.toUpperCase();
    return (LETTERS as readonly string[]).includes(letter) ? letter : null;
  }

  const index = Number.parseInt(key, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index > 6) {
    return null;
  }

  if (question.type === 'staff') {
    return question.answerType === 'solfege' ? SOLFEGE[index]! : NUMBERS[index]!;
  }

  switch (question.direction) {
    case 'letterToSolfege':
    case 'numberToSolfege':
      return SOLFEGE[index]!;
    case 'letterToNumber':
    case 'solfegeToNumber':
      return NUMBERS[index]!;
    default:
      return null;
  }
}

/** 直答提示文案，随当前题目键位变化。 */
export function getDirectKeyHint(question: Question): string {
  return getDirectKeymap(question) === 'letters'
    ? '按音名键 C–G'
    : '按数字键 1–7（1=DO … 7=SI）';
}
