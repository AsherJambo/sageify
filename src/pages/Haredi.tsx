import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { celebrationConfetti, sparkleConfetti } from '@/lib/confetti';

import QuestionnaireHub from '@/components/QuestionnaireHub';
import SectionIntro from '@/components/SectionIntro';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import ScheinQuestionnaire from '@/components/ScheinQuestionnaire';
import PersonalitySliders from '@/components/PersonalitySliders';
import BonusSelection from '@/components/BonusSelection';
import ConsiderationsQuestionnaire from '@/components/ConsiderationsQuestionnaire';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import ThinkingSkillsQuestionnaire from '@/components/ThinkingSkillsQuestionnaire';
import SkillsQuestionnaire from '@/components/SkillsQuestionnaire';
import PreferencesQuestionnaire from '@/components/PreferencesQuestionnaire';
import MotivationQuestionnaire from '@/components/MotivationQuestionnaire';
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

// ============ TRACKS ============
type TrackId = 'electricity' | 'software' | 'construction' | 'machinery' | 'auto' | 'medical_devices' | 'health_support';

const TRACKS: Record<TrackId, { name: string; tagline: string; emoji: string }> = {
  electricity: { name: 'חשמלאות', tagline: 'מקצוע יציב, ביקוש גבוה, אפשרות לעצמאות', emoji: '⚡' },
  software: { name: 'תוכנה', tagline: 'שכר גבוה, עבודה מהבית, ביקוש בינלאומי', emoji: '💻' },
  construction: { name: 'בניין', tagline: 'התמחויות מבוקשות, צמיחה לקבלנות', emoji: '🏗️' },
  machinery: { name: 'מכונות ו-CNC', tagline: 'תעשייה מתקדמת, דיוק ומקצועיות', emoji: '⚙️' },
  auto: { name: 'מוסכים ורכב', tagline: 'עצמאות מהירה, שירות תמידי בביקוש', emoji: '🚗' },
  medical_devices: { name: 'מכשור רפואי', tagline: 'הייטק רפואי, שילוב טכנולוגיה ועזרה לזולת', emoji: '🩺' },
  health_support: { name: 'תומכי נפש במערכת הבריאות', tagline: 'עזרה משמעותית לאנשים, סביבה שקטה', emoji: '💚' },
};

const TRACK_IDS: TrackId[] = ['electricity', 'software', 'construction', 'machinery', 'auto', 'medical_devices', 'health_support'];

// ============ STEPS ============
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
  | 'thinking-intro' | 'thinking'
  | 'loading'
  | 'results';

const STORAGE_KEY = 'sageify-haredi-state';

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
  thinkingResult?: ThinkingResult;
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

type QSection = 'skills' | 'schein' | 'considerations' | 'holland' | 'via' | 'preferences' | 'motivation' | 'thinking';

const SECTION_FIRST_STEP: Record<QSection, Step> = {
  skills: 'skills-intro',
  schein: 'schein-intro',
  considerations: 'considerations-intro',
  holland: 'holland-intro',
  via: 'via-intro',
  preferences: 'preferences-intro',
  motivation: 'motivation-intro',
  thinking: 'thinking-intro',
};

interface AIExplanation {
  name: string;
  why: string;
  dayInLife: string;
  firstStep: string;
}

