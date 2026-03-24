import { useState, useEffect } from 'react';
import { contextualFeedback } from '@/lib/owlMessages';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionnaireHub from '@/components/QuestionnaireHub';
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
import MotivationQuestionnaire from '@/components/MotivationQuestionnaire';
import ResultsDashboard from '@/components/ResultsDashboard';
import SageAdvisor from '@/components/SageAdvisor';
import SageiInsightBubble from '@/components/SageiInsightBubble';
import SaveProgressButton from '@/components/SaveProgressButton';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import type { SkillColumn } from '@/data/skillsData';
import type { MotivationScores, IntentionAnswers } from '@/data/motivationQuestions';
import {
  viaIntro, viaBonusIntro, scheinIntro,
  considerationsIntro, hollandIntro, skillsIntro, preferencesIntro, motivationIntro,
} from '@/data/sectionIntros';
import {
  type Answers, calculateCategoryScores, getMaxScoredQuestions, applyBonus,
} from '@/lib/scoring';
import type { ChatMessage } from '@/components/OwlChat';

type Step =
  | 'welcome'
  | 'hub'
  | 'skills-intro' | 'skills'
  | 'schein-intro' | 'schein' | 'schein-bonus'
  | 'considerations-intro' | 'considerations'
  | 'holland-intro' | 'holland'
  | 'via-intro' | 'via' | 'via-bonus-intro' | 'via-bonus'
  | 'personality-sliders'
  | 'preferences-intro' | 'preferences'
  | 'motivation-intro' | 'motivation'
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
  motivationData?: { motivationScores: MotivationScores; intentionAnswers: IntentionAnswers };
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

type QuestionnaireSectionId = 'skills' | 'schein' | 'considerations' | 'holland' | 'via' | 'preferences';

const SECTION_FIRST_STEP: Record<QuestionnaireSectionId, Step> = {
  skills: 'skills-intro',
  schein: 'schein-intro',
  considerations: 'considerations-intro',
  holland: 'holland-intro',
  via: 'via-intro',
  preferences: 'preferences-intro',
};

const QUESTIONNAIRE_STEPS: Step[] = [
  'skills-intro', 'skills', 'schein-intro', 'schein', 'schein-bonus',
  'considerations-intro', 'considerations', 'holland-intro', 'holland',
  'via-intro', 'via', 'via-bonus-intro', 'via-bonus',
  'personality-sliders', 'preferences-intro', 'preferences',
];

