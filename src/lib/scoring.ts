import { viaCategories, type VIACategory } from '@/data/viaQuestions';
import { scheinCategories, type ScheinCategory } from '@/data/scheinQuestions';

export type Answers = Record<number, number>;

export function calculateCategoryScores(
  answers: Answers,
  questions: { id: number; category: string }[],
  categories: readonly string[]
): Record<string, number> {
  const scores: Record<string, { total: number; count: number }> = {};
  categories.forEach(c => { scores[c] = { total: 0, count: 0 }; });

  Object.entries(answers).forEach(([id, score]) => {
    const q = questions.find(q => q.id === Number(id));
    if (q && scores[q.category]) {
      scores[q.category].total += score;
      scores[q.category].count += 1;
    }
  });

  const result: Record<string, number> = {};
  categories.forEach(c => {
    result[c] = scores[c].count > 0 ? scores[c].total / scores[c].count : 0;
  });
  return result;
}

export function getMaxScoredQuestions(
  answers: Answers,
  questions: { id: number; text: string; category: string }[],
  minCount: number = 6
): { id: number; text: string; category: string }[] {
  const answeredQuestions = questions.filter(q => answers[q.id] !== undefined);
  const sorted = [...answeredQuestions].sort((a, b) => (answers[b.id] || 0) - (answers[a.id] || 0));
  
  if (sorted.length <= minCount) return sorted;
  
  // Include at least minCount questions, expanding to include all ties at the cutoff score
  const cutoffScore = answers[sorted[minCount - 1].id];
  const result = sorted.filter(q => answers[q.id] >= cutoffScore);
  return result;
}

export function applyBonus(
  answers: Answers,
  selectedIds: number[]
): Answers {
  const updated = { ...answers };
  selectedIds.forEach(id => {
    if (updated[id] !== undefined) {
      updated[id] += 4;
    }
  });
  return updated;
}

export function getTopCategories(
  scores: Record<string, number>,
  count: number = 2
): { category: string; score: number }[] {
  return Object.entries(scores)
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
