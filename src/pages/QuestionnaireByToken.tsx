import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { cloudClient } from '@/lib/cloudClient';
import { silentSaveInsights } from '@/lib/insightsSaver';
import { saveUserProfile } from '@/lib/profileManager';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionnaireHub from '@/components/QuestionnaireHub';
import SectionIntro from '@/components/SectionIntro';
import GameVIA from '@/components/games/GameVIA';
import GameSchein from '@/components/games/GameSchein';
import GameSkills from '@/components/games/GameSkills';
import GameConsiderations from '@/components/games/GameConsiderations';
import BonusSelection from '@/components/BonusSelection';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import ThinkingSkillsQuestionnaire from '@/components/ThinkingSkillsQuestionnaire';
import PreferencesQuestionnaire from '@/components/PreferencesQuestionnaire';
import MotivationQuestionnaire from '@/components/MotivationQuestionnaire';
import SageAdvisor from '@/components/SageAdvisor';
import ResultsDashboard from '@/components/ResultsDashboard';
import PersonalitySliders from '@/components/PersonalitySliders';
import DataProcessingAnimation from '@/components/DataProcessingAnimation';
import SageiInsightBubble from '@/components/SageiInsightBubble';
import SaveProgressButton from '@/components/SaveProgressButton';
import ScheduleMeetingCTA from '@/components/ScheduleMeetingCTA';
import MeetingBookingModal from '@/components/MeetingBookingModal';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import type { SkillColumn } from '@/data/skillsData';
import type { MotivationScores, IntentionAnswers } from '@/data/motivationQuestions';
import type { ThinkingResult } from '@/data/thinkingQuestions';
import {
  viaIntro, viaBonusIntro, scheinIntro,
  considerationsIntro, hollandIntro, skillsIntro, preferencesIntro, motivationIntro, thinkingIntro,
} from '@/data/sectionIntros';
import {
  type Answers, calculateCategoryScores, getMaxScoredQuestions, applyBonus,
} from '@/lib/scoring';
import owlLogo from '@/assets/owl-logo.png';

type Step =
  | 'loading' | 'invalid' | 'used'
  | 'landing' | 'welcome'
  | 'hub'
  | 'via-intro' | 'via' | 'via-bonus-intro' | 'via-bonus'
  | 'schein-intro' | 'schein' | 'schein-bonus'
  | 'considerations-intro' | 'considerations'
  | 'holland-intro' | 'holland'
  | 'skills-intro' | 'skills'
  | 'personality-sliders'
  | 'preferences-intro' | 'preferences'
  | 'motivation-intro' | 'motivation'
  | 'thinking-intro' | 'thinking'
  | 'processing'
  | 'advisor'
  | 'results';

type QuestionnaireSectionId = 'skills' | 'schein' | 'considerations' | 'holland' | 'via' | 'preferences' | 'motivation' | 'thinking';

const SECTION_FIRST_STEP: Record<QuestionnaireSectionId, Step> = {
  skills: 'skills',
  schein: 'schein',
  considerations: 'considerations',
  holland: 'holland',
  via: 'via',
  preferences: 'preferences',
  motivation: 'motivation',
  thinking: 'thinking',
};

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
  personalitySliders?: Record<string, number | string>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  motivationData?: { motivationScores: MotivationScores; intentionAnswers: IntentionAnswers };
  thinkingResult?: ThinkingResult;
  chatMessages?: { role: 'user' | 'assistant'; content: string }[];
}

const defaultData: ResponseData = {
  step: 'hub',
  viaAnswers: {},
  scheinAnswers: {},
  viaBonusApplied: false,
  scheinBonusApplied: false,
};


const QUESTIONNAIRE_STEPS: Step[] = [
  'skills-intro', 'skills', 'schein-intro', 'schein', 'schein-bonus',
  'considerations-intro', 'considerations', 'holland-intro', 'holland',
  'via-intro', 'via', 'via-bonus-intro', 'via-bonus',
  'personality-sliders', 'preferences-intro', 'preferences',
  'motivation-intro', 'motivation',
  'thinking-intro', 'thinking',
];

interface QuestionnaireByTokenProps {
  partnerOrg?: { org_name: string; logo_url: string | null; custom_welcome_message: string };
  demoMode?: boolean;
}

