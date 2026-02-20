import { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import ScheinQuestionnaire from '@/components/ScheinQuestionnaire';
import BonusSelection from '@/components/BonusSelection';
import ResultsDashboard from '@/components/ResultsDashboard';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import {
  type Answers,
  calculateCategoryScores,
  getMaxScoredQuestions,
  applyBonus,
} from '@/lib/scoring';

type Step = 'welcome' | 'via' | 'via-bonus' | 'schein' | 'schein-bonus' | 'results';

const STORAGE_KEY = 'sageify-state';

interface SavedState {
  step: Step;
  viaAnswers: Answers;
  scheinAnswers: Answers;
  viaBonusApplied: boolean;
  scheinBonusApplied: boolean;
  finalViaAnswers?: Answers;
  finalScheinAnswers?: Answers;
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    step: 'welcome',
    viaAnswers: {},
    scheinAnswers: {},
    viaBonusApplied: false,
    scheinBonusApplied: false,
  };
}

function saveState(state: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const Index = () => {
  const [state, setState] = useState<SavedState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (partial: Partial<SavedState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const handleViaAnswer = (id: number, score: number) => {
    updateState({ viaAnswers: { ...state.viaAnswers, [id]: score } });
  };

  const handleScheinAnswer = (id: number, score: number) => {
    updateState({ scheinAnswers: { ...state.scheinAnswers, [id]: score } });
  };

  const viaMaxQuestions = getMaxScoredQuestions(state.viaAnswers, viaQuestions);
  const scheinMaxQuestions = getMaxScoredQuestions(state.scheinAnswers, scheinQuestions);

  const handleViaBonusComplete = (selectedIds: number[]) => {
    const finalAnswers = applyBonus(state.viaAnswers, selectedIds);
    updateState({
      finalViaAnswers: finalAnswers,
      viaBonusApplied: true,
      step: 'schein',
    });
  };

  const handleScheinBonusComplete = (selectedIds: number[]) => {
    const finalAnswers = applyBonus(state.scheinAnswers, selectedIds);
    updateState({
      finalScheinAnswers: finalAnswers,
      scheinBonusApplied: true,
      step: 'results',
    });
  };

  const viaScores = calculateCategoryScores(
    state.finalViaAnswers || state.viaAnswers,
    viaQuestions,
    viaCategories
  );

  const scheinScores = calculateCategoryScores(
    state.finalScheinAnswers || state.scheinAnswers,
    scheinQuestions,
    scheinCategories
  );

  switch (state.step) {
    case 'welcome':
      return <WelcomeScreen onStart={() => updateState({ step: 'via' })} />;

    case 'via':
      return (
        <VIAQuestionnaire
          answers={state.viaAnswers}
          onAnswer={handleViaAnswer}
          onComplete={() => updateState({ step: 'via-bonus' })}
        />
      );

    case 'via-bonus':
      return (
        <BonusSelection
          title="כוח ה-3 – חוזקות VIA"
          subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם"
          questions={viaMaxQuestions}
          onComplete={handleViaBonusComplete}
        />
      );

    case 'schein':
      return (
        <ScheinQuestionnaire
          answers={state.scheinAnswers}
          onAnswer={handleScheinAnswer}
          onComplete={() => updateState({ step: 'schein-bonus' })}
        />
      );

    case 'schein-bonus':
      return (
        <BonusSelection
          title="כוח ה-3 – עוגנים תעסוקתיים"
          subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם"
          questions={scheinMaxQuestions}
          onComplete={handleScheinBonusComplete}
        />
      );

    case 'results':
      return <ResultsDashboard viaScores={viaScores} scheinScores={scheinScores} />;

    default:
      return <WelcomeScreen onStart={() => updateState({ step: 'via' })} />;
  }
};

export default Index;
