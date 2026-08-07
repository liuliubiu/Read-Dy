import { useCallback, useEffect, useRef, useState } from 'react';
import { generateQuestion } from '../quiz/generator';
import type { AnswerState, Question, QuizConfig, QuizStats } from '../quiz/types';

const FEEDBACK_MS = 400;
const BEST_STREAK_KEY = 'quick-ms-best-streak';

function readBestStreak(): number {
  try {
    const value = localStorage.getItem(BEST_STREAK_KEY);
    return value ? Number.parseInt(value, 10) : 0;
  } catch {
    return 0;
  }
}

function persistBestStreak(value: number) {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(value));
  } catch {
    // ignore
  }
}

export function useQuiz(config: QuizConfig) {
  const [question, setQuestion] = useState<Question>(() => generateQuestion(config));
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<QuizStats>(() => ({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: readBestStreak(),
  }));
  const timerRef = useRef<number | null>(null);
  const configRef = useRef(config);

  configRef.current = config;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const nextQuestion = useCallback(() => {
    clearTimer();
    setQuestion(generateQuestion(configRef.current));
    setAnswerState('idle');
    setSelectedIndex(null);
  }, [clearTimer]);

  useEffect(() => {
    nextQuestion();
  }, [
    config.mode,
    config.mappingSettings.kind,
    config.staffSettings.clef,
    config.staffSettings.answerType,
    nextQuestion,
  ]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const answer = useCallback(
    (index: number) => {
      if (answerState === 'answered') {
        return;
      }

      const isCorrect = index === question.correctIndex;
      setSelectedIndex(index);
      setAnswerState('answered');
      setStats((prev) => {
        const streak = isCorrect ? prev.streak + 1 : 0;
        const bestStreak = Math.max(prev.bestStreak, streak);
        if (bestStreak > prev.bestStreak) {
          persistBestStreak(bestStreak);
        }
        return {
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1,
          streak,
          bestStreak,
        };
      });

      timerRef.current = window.setTimeout(() => {
        nextQuestion();
      }, FEEDBACK_MS);
    },
    [answerState, nextQuestion, question.correctIndex],
  );

  const skipFeedback = useCallback(() => {
    if (answerState === 'answered') {
      nextQuestion();
    }
  }, [answerState, nextQuestion]);

  return {
    question,
    answerState,
    selectedIndex,
    stats,
    answer,
    skipFeedback,
    nextQuestion,
  };
}