const Haredi = () => {
  const [state, setState] = useState<SavedState>(loadState);
  const [topTracks, setTopTracks] = useState<TrackId[]>([]);
  const [explanations, setExplanations] = useState<AIExplanation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);

  const update = (partial: Partial<SavedState>) => setState(p => ({ ...p, ...partial }));
  const goToHub = () => update({ step: 'hub' });

  const handleViaAnswer = (id: number, score: number) => update({ viaAnswers: { ...state.viaAnswers, [id]: score } });
  const handleScheinAnswer = (id: number, score: number) => update({ scheinAnswers: { ...state.scheinAnswers, [id]: score } });

  const viaMaxQuestions = getMaxScoredQuestions(state.viaAnswers, viaQuestions);
  const scheinMaxQuestions = getMaxScoredQuestions(state.scheinAnswers, scheinQuestions);

  const handleViaBonusComplete = (selectedIds: number[]) => {
    update({ finalViaAnswers: applyBonus(state.viaAnswers, selectedIds), viaBonusApplied: true, step: 'hub' });
  };
  const handleScheinBonusComplete = (selectedIds: number[]) => {
    update({ finalScheinAnswers: applyBonus(state.scheinAnswers, selectedIds), scheinBonusApplied: true, step: 'hub' });
  };

  const completedSections: Record<QSection, boolean> = {
    skills: !!state.skillsAssignments,
    schein: state.scheinBonusApplied,
    considerations: !!state.considerationsData,
    holland: !!state.hollandAnswers,
    via: state.viaBonusApplied,
    preferences: !!state.preferencesData && !!state.personalitySliders,
    motivation: !!state.motivationData,
    thinking: !!state.thinkingResult,
  };

  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const hasMinimum = completedCount >= 3;

  const buildProfile = useMemo(() => () => {
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

    return {
      via: viaScores,
      schein: scheinScores,
      holland: hollandScores,
      considerations: state.considerationsData,
      skills: state.skillsAssignments,
      preferences: state.preferencesData,
      personality: state.personalitySliders,
      motivation: state.motivationData,
      thinking: state.thinkingResult ? { level: state.thinkingResult.levelLabel, score: state.thinkingResult.totalCorrect } : undefined,
    };
  }, [state]);

  // Heuristic ranking of 7 tracks based on Holland + scores
  const rankTracks = (): TrackId[] => {
    const profile = buildProfile();
    const scores: Record<TrackId, number> = {
      electricity: 0, software: 0, construction: 0, machinery: 0, auto: 0, medical_devices: 0, health_support: 0,
    };
    const h = profile.holland || {};
    // Realistic (R)
    scores.electricity += (h['ביצועי (R)'] || 0) * 2.5;
    scores.construction += (h['ביצועי (R)'] || 0) * 2.5;
    scores.auto += (h['ביצועי (R)'] || 0) * 2.5;
    scores.machinery += (h['ביצועי (R)'] || 0) * 2;
    // Investigative (I)
    scores.software += (h['חקרני (I)'] || 0) * 3;
    scores.medical_devices += (h['חקרני (I)'] || 0) * 2.5;
    scores.electricity += (h['חקרני (I)'] || 0) * 1;
    // Social (S)
    scores.health_support += (h['חברתי (S)'] || 0) * 3;
    // Conventional (C) — precision
    scores.machinery += (h['מינהלי (C)'] || 0) * 1.5;
    scores.medical_devices += (h['מינהלי (C)'] || 0) * 1.5;
    scores.software += (h['מינהלי (C)'] || 0) * 1;
    // Enterprising (E)
    scores.auto += (h['יזמי (E)'] || 0) * 1.5;
    scores.construction += (h['יזמי (E)'] || 0) * 1.5;

    // VIA boosts
    const v = profile.via || {};
    scores.health_support += (v['אנושיות'] || 0) * 0.4;
    scores.software += (v['חכמה וידע'] || 0) * 0.4;
    scores.medical_devices += (v['אנושיות'] || 0) * 0.3;

    // Thinking score boost
    if (profile.thinking?.score) {
      scores.software += profile.thinking.score * 0.5;
      scores.medical_devices += profile.thinking.score * 0.3;
    }

    return (Object.entries(scores) as [TrackId, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 3);
  };

  const handleViewResults = async () => {
    if (!hasMinimum) return;
    const top = rankTracks();
    setTopTracks(top);
    update({ step: 'loading' });
    setError(null);

    try {
      const { data, error: err } = await supabase.functions.invoke('haredi-match', {
        body: { topTracks: top.map(t => TRACKS[t].name), profile: buildProfile() },
      });
      if (err) throw err;
      if (data?.tracks?.length) setExplanations(data.tracks);
      else setExplanations(top.map(t => ({ name: TRACKS[t].name, why: TRACKS[t].tagline, dayInLife: '', firstStep: '' })));
    } catch (e) {
      console.error(e);
      setError('לא הצלחנו לקבל הסבר אישי כעת. הנה התוצאות הבסיסיות:');
      setExplanations(top.map(t => ({ name: TRACKS[t].name, why: TRACKS[t].tagline, dayInLife: '', firstStep: '' })));
    }
    update({ step: 'results' });
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ step: 'welcome', viaAnswers: {}, scheinAnswers: {}, viaBonusApplied: false, scheinBonusApplied: false });
    setTopTracks([]); setExplanations(null); setError(null);
  };

  // ============ RENDER ============
  switch (state.step) {
    case 'welcome':
      return <WelcomeView onStart={() => update({ step: 'hub' })} />;

    case 'hub':
      return (
        <QuestionnaireHub
          completedSections={completedSections}
          onSelect={(id) => update({ step: SECTION_FIRST_STEP[id] })}
          onViewResults={handleViewResults}
        />
      );

    // Skills
    case 'skills-intro':
      return <SectionIntro {...skillsIntro} onContinue={() => update({ step: 'skills' })} />;
    case 'skills':
      return <SkillsQuestionnaire onComplete={(a) => update({ skillsAssignments: a, step: 'hub' })} onBackToHub={goToHub} />;

    // Schein
    case 'schein-intro':
      return <SectionIntro {...scheinIntro} onContinue={() => update({ step: 'schein' })} />;
    case 'schein':
      return <ScheinQuestionnaire answers={state.scheinAnswers} onAnswer={handleScheinAnswer} onComplete={() => update({ step: 'schein-bonus' })} onBackToHub={goToHub} />;
    case 'schein-bonus':
      return <BonusSelection title="כוח ה-3 – עוגנים תעסוקתיים" subtitle="מתוך השאלות שנתת להן את הציון הגבוה ביותר, בחר 3 שהכי מהדהדות אצלך" questions={scheinMaxQuestions} onComplete={handleScheinBonusComplete} onBackToHub={goToHub} />;

    // Considerations
    case 'considerations-intro':
      return <SectionIntro {...considerationsIntro} onContinue={() => update({ step: 'considerations' })} />;
    case 'considerations':
      return <ConsiderationsQuestionnaire onComplete={(selected, points) => update({ considerationsData: { selected, points }, step: 'hub' })} onBackToHub={goToHub} />;

    // Holland
    case 'holland-intro':
      return <SectionIntro {...hollandIntro} onContinue={() => update({ step: 'holland' })} />;
    case 'holland':
      return <HollandQuestionnaire onComplete={(answers) => update({ hollandAnswers: answers, step: 'hub' })} onBackToHub={goToHub} />;

    // VIA
    case 'via-intro':
      return <SectionIntro {...viaIntro} onContinue={() => update({ step: 'via' })} />;
    case 'via':
      return <VIAQuestionnaire answers={state.viaAnswers} onAnswer={handleViaAnswer} onComplete={() => update({ step: 'via-bonus-intro' })} onBackToHub={goToHub} />;
    case 'via-bonus-intro':
      return <SectionIntro {...viaBonusIntro} onContinue={() => update({ step: 'via-bonus' })} />;
    case 'via-bonus':
      return <BonusSelection title="כוח ה-3 – חוזקות VIA" subtitle="מתוך השאלות שנתת להן את הציון הגבוה ביותר, בחר 3 שהכי מהדהדות אצלך" questions={viaMaxQuestions} onComplete={handleViaBonusComplete} onBackToHub={goToHub} />;

    // Preferences
    case 'preferences-intro':
      return <SectionIntro {...preferencesIntro} onContinue={() => update({ step: 'personality-sliders' })} />;
    case 'personality-sliders':
      return <PersonalitySliders onComplete={(sliders) => update({ personalitySliders: sliders, step: 'preferences' })} onBackToHub={goToHub} />;
    case 'preferences':
      return <PreferencesQuestionnaire onComplete={(preferences, dream) => update({ preferencesData: { preferences, dream }, step: 'hub' })} onBackToHub={goToHub} />;

    // Motivation
    case 'motivation-intro':
      return <SectionIntro {...motivationIntro} onContinue={() => update({ step: 'motivation' })} />;
    case 'motivation':
      return <MotivationQuestionnaire onComplete={(motivationScores, intentionAnswers) => update({ motivationData: { motivationScores, intentionAnswers }, step: 'hub' })} onBackToHub={goToHub} />;

    // Thinking
    case 'thinking-intro':
      return <SectionIntro {...thinkingIntro} onContinue={() => update({ step: 'thinking' })} />;
    case 'thinking':
      return <ThinkingSkillsQuestionnaire onComplete={(result) => update({ thinkingResult: result, step: 'hub' })} onBackToHub={goToHub} />;

    case 'loading':
      return <LoadingView />;

    case 'results':
      return <ResultsView topTracks={topTracks} explanations={explanations} error={error} onRestart={handleRestart} onBackToHub={goToHub} />;

    default:
      return <WelcomeView onStart={() => update({ step: 'hub' })} />;
  }
};

