import q1 from '@/assets/thinking/q1.jpg';
import q2 from '@/assets/thinking/q2.jpg';
import q3 from '@/assets/thinking/q3.jpg';
import q4 from '@/assets/thinking/q4.jpg';
import q5 from '@/assets/thinking/q5.jpg';
import q6 from '@/assets/thinking/q6.jpg';
import q7 from '@/assets/thinking/q7.jpg';
import q8 from '@/assets/thinking/q8.jpg';
import q9 from '@/assets/thinking/q9.jpg';
import q10 from '@/assets/thinking/q10.jpg';
import q11 from '@/assets/thinking/q11.jpg';
import q12 from '@/assets/thinking/q12.jpg';
import q13 from '@/assets/thinking/q13.jpg';
import q14 from '@/assets/thinking/q14.jpg';
import q15 from '@/assets/thinking/q15.jpg';
import example from '@/assets/thinking/example.jpg';

export interface ThinkingQuestion {
  id: number;
  image: string;
  correctAnswer: number; // 1-8
  difficulty: 'easy' | 'medium' | 'hard';
}

export const thinkingQuestions: ThinkingQuestion[] = [
  { id: 1,  image: q1,  correctAnswer: 4, difficulty: 'easy' },
  { id: 2,  image: q2,  correctAnswer: 7, difficulty: 'easy' },
  { id: 3,  image: q3,  correctAnswer: 2, difficulty: 'easy' },
  { id: 4,  image: q4,  correctAnswer: 5, difficulty: 'easy' },
  { id: 5,  image: q5,  correctAnswer: 1, difficulty: 'easy' },
  { id: 6,  image: q6,  correctAnswer: 5, difficulty: 'medium' },
  { id: 7,  image: q7,  correctAnswer: 1, difficulty: 'medium' },
  { id: 8,  image: q8,  correctAnswer: 7, difficulty: 'medium' },
  { id: 9,  image: q9,  correctAnswer: 1, difficulty: 'medium' },
  { id: 10, image: q10, correctAnswer: 4, difficulty: 'medium' },
  { id: 11, image: q11, correctAnswer: 3, difficulty: 'hard' },
  { id: 12, image: q12, correctAnswer: 4, difficulty: 'hard' },
  { id: 13, image: q13, correctAnswer: 1, difficulty: 'hard' },
  { id: 14, image: q14, correctAnswer: 7, difficulty: 'hard' },
  { id: 15, image: q15, correctAnswer: 3, difficulty: 'hard' },
];

export const exampleImage = example;

export const TOTAL_QUESTIONS = thinkingQuestions.length;
export const TIME_LIMIT_SECONDS = 15 * 60; // 15 minutes

export type ThinkingResult = {
  totalCorrect: number;
  totalQuestions: number;
  percentile: number;
  level: 'low' | 'below-average' | 'average' | 'above-average' | 'high';
  levelLabel: string;
  timeUsedSeconds: number;
  answers: Record<number, number>; // questionId -> selected answer
};

export function calculateThinkingResult(
  answers: Record<number, number>,
  timeUsedSeconds: number
): ThinkingResult {
  let totalCorrect = 0;
  thinkingQuestions.forEach(q => {
    if (answers[q.id] === q.correctAnswer) totalCorrect++;
  });

  const ratio = totalCorrect / TOTAL_QUESTIONS;
  let level: ThinkingResult['level'];
  let levelLabel: string;
  let percentile: number;

  if (ratio >= 0.87) {
    level = 'high'; levelLabel = 'גבוה מאוד'; percentile = 90;
  } else if (ratio >= 0.73) {
    level = 'above-average'; levelLabel = 'מעל הממוצע'; percentile = 75;
  } else if (ratio >= 0.53) {
    level = 'average'; levelLabel = 'ממוצע'; percentile = 50;
  } else if (ratio >= 0.33) {
    level = 'below-average'; levelLabel = 'מתחת לממוצע'; percentile = 30;
  } else {
    level = 'low'; levelLabel = 'דורש חיזוק'; percentile = 15;
  }

  return { totalCorrect, totalQuestions: TOTAL_QUESTIONS, percentile, level, levelLabel, timeUsedSeconds, answers };
}
