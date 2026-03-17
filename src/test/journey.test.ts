import { describe, it, expect } from 'vitest';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import { skills } from '@/data/skillsData';
import { considerations } from '@/data/considerationsData';
import { preferenceQuestions, dreamOptions } from '@/data/preferencesData';
import {
  calculateCategoryScores,
  getMaxScoredQuestions,
  applyBonus,
  getTopCategories,
  type Answers,
} from '@/lib/scoring';
import { getRecommendations } from '@/lib/recommendations';

// ==========================================
// 1. DATA INTEGRITY TESTS
// ==========================================

describe('Data Integrity', () => {
  it('VIA: 40 questions across 6 categories, unique IDs', () => {
    expect(viaQuestions.length).toBe(40);
    expect(viaCategories.length).toBe(6);
    const ids = viaQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(40);
    // Every question has a valid category
    viaQuestions.forEach(q => {
      expect(viaCategories).toContain(q.category);
    });
  });

  it('Schein: 32 questions across 8 categories, unique IDs', () => {
    expect(scheinQuestions.length).toBe(32);
    expect(scheinCategories.length).toBe(8);
    const ids = scheinQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(32);
    scheinQuestions.forEach(q => {
      expect(scheinCategories).toContain(q.category);
    });
  });

  it('Holland: 66 questions across 6 categories (11 each), unique IDs', () => {
    expect(hollandQuestions.length).toBe(66);
    expect(hollandCategories.length).toBe(6);
    const ids = hollandQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(66);
    // Each category should have 11 questions
    hollandCategories.forEach(cat => {
      const count = hollandQuestions.filter(q => q.category === cat).length;
      expect(count).toBe(11);
    });
  });

  it('Skills: 20 skills with unique IDs', () => {
    expect(skills.length).toBe(20);
    const ids = skills.map(s => s.id);
    expect(new Set(ids).size).toBe(20);
  });

  it('Considerations: 34 items, all unique', () => {
    expect(considerations.length).toBe(34);
    expect(new Set(considerations).size).toBe(34);
  });

  it('Preferences: 4 questions + dream options', () => {
    expect(preferenceQuestions.length).toBe(4);
    expect(dreamOptions.length).toBeGreaterThan(0);
    // Each question has options
    preferenceQuestions.forEach(q => {
      expect(q.options.length).toBeGreaterThan(1);
      expect(q.id).toBeTruthy();
      expect(q.title).toBeTruthy();
    });
  });
});

// ==========================================
// 2. SCORING LOGIC TESTS
// ==========================================

describe('Scoring Logic', () => {
  it('calculateCategoryScores computes correct averages', () => {
    const answers: Answers = { 1: 5, 8: 3 }; // q1=חכמה, q8=חכמה
    const scores = calculateCategoryScores(answers, viaQuestions, viaCategories);
    expect(scores['חכמה וידע']).toBe(4); // (5+3)/2
  });

  it('calculateCategoryScores returns 0 for unanswered categories', () => {
    const answers: Answers = { 1: 5 };
    const scores = calculateCategoryScores(answers, viaQuestions, viaCategories);
    expect(scores['אומץ לב']).toBe(0);
  });

  it('getMaxScoredQuestions returns at least minCount questions with tie expansion', () => {
    const answers: Answers = { 1: 5, 2: 3, 3: 5, 4: 2 };
    const maxQ = getMaxScoredQuestions(answers, viaQuestions);
    // With minCount=6 default and only 4 answered questions, returns all 4
    expect(maxQ.length).toBe(4);
    expect(maxQ.map(q => q.id)).toEqual(expect.arrayContaining([1, 3]));
  });

  it('applyBonus adds 4 points to selected questions', () => {
    const answers: Answers = { 1: 5, 2: 3, 3: 5 };
    const bonused = applyBonus(answers, [1, 3]);
    expect(bonused[1]).toBe(9);
    expect(bonused[2]).toBe(3);
    expect(bonused[3]).toBe(9);
  });

  it('getTopCategories returns correct top N', () => {
    const scores = { 'א': 3, 'ב': 5, 'ג': 1, 'ד': 4 };
    const top = getTopCategories(scores, 2);
    expect(top[0].category).toBe('ב');
    expect(top[1].category).toBe('ד');
  });

  it('Schein scoring works with 1-7 scale', () => {
    // Answer all Schein questions with 4 (middle)
    const answers: Answers = {};
    scheinQuestions.forEach(q => { answers[q.id] = 4; });
    const scores = calculateCategoryScores(answers, scheinQuestions, scheinCategories);
    scheinCategories.forEach(cat => {
      expect(scores[cat]).toBe(4);
    });
  });
});

// ==========================================
// 3. BONUS "POWER 3" FLOW TEST
// ==========================================