// ============ WELCOME VIEW ============
const WelcomeView = ({ onStart }: { onStart: () => void }) => (
  <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl w-full">
      <Card className="p-8 md:p-12 shadow-soft border-0 bg-card">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
            כיוון מקצועי
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
            המסלול המקצועי שלך
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            תהליך אבחון מקצועי מקיף שעוזר לך לבחור מקצוע שמתאים לאופי, לכישרונות ולשאיפות —
            מבין שבעה מסלולי הכשרה מבוקשים ומכבדים.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80 leading-relaxed">
              <p className="font-semibold mb-1">איך זה עובד:</p>
              <p className="mb-2">
                לפניך 8 שאלונים מקצועיים. <span className="font-semibold">השלם לפחות 3</span> כדי לקבל המלצות —
                ככל שתשלים יותר, התמונה תהיה מדויקת יותר.
              </p>
              <p>בסיום נציג לך את 3 המסלולים המתאימים ביותר, עם הסבר אישי וצעד ראשון מעשי.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {TRACK_IDS.map((id) => (
            <div key={id} className="bg-muted/40 rounded-lg p-3 text-center border border-border/40">
              <div className="text-2xl mb-1">{TRACKS[id].emoji}</div>
              <div className="text-sm font-semibold text-primary">{TRACKS[id].name}</div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/5 rounded-lg p-4 mb-6 border border-secondary/20 text-sm text-foreground/80 leading-relaxed">
          <p>
            <span className="font-semibold">שים לב:</span> קיימים כמובן מסלולים מקצועיים נוספים בעולם.
            הכלי הזה ממקד אותך מבין שבעת המסלולים שזוהו כרלוונטיים, מבוקשים ומתאימים במיוחד.
          </p>
        </div>

        <Button
          size="lg"
          onClick={onStart}
          className="w-full text-lg py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Sparkles className="w-5 h-5 ml-2" />
          להתחיל את התהליך
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ההתקדמות שלך נשמרת אוטומטית • ללא רישום
        </p>
      </Card>
    </motion.div>
  </div>
);

// ============ LOADING VIEW ============
const LoadingView = () => (
  <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block mb-6"
      >
        <Sparkles className="w-16 h-16 text-secondary" />
      </motion.div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
        מעבד את התשובות שלך...
      </h2>
      <p className="text-muted-foreground text-lg">
        מנתח את הנתונים ובונה הסבר אישי על שלושת המסלולים המתאימים ביותר עבורך
      </p>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    </div>
  </div>
);

// ============ RESULTS VIEW ============
const ResultsView = ({
  topTracks, explanations, error, onRestart, onBackToHub,
}: {
  topTracks: TrackId[];
  explanations: AIExplanation[] | null;
  error: string | null;
  onRestart: () => void;
  onBackToHub: () => void;
}) => {
  useEffect(() => { celebrationConfetti(); }, []);
  return (
  <div dir="rtl" className="min-h-screen bg-background py-12 px-6">
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            התוצאות שלך
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4">
            שלושת המסלולים המתאימים לך ביותר
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            לפי התשובות שלך, אלו שלושת המסלולים שמשתלבים בצורה הטובה ביותר עם האופי, הכישרונות והשאיפות שלך.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-10">
          {topTracks.map((tid, i) => {
            const meta = TRACKS[tid];
            const explain = explanations?.[i];
            return (
              <motion.div key={tid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.15 }}>
                <Card className="p-6 md:p-8 shadow-soft border-0 bg-card relative overflow-hidden">
                  <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>

                  <div className="flex items-start gap-4 mb-5">
                    <div className="text-5xl flex-shrink-0">{meta.emoji}</div>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">{meta.name}</h3>
                      <p className="text-secondary font-medium text-sm md:text-base">{meta.tagline}</p>
                    </div>
                  </div>

                  {explain?.why && (
                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-primary/70 mb-2 uppercase tracking-wide">למה זה מתאים לך</h4>
                      <p className="text-foreground/90 leading-relaxed">{explain.why}</p>
                    </div>
                  )}

                  {explain?.dayInLife && (
                    <div className="mb-5 bg-muted/30 rounded-lg p-4 border border-border/40">
                      <h4 className="text-sm font-bold text-primary/70 mb-2 uppercase tracking-wide">איך נראה יום עבודה</h4>
                      <p className="text-foreground/80 leading-relaxed text-sm">{explain.dayInLife}</p>
                    </div>
                  )}

                  {explain?.firstStep && (
                    <div className="flex items-start gap-3 bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-primary mb-1">הצעד הראשון</h4>
                        <p className="text-foreground/80 leading-relaxed text-sm">{explain.firstStep}</p>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-muted/30 rounded-lg p-5 mb-8 border border-border/50 text-sm text-foreground/80 leading-relaxed">
          <p className="font-semibold mb-1">הערה חשובה:</p>
          <p>
            קיימים כמובן מסלולים מקצועיים נוספים. ההמלצות כאן ממוקדות מבין שבעת המסלולים הרלוונטיים שזוהו כמתאימים במיוחד.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" onClick={onBackToHub} className="text-base">
            חזרה לרשימת השאלונים
          </Button>
          <Button variant="ghost" size="lg" onClick={onRestart} className="text-base text-muted-foreground">
            <RotateCcw className="w-4 h-4 ml-2" />
            להתחיל מחדש
          </Button>
        </div>
      </motion.div>
    </div>
  </div>
  );
};

export default Haredi;