const Index = () => {
  const [state, setState] = useState<SavedState>(loadState);
  const [advisorProgress, setAdvisorProgress] = useState(85);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);

  const updateState = (partial: Partial<SavedState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const goToHub = () => updateState({ step: 'hub' });

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
    updateState({ finalViaAnswers: finalAnswers, viaBonusApplied: true, step: 'hub' });
  };
  const handleScheinBonusComplete = (selectedIds: number[]) => {
    const finalAnswers = applyBonus(state.scheinAnswers, selectedIds);
    updateState({ finalScheinAnswers: finalAnswers, scheinBonusApplied: true, step: 'hub' });
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

  const completedSections = {
    skills: !!state.skillsAssignments,
    schein: state.scheinBonusApplied,
    considerations: !!state.considerationsData,
    holland: !!state.hollandAnswers,
    via: state.viaBonusApplied,
    preferences: !!state.preferencesData && !!state.personalitySliders,
  };

  const isQuestionnaireStep = QUESTIONNAIRE_STEPS.includes(state.step);
  const showProgressBar = isQuestionnaireStep || state.step === 'advisor';

  const ProgressBar = showProgressBar ? (
    <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/30 backdrop-blur-sm">
      <div className="h-full bg-secondary rounded-l-full progress-bar-fill" style={{ width: `${state.step === 'advisor' ? advisorProgress : 50}%` }} />
    </div>
  ) : null;

  const QuestionnaireSuffix = isQuestionnaireStep ? (
    <>
      <SageiInsightBubble progress={50} />
      <SaveProgressButton />
    </>
  ) : null;

  switch (state.step) {
    case 'welcome':
      return <WelcomeScreen onStart={() => updateState({ step: 'hub' })} />;
    case 'hub':
      return (
        <QuestionnaireHub
          completedSections={completedSections}
          onSelect={(id) => updateState({ step: SECTION_FIRST_STEP[id] })}
          onViewResults={() => updateState({ step: 'processing' })}
        />
      );

    // Skills flow
    case 'skills-intro':
      return <>{ProgressBar}<SectionIntro badge={skillsIntro.badge} title={skillsIntro.title} paragraphs={skillsIntro.paragraphs} bulletPoints={skillsIntro.bulletPoints} onContinue={() => updateState({ step: 'skills' })} />{QuestionnaireSuffix}</>;
    case 'skills':
      return <>{ProgressBar}<SkillsQuestionnaire onComplete={(assignments) => updateState({ skillsAssignments: assignments, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Schein flow
    case 'schein-intro':
      return <>{ProgressBar}<SectionIntro badge={scheinIntro.badge} title={scheinIntro.title} paragraphs={scheinIntro.paragraphs} onContinue={() => updateState({ step: 'schein' })} />{QuestionnaireSuffix}</>;
    case 'schein':
      return <>{ProgressBar}<ScheinQuestionnaire answers={state.scheinAnswers} onAnswer={handleScheinAnswer} onComplete={() => updateState({ step: 'schein-bonus' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;
    case 'schein-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – עוגנים תעסוקתיים" subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם" questions={scheinMaxQuestions} onComplete={handleScheinBonusComplete} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Considerations flow
    case 'considerations-intro':
      return <>{ProgressBar}<SectionIntro badge={considerationsIntro.badge} title={considerationsIntro.title} paragraphs={considerationsIntro.paragraphs} onContinue={() => updateState({ step: 'considerations' })} />{QuestionnaireSuffix}</>;
    case 'considerations':
      return <>{ProgressBar}<ConsiderationsQuestionnaire onComplete={(selected, points) => updateState({ considerationsData: { selected, points }, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Holland flow
    case 'holland-intro':
      return <>{ProgressBar}<SectionIntro badge={hollandIntro.badge} title={hollandIntro.title} paragraphs={hollandIntro.paragraphs} onContinue={() => updateState({ step: 'holland' })} />{QuestionnaireSuffix}</>;
    case 'holland':
      return <>{ProgressBar}<HollandQuestionnaire onComplete={(answers) => updateState({ hollandAnswers: answers, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // VIA flow
    case 'via-intro':
      return <>{ProgressBar}<SectionIntro badge={viaIntro.badge} title={viaIntro.title} paragraphs={viaIntro.paragraphs} onContinue={() => updateState({ step: 'via' })} />{QuestionnaireSuffix}</>;
    case 'via':
      return <>{ProgressBar}<VIAQuestionnaire answers={state.viaAnswers} onAnswer={handleViaAnswer} onComplete={() => updateState({ step: 'via-bonus-intro' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;
    case 'via-bonus-intro':
      return <>{ProgressBar}<SectionIntro badge={viaBonusIntro.badge} title={viaBonusIntro.title} paragraphs={viaBonusIntro.paragraphs} onContinue={() => updateState({ step: 'via-bonus' })} />{QuestionnaireSuffix}</>;
    case 'via-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – חוזקות VIA" subtitle="מתוך השאלות שנתת להן את הציון הגבוה ביותר, בחר 3 שהכי מהדהדות או מדויקות לגביך" questions={viaMaxQuestions} onComplete={handleViaBonusComplete} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Preferences flow (includes personality sliders)
    case 'preferences-intro':
      return <>{ProgressBar}<SectionIntro badge={preferencesIntro.badge} title={preferencesIntro.title} paragraphs={preferencesIntro.paragraphs} onContinue={() => updateState({ step: 'personality-sliders' })} />{QuestionnaireSuffix}</>;
    case 'personality-sliders':
      return <>{ProgressBar}<PersonalitySliders onComplete={(sliders) => updateState({ personalitySliders: sliders, step: 'preferences' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;
    case 'preferences':
      return (
        <>{ProgressBar}<PreferencesQuestionnaire
          onComplete={(preferences, dream) => {
            updateState({ preferencesData: { preferences, dream }, step: 'hub' });
          }}
          onBackToHub={goToHub}
        />{QuestionnaireSuffix}</>
      );

    case 'processing':
      return <DataProcessingAnimation onComplete={() => updateState({ step: 'advisor' })} />;
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
          onBackToHub={() => updateState({ step: 'hub' })}
        />
      );
    default:
      return <WelcomeScreen onStart={() => updateState({ step: 'hub' })} />;
  }
};

export default Index;
