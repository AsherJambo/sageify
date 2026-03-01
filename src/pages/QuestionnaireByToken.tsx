import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cloudClient } from '@/lib/cloudClient';
import SectionIntro from '@/components/SectionIntro';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import ScheinQuestionnaire from '@/components/ScheinQuestionnaire';
import BonusSelection from '@/components/BonusSelection';
import ConsiderationsQuestionnaire from '@/components/ConsiderationsQuestionnaire';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import SkillsQuestionnaire from '@/components/SkillsQuestionnaire';
import PreferencesQuestionnaire from '@/components/PreferencesQuestionnaire';
import SageAdvisor from '@/components/SageAdvisor';
import ResultsDashboard from '@/components/ResultsDashboard';
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
import owlLogo from '@/assets/owl-logo.png';

type Step =
  | 'loading' | 'invalid' | 'used'
  | 'welcome'
  | 'general-intro'
  | 'via-intro' | 'via' | 'via-bonus-intro' | 'via-bonus'
  | 'schein-intro' | 'schein' | 'schein-bonus'
  | 'considerations-intro' | 'considerations'
  | 'holland-intro' | 'holland'
  | 'skills-intro' | 'skills'
  | 'preferences-intro' | 'preferences'
  | 'advisor'
  | 'results';

interface ResponseData {
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
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  chatMessages?: { role: 'user' | 'assistant'; content: string }[];
}

const defaultData: ResponseData = {
  step: 'welcome',
  viaAnswers: {},
  scheinAnswers: {},
  viaBonusApplied: false,
  scheinBonusApplied: false,
};

const STEP_PROGRESS: Record<Step, number> = {
  loading: 0, invalid: 0, used: 0, welcome: 0,
  'general-intro': 3,
  'via-intro': 6, 'via': 15, 'via-bonus-intro': 22, 'via-bonus': 25,
  'schein-intro': 28, 'schein': 40, 'schein-bonus': 45,
  'considerations-intro': 48, 'considerations': 55,
  'holland-intro': 58, 'holland': 68,
  'skills-intro': 72, 'skills': 80,
  'preferences-intro': 83, 'preferences': 85,
  'advisor': 85,
  'results': 100,
};

