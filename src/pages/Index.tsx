import { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import SectionIntro from '@/components/SectionIntro';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import ScheinQuestionnaire from '@/components/ScheinQuestionnaire';
import PersonalitySliders from '@/components/PersonalitySliders';
import DataProcessingAnimation from '@/components/DataProcessingAnimation';
import BonusSelection from '@/components/BonusSelection';
import ConsiderationsQuestionnaire from '@/components/ConsiderationsQuestionnaire';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import SkillsQuestionnaire from '@/components/SkillsQuestionnaire';
import PreferencesQuestionnaire from '@/components/PreferencesQuestionnaire';
import ResultsDashboard from '@/components/ResultsDashboard';
import SageAdvisor from '@/components/SageAdvisor';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import type { SkillColumn } from '@/data/skillsData';
import {
  generalIntro, viaIntro, viaBonusIntro, scheinIntro,
  considerationsIntro, hollandIntro, skillsIntro, preferencesIntro,
} from '@/data/sectionIntros';
import {
  type Answers, calculateCategoryScores, getMaxScoredQuestions, applyBonus,
} from '@/lib/scoring';
import type { ChatMessage } from '@/components/OwlChat';

type Step =
  | 'welcome'
  | 'general-intro'
  | 'via-intro' | 'via' | 'via-bonus-intro' | 'via-bonus'
  | 'schein-intro' | 'schein' | 'schein-bonus'
  | 'considerations-intro' | 'considerations'
  | 'holland-intro' | 'holland'
  | 'skills-intro' | 'skills'
  | 'personality-sliders'
  | 'preferences-intro' | 'preferences'
  | 'processing'
  | 'advisor'
  | 'results';

const STORAGE_KEY = 'sageify-state';

interface SavedState {
  step: Step;
  viaAnswers: Answers;
  scheinAnswers: Answers;
  viaBonusApplied: boolean;
  scheinBonusApplied: boolean;
  finalViaAnswers?: Answers;
  finalScheinAnswers?: Answers;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  hollandAnswers?: Record<number, boolean>;
  skillsAssignments?: Record<number, SkillColumn>;
  personalitySliders?: Record<string, number | string>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  chatMessages?: ChatMessage[];
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

const STEP_PROGRESS: Record<Step, number> = {
  welcome: 0,
  'general-intro': 3,
  'skills-intro': 6, 'skills': 15,
  'schein-intro': 20, 'schein': 32, 'schein-bonus': 37,
  'considerations-intro': 40, 'considerations': 48,
  'holland-intro': 52, 'holland': 62,
  'via-intro': 66, 'via': 75, 'via-bonus-intro': 78, 'via-bonus': 80,
  'personality-sliders': 82,
  'preferences-intro': 83, 'preferences': 85,
  'processing': 88,
  'advisor': 90,
  'results': 100,
};

const Index = () => {
  const [state, setState] = useState<SavedState>(loadState);
  const [advisorProgress, setAdvisorProgress] = useState(85);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);

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
    updateState({ finalViaAnswers: finalAnswers, viaBonusApplied: true, step: 'personality-sliders' });
  };
  const handleScheinBonusComplete = (selectedIds: number[]) => {
    const finalAnswers = applyBonus(state.scheinAnswers, selectedIds);
    updateState({ finalScheinAnswers: finalAnswers, scheinBonusApplied: true, step: 'considerations-intro' });
  };

  const viaScores = calculateCategoryScores(state.finalViaAnswers || state.viaAnswers, viaQuestions, viaCategories);
  const scheinScores = calculateCategoryScores(state.finalScheinAnswers || state.scheinAnswers, scheinQuestions, scheinCategories);

  const hollandScores: Record<string, number> = {};
  if (state.hollandAnswers) {
    hollandCategories.forEach(cat => { hollandScores[cat] = 0; });
    Object.entries(state.hollandAnswers).forEach(([id, val]) => {
      if (val) {
        const q = hollandQuestions.find(q => q.id === Number(id));
        if (q && hollandScores[q.category] !== undefined) hollandScores[q.category] += 1;
      }
    });
  }

  const globalProgress = state.step === 'advisor' ? advisorProgress : (STEP_PROGRESS[state.step] || 0);
  const showProgressBar = globalProgress > 0 && state.step !== 'results';

  const ProgressBar = showProgressBar ? (
    <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/30 backdrop-blur-sm">
      <div className="h-full bg-secondary rounded-l-full progress-bar-fill" style={{ width: `${globalProgress}%` }} />
    </div>
  ) : null;

  switch (state.step) {
    case 'welcome':
      return <WelcomeScreen onStart={() => updateState({ step: 'general-intro' })} />;
    case 'general-intro':
      return <>{ProgressBar}<SectionIntro title={generalIntro.title} paragraphs={generalIntro.paragraphs} bulletPoints={generalIntro.bulletPoints} paragraphs2={generalIntro.paragraphs2} notes={generalIntro.notes} onContinue={() => updateState({ step: 'skills-intro' })} buttonText="← יוצאים לדרך!" /></>;
    case 'skills-intro':
      return <>{ProgressBar}<SectionIntro badge={skillsIntro.badge} title={skillsIntro.title} paragraphs={skillsIntro.paragraphs} bulletPoints={skillsIntro.bulletPoints} onContinue={() => updateState({ step: 'skills' })} /></>;
    case 'skills':
      return <>{ProgressBar}<SkillsQuestionnaire onComplete={(assignments) => updateState({ skillsAssignments: assignments, step: 'schein-intro' })} /></>;
    case 'schein-intro':
      return <>{ProgressBar}<SectionIntro badge={scheinIntro.badge} title={scheinIntro.title} paragraphs={scheinIntro.paragraphs} onContinue={() => updateState({ step: 'schein' })} /></>;
    case 'schein':
      return <>{ProgressBar}<ScheinQuestionnaire answers={state.scheinAnswers} onAnswer={handleScheinAnswer} onComplete={() => updateState({ step: 'schein-bonus' })} /></>;
    case 'schein-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – עוגנים תעסוקתיים" subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם" questions={scheinMaxQuestions} onComplete={handleScheinBonusComplete} /></>;
    case 'considerations-intro':
      return <>{ProgressBar}<SectionIntro badge={considerationsIntro.badge} title={considerationsIntro.title} paragraphs={considerationsIntro.paragraphs} onContinue={() => updateState({ step: 'considerations' })} /></>;
    case 'considerations':
      return <>{ProgressBar}<ConsiderationsQuestionnaire onComplete={(selected, points) => updateState({ considerationsData: { selected, points }, step: 'holland-intro' })} /></>;
    case 'holland-intro':
      return <>{ProgressBar}<SectionIntro badge={hollandIntro.badge} title={hollandIntro.title} paragraphs={hollandIntro.paragraphs} onContinue={() => updateState({ step: 'holland' })} /></>;
    case 'holland':
      return <>{ProgressBar}<HollandQuestionnaire onComplete={(answers) => updateState({ hollandAnswers: answers, step: 'via-intro' })} /></>;
    case 'via-intro':
      return <>{ProgressBar}<SectionIntro badge={viaIntro.badge} title={viaIntro.title} paragraphs={viaIntro.paragraphs} onContinue={() => updateState({ step: 'via' })} /></>;
    case 'via':
      return <>{ProgressBar}<VIAQuestionnaire answers={state.viaAnswers} onAnswer={handleViaAnswer} onComplete={() => updateState({ step: 'via-bonus-intro' })} /></>;
    case 'via-bonus-intro':
      return <>{ProgressBar}<SectionIntro badge={viaBonusIntro.badge} title={viaBonusIntro.title} paragraphs={viaBonusIntro.paragraphs} onContinue={() => updateState({ step: 'via-bonus' })} /></>;
    case 'via-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – חוזקות VIA" subtitle="מתוך השאלות שנתת להן את הציון הגבוה ביותר, בחר 3 שהכי מהדהדות או מדויקות לגביך" questions={viaMaxQuestions} onComplete={handleViaBonusComplete} /></>;
    case 'personality-sliders':
      return <>{ProgressBar}<PersonalitySliders onComplete={(sliders) => updateState({ personalitySliders: sliders, step: 'preferences-intro' })} /></>;
    case 'preferences-intro':
      return <>{ProgressBar}<SectionIntro badge={preferencesIntro.badge} title={preferencesIntro.title} paragraphs={preferencesIntro.paragraphs} onContinue={() => updateState({ step: 'preferences' })} /></>;
    case 'preferences':
      return (
        <>{ProgressBar}<PreferencesQuestionnaire
          onComplete={(preferences, dream) => {
            updateState({ preferencesData: { preferences, dream }, step: 'processing' });
          }}
        /></>
      );
    case 'advisor':
      return (
        <>
          {ProgressBar}
          <SageAdvisor
            viaScores={viaScores}
            scheinScores={scheinScores}
            hollandScores={hollandScores}
            considerationsData={state.considerationsData}
            skillsAssignments={state.skillsAssignments}
            preferencesData={state.preferencesData}
            initialMessages={state.chatMessages}
            onMessagesChange={(msgs) => updateState({ chatMessages: msgs })}
            onRoadmapReady={() => setAdvisorProgress(100)}
            onFinish={() => updateState({ step: 'results' })}
          />
        </>
      );
    case 'results':
      return (
        <ResultsDashboard
          viaScores={viaScores}
          scheinScores={scheinScores}
          hollandScores={hollandScores}
          considerationsData={state.considerationsData}
          skillsAssignments={state.skillsAssignments}
          preferencesData={state.preferencesData}
          chatMessages={state.chatMessages}
          onChatMessagesChange={(msgs) => updateState({ chatMessages: msgs })}
        />
      );
    default:
      return <WelcomeScreen onStart={() => updateState({ step: 'general-intro' })} />;
  }
};

export default Index;