const QuestionnaireByToken = ({ partnerOrg, demoMode = false }: QuestionnaireByTokenProps = {}) => {
  const { token: paramToken } = useParams<{ token: string }>();
  const token = demoMode ? 'demo-full' : paramToken;
  const isAdminMode = typeof window !== 'undefined' && /[?&]admin=1\b/.test(window.location.hash + window.location.search);
  const [tokenRow, setTokenRow] = useState<{ id: string; username: string } | null>(demoMode ? { id: 'demo', username: 'אורח' } : null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [cloudSynced, setCloudSynced] = useState(demoMode ? true : false);
  const [cloudSyncFailed, setCloudSyncFailed] = useState(false);

  const stateStorageKey = token ? `sageify-state-${token}` : null;
  const chatStorageKey = token ? `sageify-chat-${token}` : null;

  // Lazy initializer — hydrate full state from localStorage synchronously so the
  // chat (and full progress) renders immediately on return, before the cloud round-trip.
  const [state, setState] = useState<ResponseData>(() => {
    if (typeof window === 'undefined' || !stateStorageKey) return defaultData;
    try {
      const raw = localStorage.getItem(stateStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.step === 'welcome' || parsed.step === 'landing') parsed.step = 'hub';
          return { ...defaultData, ...parsed } as ResponseData;
        }
      }
      // Fall back to chat-only mirror (older format)
      if (chatStorageKey) {
        const localChat = localStorage.getItem(chatStorageKey);
        if (localChat) {
          const chat = JSON.parse(localChat);
          if (Array.isArray(chat) && chat.length > 0) {
            return { ...defaultData, step: 'hub', chatMessages: chat } as ResponseData;
          }
        }
      }
    } catch { /* ignore */ }
    return defaultData;
  });

  // If localStorage already has state for this token, we can show the UI immediately
  // and let the cloud fetch overlay it asynchronously.
  const [pageState, setPageState] = useState<'loading' | 'invalid' | 'used' | 'ready'>(() => {
    if (demoMode) return 'ready';
    if (typeof window === 'undefined' || !stateStorageKey) return 'loading';
    try {
      const hasLocal = !!localStorage.getItem(stateStorageKey) || !!(chatStorageKey && localStorage.getItem(chatStorageKey));
      return hasLocal ? 'ready' : 'loading';
    } catch { return 'loading'; }
  });

  const [advisorProgress, setAdvisorProgress] = useState(85);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const supabase = cloudClient;

  // Validate token & overlay cloud data on mount
  useEffect(() => {
    if (demoMode) { setPageState('ready'); setCloudSynced(true); return; }
    if (!token) { setPageState('invalid'); return; }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('questionnaire_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (error || !data) { setPageState('invalid'); return; }
        if (data.completed_at && !isAdminMode) { setPageState('used'); return; }

        setTokenRow({ id: data.id, username: data.username });

        if (!data.used && !isAdminMode) {
          await supabase.from('questionnaire_tokens').update({ used: true }).eq('id', data.id);
        }

        const { data: existing } = await supabase
          .from('questionnaire_responses')
          .select('*')
          .eq('token_id', data.id)
          .single();

        if (existing) {
          setResponseId(existing.id);
          const loaded = existing.response_data as unknown as ResponseData;
          if (loaded.step === 'welcome' || loaded.step === 'landing') {
            loaded.step = 'hub';
          }
          // Merge with whatever is already on screen from localStorage —
          // prefer the longer chat history so we never overwrite a richer local copy.
          setState(prev => {
            const localChat = prev.chatMessages || [];
            const cloudChat = loaded.chatMessages || [];
            const chatMessages = localChat.length > cloudChat.length ? localChat : cloudChat;
            return { ...loaded, chatMessages };
          });
        } else {
          // No cloud record yet — push current (possibly local-hydrated) state up
          setState(prev => {
            const initial: ResponseData = prev && Object.keys(prev).length > 0
              ? { ...prev, step: prev.step === 'loading' || prev.step === 'invalid' || prev.step === 'used' ? 'hub' : prev.step }
              : { ...defaultData, step: 'hub' };
            supabase
              .from('questionnaire_responses')
              .insert([{ token_id: data.id, response_data: JSON.parse(JSON.stringify(initial)) }])
              .select()
              .single()
              .then(({ data: newResp }) => { if (newResp) setResponseId(newResp.id); });
            return initial;
          });
        }
      } catch (err) {
        console.error('Cloud sync error:', err);
        setCloudSyncFailed(true);
      } finally {
        setCloudSynced(true);
        setPageState(prev => (prev === 'loading' ? 'ready' : prev));
      }
    })();
  }, [token]);

  // Mirror full state + chat history to localStorage on every change
  useEffect(() => {
    if (!stateStorageKey || pageState === 'invalid' || pageState === 'used') return;
    try {
      localStorage.setItem(stateStorageKey, JSON.stringify(state));
      if (chatStorageKey && state.chatMessages && state.chatMessages.length > 0) {
        localStorage.setItem(chatStorageKey, JSON.stringify(state.chatMessages));
      }
    } catch { /* localStorage quota / privacy mode — fail silently */ }
  }, [state, stateStorageKey, chatStorageKey, pageState]);





  // Save progress on state change
  useEffect(() => {
    if (demoMode) return;
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

  // Sticky CTA scroll trigger — show after scrolling past the hero CTA
  useEffect(() => {
    if (state.step !== 'results') { setShowStickyCTA(false); return; }
    const onScroll = () => setShowStickyCTA(window.scrollY > 180);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [state.step]);

  const updateState = (partial: Partial<ResponseData>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const goToHub = () => updateState({ step: 'hub' });

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

  // --- Questionnaire logic ---
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
    motivation: !!state.motivationData,
    thinking: !!state.thinkingResult,
  };

  const markComplete = async () => {
    if (demoMode) return;
    if (tokenRow) {
      await supabase.from('questionnaire_tokens').update({ completed_at: new Date().toISOString() }).eq('id', tokenRow.id);
    }
  };

  const isQuestionnaireStep = QUESTIONNAIRE_STEPS.includes(state.step);
  const showProgressBar = isQuestionnaireStep || state.step === 'advisor';

  const ProgressBar = showProgressBar ? (
    <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/30 backdrop-blur-sm">
      <div
        className="h-full bg-secondary rounded-l-full progress-bar-fill"
        style={{ width: `${state.step === 'advisor' ? advisorProgress : 50}%` }}
      />
    </div>
  ) : null;

  const QuestionnaireSuffix = isQuestionnaireStep ? (
    <>
      <SageiInsightBubble progress={50} />
      <SaveProgressButton />
    </>
  ) : null;

  switch (state.step) {
    case 'landing':
      // Legacy state — skip the old landing screen and go straight to the compact welcome.
      updateState({ step: 'welcome' });
      return null;
    case 'welcome':
      return (
        <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
          <div className="max-w-md w-full text-center space-y-5">
            {partnerOrg?.logo_url ? (
              <div className="flex items-center justify-center gap-3">
                <img src={partnerOrg.logo_url} alt={partnerOrg.org_name} className="w-14 h-14 rounded-lg object-contain" />
                <span className="text-muted-foreground">×</span>
                <img src={owlLogo} alt="Sageify" className="w-14 h-14 rounded-full" />
              </div>
            ) : (
              <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto rounded-full shadow-[var(--shadow-elevated)]" />
            )}

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                שלום <span className="text-accent">{tokenRow?.username}</span> 👋
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                הקישור הזה נוצר עבורכם אישית.
                <br />
                לפני שמתחילים — אמתו את הזהות, וצוללים ישר לאבחון.
              </p>
            </div>

            <div className="space-y-2 text-right">
              <label className="block text-sm font-semibold text-foreground">מספר תעודת זהות</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="הזינו ת.ז"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px]"
                maxLength={9}
              />
              <p className="text-xs text-muted-foreground text-center">
                🔒 משמש לזיהוי בלבד — נשמר באופן מאובטח ואינו משותף.
              </p>
            </div>

            <button
              onClick={async () => {
                if (idNumber.length < 5) {
                  toast.error('יש להזין מספר ת.ז תקין');
                  return;
                }
                if (tokenRow) {
                  await supabase.from('questionnaire_tokens').update({ id_number: idNumber } as any).eq('id', tokenRow.id);
                }
                updateState({ step: 'hub' });
              }}
              disabled={idNumber.length < 5}
              className="w-full px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold font-display tracking-wide hover:bg-primary/85 transition-all shadow-[var(--shadow-elevated)] disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
            >
              לאבחון ←
            </button>
          </div>
        </div>
      );

    case 'hub':
      return (
        <QuestionnaireHub
          completedSections={completedSections}
          minimumRequired={demoMode ? 0 : 3}
          onSelect={(id) => updateState({ step: SECTION_FIRST_STEP[id] })}
          onViewResults={() => {
            // Save user profile before processing
            if (!demoMode && tokenRow && state.preferencesData) {
              saveUserProfile({
                tokenId: tokenRow.id,
                psychometricScores: { ...viaScores, ...scheinScores, ...hollandScores },
                primaryInterests: Object.values(state.preferencesData.preferences).flat(),
                personalitySliders: state.personalitySliders as Record<string, number> | undefined,
                valueAlignment: (state.personalitySliders?.values as string)?.split(',') || [],
              });
            }
            updateState({ step: 'processing' });
          }}
        />
      );

    // Skills flow
    case 'skills-intro':
      return <>{ProgressBar}<SectionIntro badge={skillsIntro.badge} title={skillsIntro.title} paragraphs={skillsIntro.paragraphs} bulletPoints={skillsIntro.bulletPoints} exampleQuestions={skillsIntro.exampleQuestions} answerKey={skillsIntro.answerKey} onContinue={() => updateState({ step: 'skills' })} />{QuestionnaireSuffix}</>;
    case 'skills':
      return <>{ProgressBar}<GameSkills onComplete={(assignments) => updateState({ skillsAssignments: assignments, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Schein flow
    case 'schein-intro':
      return <>{ProgressBar}<SectionIntro badge={scheinIntro.badge} title={scheinIntro.title} paragraphs={scheinIntro.paragraphs} exampleQuestions={scheinIntro.exampleQuestions} answerKey={scheinIntro.answerKey} onContinue={() => updateState({ step: 'schein' })} />{QuestionnaireSuffix}</>;
    case 'schein':
      return <>{ProgressBar}<GameSchein onComplete={(finalAnswers, _bonusIds) => updateState({ scheinAnswers: finalAnswers, finalScheinAnswers: finalAnswers, scheinBonusApplied: true, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;
    case 'schein-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – עוגנים תעסוקתיים" subtitle="מתוך השאלות שנתתם להן את הציון הגבוה ביותר, בחרו 3 שהכי מהדהדות אצלכם" questions={scheinMaxQuestions} onComplete={handleScheinBonusComplete} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Considerations flow
    case 'considerations-intro':
      return <>{ProgressBar}<SectionIntro badge={considerationsIntro.badge} title={considerationsIntro.title} paragraphs={considerationsIntro.paragraphs} exampleQuestions={considerationsIntro.exampleQuestions} answerKey={considerationsIntro.answerKey} onContinue={() => updateState({ step: 'considerations' })} />{QuestionnaireSuffix}</>;
    case 'considerations':
      return <>{ProgressBar}<GameConsiderations onComplete={(selected, points) => updateState({ considerationsData: { selected, points }, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Holland flow
    case 'holland-intro':
      return <>{ProgressBar}<SectionIntro badge={hollandIntro.badge} title={hollandIntro.title} paragraphs={hollandIntro.paragraphs} exampleQuestions={hollandIntro.exampleQuestions} answerKey={hollandIntro.answerKey} onContinue={() => updateState({ step: 'holland' })} />{QuestionnaireSuffix}</>;
    case 'holland':
      return <>{ProgressBar}<HollandQuestionnaire onComplete={(answers) => updateState({ hollandAnswers: answers, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // VIA flow
    case 'via-intro':
      return <>{ProgressBar}<SectionIntro badge={viaIntro.badge} title={viaIntro.title} paragraphs={viaIntro.paragraphs} exampleQuestions={viaIntro.exampleQuestions} answerKey={viaIntro.answerKey} onContinue={() => updateState({ step: 'via' })} />{QuestionnaireSuffix}</>;
    case 'via':
      return <>{ProgressBar}<GameVIA onComplete={(finalAnswers, _bonusIds) => updateState({ viaAnswers: finalAnswers, finalViaAnswers: finalAnswers, viaBonusApplied: true, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;
    case 'via-bonus-intro':
      return <>{ProgressBar}<SectionIntro badge={viaBonusIntro.badge} title={viaBonusIntro.title} paragraphs={viaBonusIntro.paragraphs} onContinue={() => updateState({ step: 'via-bonus' })} />{QuestionnaireSuffix}</>;
    case 'via-bonus':
      return <>{ProgressBar}<BonusSelection title="כוח ה-3 – חוזקות VIA" subtitle="מתוך השאלות שנתת להן את הציון הגבוה ביותר, בחר 3 שהכי מהדהדות או מדויקות לגביך" questions={viaMaxQuestions} onComplete={handleViaBonusComplete} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Preferences flow
    case 'preferences-intro':
      return <>{ProgressBar}<SectionIntro badge={preferencesIntro.badge} title={preferencesIntro.title} paragraphs={preferencesIntro.paragraphs} exampleQuestions={preferencesIntro.exampleQuestions} answerKey={preferencesIntro.answerKey} onContinue={() => updateState({ step: 'personality-sliders' })} />{QuestionnaireSuffix}</>;
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

    // Motivation flow
    case 'motivation-intro':
      return <>{ProgressBar}<SectionIntro badge={motivationIntro.badge} title={motivationIntro.title} paragraphs={motivationIntro.paragraphs} bulletPoints={motivationIntro.bulletPoints} exampleQuestions={motivationIntro.exampleQuestions} answerKey={motivationIntro.answerKey} onContinue={() => updateState({ step: 'motivation' })} />{QuestionnaireSuffix}</>;
    case 'motivation':
      return <>{ProgressBar}<MotivationQuestionnaire onComplete={(motivationScores, intentionAnswers) => updateState({ motivationData: { motivationScores, intentionAnswers }, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    // Thinking flow
    case 'thinking-intro':
      return <>{ProgressBar}<SectionIntro badge={thinkingIntro.badge} title={thinkingIntro.title} paragraphs={thinkingIntro.paragraphs} exampleQuestions={thinkingIntro.exampleQuestions} answerKey={thinkingIntro.answerKey} onContinue={() => updateState({ step: 'thinking' })} />{QuestionnaireSuffix}</>;
    case 'thinking':
      return <>{ProgressBar}<ThinkingSkillsQuestionnaire onComplete={(result) => updateState({ thinkingResult: result, step: 'hub' })} onBackToHub={goToHub} />{QuestionnaireSuffix}</>;

    case 'processing':
      return <DataProcessingAnimation onComplete={() => {
        markComplete();
        updateState({ step: 'advisor' });
      }} />;
    case 'advisor':
      return (
        <>
          {ProgressBar}
          <SageAdvisor
            username={tokenRow?.username}
            tokenId={tokenRow?.id}
            viaScores={viaScores}
            scheinScores={scheinScores}
            hollandScores={hollandScores}
            considerationsData={state.considerationsData}
            skillsAssignments={state.skillsAssignments}
            preferencesData={state.preferencesData}
            thinkingResult={state.thinkingResult}
            initialMessages={state.chatMessages}
            onMessagesChange={(msgs) => updateState({ chatMessages: msgs })}
            onRoadmapReady={() => setAdvisorProgress(100)}
            isSyncing={!cloudSynced}
            cloudSyncFailed={cloudSyncFailed}
            onFinish={() => {
              markComplete();
              if (!demoMode && tokenRow) {
                silentSaveInsights({
                  tokenId: tokenRow.id,
                  viaScores, scheinScores, hollandScores,
                  considerationsData: state.considerationsData,
                  skillsAssignments: state.skillsAssignments,
                  preferencesData: state.preferencesData,
                  chatMessages: state.chatMessages,
                });
              }
              updateState({ step: 'results' });
            }}
          />
        </>
      );
    case 'results':
      return (
        <>
          <div className="px-3 sm:px-4 pt-4">
            <ScheduleMeetingCTA variant="banner" />
          </div>
          <ResultsDashboard
            viaScores={viaScores}
            scheinScores={scheinScores}
            hollandScores={hollandScores}
            considerationsData={state.considerationsData}
            skillsAssignments={state.skillsAssignments}
            preferencesData={state.preferencesData}
            motivationData={state.motivationData}
            thinkingResult={state.thinkingResult}
            chatMessages={state.chatMessages}
            onChatMessagesChange={(msgs) => updateState({ chatMessages: msgs })}
            onBackToHub={() => updateState({ step: 'hub' })}
            tokenId={tokenRow?.id}
          />
          <div className="px-3 sm:px-4 pb-12">
            <ScheduleMeetingCTA variant="banner" />
          </div>
        </>
      );
    default:
      return null;
  }
};

export default QuestionnaireByToken;