const QuestionnaireByToken = () => {
  const { token } = useParams<{ token: string }>();
  const [tokenRow, setTokenRow] = useState<{ id: string; username: string } | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [state, setState] = useState<ResponseData>(defaultData);
  const [pageState, setPageState] = useState<'loading' | 'invalid' | 'used' | 'ready'>('loading');
  const [advisorProgress, setAdvisorProgress] = useState(85);
  const supabase = cloudClient;

  // Validate token on mount
  useEffect(() => {
    if (!token) { setPageState('invalid'); return; }

    (async () => {
      const { data, error } = await supabase
        .from('questionnaire_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) { setPageState('invalid'); return; }
      if (data.completed_at) { setPageState('used'); return; }

      setTokenRow({ id: data.id, username: data.username });

      // Mark as used if first time
      if (!data.used) {
        await supabase.from('questionnaire_tokens').update({ used: true }).eq('id', data.id);
      }

      // Load existing response or create new
      const { data: existing } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('token_id', data.id)
        .single();

      if (existing) {
        setResponseId(existing.id);
        setState(existing.response_data as unknown as ResponseData);
      } else {
        const { data: newResp } = await supabase
          .from('questionnaire_responses')
          .insert([{ token_id: data.id, response_data: JSON.parse(JSON.stringify(defaultData)) }])
          .select()
          .single();
        if (newResp) setResponseId(newResp.id);
      }

      setPageState('ready');
    })();
  }, [token]);

  // Save progress on state change
  useEffect(() => {
    if (!responseId || pageState !== 'ready') return;
    supabase
      .from('questionnaire_responses')
      .update({ response_data: JSON.parse(JSON.stringify(state)) })
      .eq('id', responseId)
      .then();
  }, [state, responseId, pageState]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [state.step]);

  const updateState = (partial: Partial<ResponseData>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto animate-float" />
          <p className="text-muted-foreground text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">קישור לא תקין</h1>
          <p className="text-muted-foreground">הקישור שקיבלת אינו תקין או שפג תוקפו. פנה למנהל לקבלת קישור חדש.</p>
        </div>
      </div>
    );
  }

  if (pageState === 'used') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">השאלון כבר הושלם</h1>
          <p className="text-muted-foreground">השאלון הזה כבר מולא ואין אפשרות למלא אותו שוב.</p>
        </div>
      </div>
    );
  }

  // --- Questionnaire logic (same as Index.tsx) ---
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
    updateState({ finalViaAnswers: finalAnswers, viaBonusApplied: true, step: 'schein-intro' });
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

  const markComplete = async () => {
    if (tokenRow) {
      await supabase.from('questionnaire_tokens').update({ completed_at: new Date().toISOString() }).eq('id', tokenRow.id);
    }
  };

  const globalProgress = STEP_PROGRESS[state.step] || 0;
  const showProgressBar = globalProgress > 0 && state.step !== 'results';

  const ProgressBar = showProgressBar ? (
    <div className="fixed top-0 left-0 right-0 z-50 h-2 bg-muted/50 backdrop-blur-sm">
      <div
        className="h-full bg-primary rounded-l-full progress-bar-fill"
        style={{ width: `${globalProgress}%` }}
      />
    </div>
  ) : null;

  switch (state.step) {
    case 'welcome':
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-lg text-center space-y-6">
            <img src={owlLogo} alt="Sageify" className="w-36 h-36 mx-auto animate-float" />
            <h1 className="text-3xl font-bold text-foreground">
              שלום, <span className="text-accent">{tokenRow?.username}</span>! 🦉
            </h1>
            <p className="text-lg text-muted-foreground">ברוכים הבאים לשאלון Sageify. לחצו להתחיל.</p>
            <button
              onClick={() => updateState({ step: 'general-intro' })}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              בואו נתחיל! 🦉
            </button>
          </div>
        </div>
      );

    case 'general-intro':
      return <>{ProgressBar}<SectionIntro title={generalIntro.title} paragraphs={generalIntro.paragraphs} bulletPoints={generalIntro.bulletPoints} paragraphs2={generalIntro.paragraphs2} notes={generalIntro.notes} onContinue={() => updateState({ step: 'via-intro' })} buttonText="יוצאים לדרך! 🦉" /></>;
    case 'via-intro':
      return <>{ProgressBar}<SectionIntro badge={viaIntro.badge} title={viaIntro.title} paragraphs={viaIntro.paragraphs} onContinue={() => updateState({ step: 'via' })} /></>;
    case 'via':
      return <>{ProgressBar}<VIAQuestionnaire answers={state.viaAnswers} onAnswer={handleViaAnswer} onComplete={() => updateState({ step: 'via-bonus-intro' })} /></>;
    case 'via-bonus-intro':
      return <>{ProgressBar}<SectionIntro badge={viaBonusIntro.badge} title={viaBonusIntro.title} paragraphs={viaBonusIntro.paragraphs} onContinue={() => updateState({ step: 'via-bonus' })} /></>;
    case 'via-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – חוזקות VIA" subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם" questions={viaMaxQuestions} onComplete={handleViaBonusComplete} /></>;
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
      return <>{ProgressBar}<HollandQuestionnaire onComplete={(answers) => updateState({ hollandAnswers: answers, step: 'skills-intro' })} /></>;
    case 'skills-intro':
      return <>{ProgressBar}<SectionIntro badge={skillsIntro.badge} title={skillsIntro.title} paragraphs={skillsIntro.paragraphs} bulletPoints={skillsIntro.bulletPoints} onContinue={() => updateState({ step: 'skills' })} /></>;
    case 'skills':
      return <>{ProgressBar}<SkillsQuestionnaire onComplete={(assignments) => updateState({ skillsAssignments: assignments, step: 'preferences-intro' })} /></>;
    case 'preferences-intro':
      return <>{ProgressBar}<SectionIntro badge={preferencesIntro.badge} title={preferencesIntro.title} paragraphs={preferencesIntro.paragraphs} onContinue={() => updateState({ step: 'preferences' })} /></>;
    case 'preferences':
      return (
        <>{ProgressBar}<PreferencesQuestionnaire
          onComplete={(preferences, dream) => {
            updateState({ preferencesData: { preferences, dream }, step: 'results' });
            markComplete();
          }}
        /></>
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
      return null;
  }
};

export default QuestionnaireByToken;