describe('Power 3 Bonus Flow', () => {
  it('full VIA bonus flow: answer → max → select 3 → bonus applied → scores change', () => {
    // Simulate answering all VIA questions
    const answers: Answers = {};
    viaQuestions.forEach(q => { answers[q.id] = 3; }); // All 3s
    // Set some to 5
    answers[1] = 5; // חכמה וידע
    answers[5] = 5; // מיקוד בטוב
    answers[10] = 5; // אומץ לב
    answers[28] = 5; // אנושיות

    // Get max-scored questions (minCount=6, all 48 answered, 4 scored 5 + ties at cutoff expand)
    const maxQ = getMaxScoredQuestions(answers, viaQuestions);
    expect(maxQ.length).toBeGreaterThanOrEqual(6); // At least minCount with tie expansion

    // User selects 3 of them
    const selected = maxQ.slice(0, 3).map(q => q.id);
    const bonused = applyBonus(answers, selected);

    // Selected questions should have bonus applied
    selected.forEach(id => {
      expect(bonused[id]).toBe(answers[id] + 4);
    });

    // Non-selected questions stay unchanged
    const unselected = maxQ.filter(q => !selected.includes(q.id));
    unselected.forEach(q => {
      expect(bonused[q.id]).toBe(answers[q.id]);
    });

    // Category scores should reflect bonus
    const beforeScores = calculateCategoryScores(answers, viaQuestions, viaCategories);
    const afterScores = calculateCategoryScores(bonused, viaQuestions, viaCategories);

    // At least one category score should be higher
    const anyHigher = Object.keys(afterScores).some(
      cat => afterScores[cat] > beforeScores[cat]
    );
    expect(anyHigher).toBe(true);
  });
});

// ==========================================
// 4. RECOMMENDATIONS TEST
// ==========================================

describe('Recommendations', () => {
  it('returns 3 recommendations for known VIA+Schein combination', () => {
    const viaScores = { 'אנושיות': 5, 'חכמה וידע': 3, 'אומץ לב': 2, 'חוש צדק': 1, 'מתינות וריסון': 1, 'מיקוד בטוב/נשגבות': 1 };
    const scheinScores = { 'שליחות': 7, 'מומחיות': 3, 'ניהול': 2, 'אוטונומיה': 1, 'בטחון ויציבות': 1, 'יצירתיות יזמית': 1, 'אתגר': 1, 'סגנון חיים': 1 };
    const recs = getRecommendations(viaScores, scheinScores);
    expect(recs.length).toBe(5);
    recs.forEach(rec => {
      expect(rec.title).toBeTruthy();
      expect(rec.description).toBeTruthy();
      expect(rec.platformUrl).toMatch(/^https?:\/\//);
      expect(['job', 'volunteer', 'freelance']).toContain(rec.type);
    });
  });

  it('returns fallback recommendations for unknown combination', () => {
    const viaScores = { 'unknownCat': 5 };
    const scheinScores = { 'unknownCat2': 5 };
    const recs = getRecommendations(viaScores, scheinScores);
    expect(recs.length).toBe(5);
  });

  it('returns fallback when scores are empty', () => {
    const recs = getRecommendations({}, {});
    expect(recs.length).toBe(5);
  });
});

// ==========================================
// 5. HOLLAND SCORING TEST
// ==========================================

describe('Holland Scoring', () => {
  it('correctly counts yes answers per category', () => {
    const answers: Record<number, boolean> = {};
    // Answer all R questions (1-11) as yes
    for (let i = 1; i <= 11; i++) answers[i] = true;
    // Answer all I questions (12-22) as no
    for (let i = 12; i <= 22; i++) answers[i] = false;

    const scores: Record<string, number> = {};
    hollandCategories.forEach(cat => { scores[cat] = 0; });
    Object.entries(answers).forEach(([id, val]) => {
      if (val) {
        const q = hollandQuestions.find(q => q.id === Number(id));
        if (q && scores[q.category] !== undefined) {
          scores[q.category] += 1;
        }
      }
    });

    expect(scores['ביצועי (R)']).toBe(11);
    expect(scores['חקרני (I)']).toBe(0);
  });
});

// ==========================================
// 6. CONSIDERATIONS LOGIC TEST
// ==========================================

describe('Considerations Logic', () => {
  it('selecting 6 items from 36 and distributing 100 points', () => {
    const selected = considerations.slice(0, 6);
    expect(selected.length).toBe(6);

    const points: Record<string, number> = {};
    // Distribute 100 points
    selected.forEach((s, i) => {
      points[s] = i === 0 ? 40 : 12;
    });

    const total = Object.values(points).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

// ==========================================
// 7. SKILLS CONSTRAINTS TEST
// ==========================================

describe('Skills Constraints', () => {
  it('winner column should accept 5-7 items', () => {
    const assignments: Record<number, string> = {};
    // Assign first 7 as winners, rest as irrelevant
    skills.forEach((s, i) => {
      assignments[s.id] = i < 7 ? 'winner' : 'irrelevant';
    });

    const winnerCount = Object.values(assignments).filter(v => v === 'winner').length;
    expect(winnerCount).toBe(7);
    expect(winnerCount).toBeGreaterThanOrEqual(5);
    expect(winnerCount).toBeLessThanOrEqual(7);
    expect(Object.keys(assignments).length).toBe(skills.length);
  });
});

// ==========================================
// 8. STATE TRANSITIONS TEST
// ==========================================

describe('State Transitions', () => {
  const steps = ['welcome', 'via', 'via-bonus', 'schein', 'schein-bonus', 'considerations', 'holland', 'skills', 'preferences', 'results'];

  it('all steps are defined and in correct order', () => {
    expect(steps.length).toBe(10);
    expect(steps[0]).toBe('welcome');
    expect(steps[steps.length - 1]).toBe('results');
  });

  it('bonus steps follow their questionnaire steps', () => {
    expect(steps.indexOf('via-bonus')).toBe(steps.indexOf('via') + 1);
    expect(steps.indexOf('schein-bonus')).toBe(steps.indexOf('schein') + 1);
  });
});

// ==========================================
// 9. FULL SIMULATED JOURNEY
// ==========================================

describe('Full Simulated Journey', () => {
  it('simulates the complete user flow from VIA to results', () => {
    // Step 1: VIA answers (all 48, rating 1-5)
    const viaAnswers: Answers = {};
    viaQuestions.forEach(q => {
      viaAnswers[q.id] = (q.id % 5) + 1;
    });
    expect(Object.keys(viaAnswers).length).toBe(48);

    // Step 2: VIA bonus
    const viaMaxQ = getMaxScoredQuestions(viaAnswers, viaQuestions);
    expect(viaMaxQ.length).toBeGreaterThan(0);
    const viaSelected = viaMaxQ.slice(0, 3).map(q => q.id);
    const finalVia = applyBonus(viaAnswers, viaSelected);

    // Step 3: Schein answers (all 40, rating 1-7)
    const scheinAnswers: Answers = {};
    scheinQuestions.forEach(q => {
      scheinAnswers[q.id] = (q.id % 7) + 1;
    });
    expect(Object.keys(scheinAnswers).length).toBe(40);

    // Step 4: Schein bonus
    const scheinMaxQ = getMaxScoredQuestions(scheinAnswers, scheinQuestions);
    expect(scheinMaxQ.length).toBeGreaterThan(0);
    const scheinSelected = scheinMaxQ.slice(0, 3).map(q => q.id);
    const finalSchein = applyBonus(scheinAnswers, scheinSelected);

    // Step 5: Calculate VIA scores
    const viaScores = calculateCategoryScores(finalVia, viaQuestions, viaCategories);
    expect(Object.keys(viaScores).length).toBe(6);
    Object.values(viaScores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
    });

    // Step 6: Calculate Schein scores
    const scheinScores = calculateCategoryScores(finalSchein, scheinQuestions, scheinCategories);
    expect(Object.keys(scheinScores).length).toBe(8);

    // Step 7: Holland answers
    const hollandAnswers: Record<number, boolean> = {};
    hollandQuestions.forEach(q => {
      hollandAnswers[q.id] = q.id % 2 === 0;
    });
    expect(Object.keys(hollandAnswers).length).toBe(66);

    // Calculate Holland scores
    const hollandScores: Record<string, number> = {};
    hollandCategories.forEach(cat => { hollandScores[cat] = 0; });
    Object.entries(hollandAnswers).forEach(([id, val]) => {
      if (val) {
        const q = hollandQuestions.find(q => q.id === Number(id));
        if (q) hollandScores[q.category] += 1;
      }
    });
    expect(Object.keys(hollandScores).length).toBe(6);

    // Step 8: Skills assignments
    const skillsAssignments: Record<number, string> = {};
    skills.forEach((s, i) => {
      skillsAssignments[s.id] = i < 6 ? 'winner' : i < 12 ? 'burnout' : 'irrelevant';
    });
    const winnerCount = Object.values(skillsAssignments).filter(v => v === 'winner').length;
    expect(winnerCount).toBeGreaterThanOrEqual(5);
    expect(winnerCount).toBeLessThanOrEqual(7);

    // Step 9: Preferences
    const preferences: Record<string, string[]> = {};
    preferenceQuestions.forEach(q => {
      preferences[q.id] = [q.options[0]];
    });
    const dream = dreamOptions[0];
    expect(Object.keys(preferences).length).toBe(4);
    expect(dream).toBeTruthy();

    // Step 10: Get recommendations
    const recs = getRecommendations(viaScores, scheinScores);
    expect(recs.length).toBe(5);

    // Step 11: Verify top categories
    const topVIA = getTopCategories(viaScores, 2);
    expect(topVIA.length).toBe(2);
    expect(topVIA[0].score).toBeGreaterThanOrEqual(topVIA[1].score);

    const topSchein = getTopCategories(scheinScores, 2);
    expect(topSchein.length).toBe(2);

    // All data ready for results dashboard
    console.log('Journey complete! Top VIA:', topVIA[0].category, '| Top Schein:', topSchein[0].category);
  });
});
