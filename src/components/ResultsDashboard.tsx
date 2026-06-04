import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChevronDown } from 'lucide-react';
import owlLogo from '@/assets/owl-logo.png';
import { getTopCategories } from '@/lib/scoring';
import { owlCelebrations } from '@/lib/owlMessages';
import { getRecommendations } from '@/lib/recommendations';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';
import OwlChat, { type ChatMessage } from '@/components/OwlChat';
import { viaCategoryDescriptions, scheinCategoryDescriptions, hollandCategoryDescriptions } from '@/data/categoryDescriptions';
import { motivationClusters, calculateIntentionDimensions, motivationClusterDescriptions, intentionDimensionDescriptions, type MotivationScores, type IntentionAnswers } from '@/data/motivationQuestions';
import type { ThinkingResult } from '@/data/thinkingQuestions';
import MatchCards from '@/components/MatchCards';
import InteractiveRoadmap from '@/components/InteractiveRoadmap';

interface ResultsDashboardProps {
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  motivationData?: { motivationScores: MotivationScores; intentionAnswers: IntentionAnswers };
  thinkingResult?: ThinkingResult;
  chatMessages?: ChatMessage[];
  onChatMessagesChange?: (messages: ChatMessage[]) => void;
  onBackToHub?: () => void;
  tokenId?: string;
}

/* ── Expandable Section (accessible for elderly) ── */
const ExpandableSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 md:py-6 text-right hover:bg-muted/30 transition-colors duration-300 min-h-[60px]"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-lg md:text-xl font-bold font-display text-foreground tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-7 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Score Bar (reusable, accessible) ── */
const ScoreBar = ({ label, description, score, maxScore, colorClass = 'bg-secondary' }: {
  label: string; description?: string; score: number; maxScore: number; colorClass?: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <span className="text-lg font-semibold text-foreground">{label}</span>
      <span className="text-base text-muted-foreground font-display">{typeof score === 'number' ? score.toFixed(1) : score}/{maxScore}</span>
    </div>
    {description && <p className="text-base text-muted-foreground leading-relaxed">{description}</p>}
    <div className="w-full h-3.5 bg-muted/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={maxScore}>
      <div className={`h-full ${colorClass} rounded-full progress-bar-fill`} style={{ width: `${(score / maxScore) * 100}%` }} />
    </div>
  </div>
);

const ResultsDashboard = ({
  viaScores, scheinScores, hollandScores,
  considerationsData, skillsAssignments, preferencesData, motivationData, thinkingResult,
  chatMessages, onChatMessagesChange, onBackToHub, tokenId,
}: ResultsDashboardProps) => {
  const topVIA = getTopCategories(viaScores, 2);
  const topSchein = getTopCategories(scheinScores, 2);

  const aiRecommendations = useMemo(() => {
    if (!chatMessages || chatMessages.length === 0) return null;
    const roadmapMessage = chatMessages
      .filter(m => m.role === 'assistant')
      .find(m => m.content.includes('🗺️'));
    if (!roadmapMessage) return null;
    const roadmapIndex = roadmapMessage.content.indexOf('🗺️');
    return roadmapMessage.content.slice(roadmapIndex);
  }, [chatMessages]);

  const staticRecommendations = getRecommendations(viaScores, scheinScores);

  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
  };

  const winnerSkills = skillsAssignments
    ? Object.entries(skillsAssignments)
        .filter(([, col]) => col === 'winner')
        .map(([id]) => skills.find(s => s.id === Number(id))?.text)
        .filter(Boolean)
    : [];

  const topHolland = hollandScores
    ? Object.entries(hollandScores).sort(([, a], [, b]) => b - a).slice(0, 3)
    : [];

  const topConsiderations = considerationsData
    ? Object.entries(considerationsData.points).sort(([, a], [, b]) => b - a).slice(0, 6)
    : [];

  const intentionDimensions = useMemo(() => {
    if (!motivationData) return null;
    return calculateIntentionDimensions(motivationData.intentionAnswers);
  }, [motivationData]);

  const completedCount = useMemo(() => {
    let count = 0;
    if (Object.keys(viaScores).length > 0) count++;
    if (Object.keys(scheinScores).length > 0) count++;
    if (hollandScores && Object.keys(hollandScores).length > 0) count++;
    if (considerationsData && considerationsData.selected.length > 0) count++;
    if (skillsAssignments && Object.keys(skillsAssignments).length > 0) count++;
    if (preferencesData && preferencesData.dream) count++;
    if (motivationData) count++;
    if (thinkingResult) count++;
    return count;
  }, [viaScores, scheinScores, hollandScores, considerationsData, skillsAssignments, preferencesData, motivationData, thinkingResult]);

  const totalQuestionnaires = 8;
  const isPartial = completedCount < totalQuestionnaires;

  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    parts.push(`חוזקות VIA מובילות: ${topVIA.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`עוגני קריירה מובילים: ${topSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    if (topHolland.length > 0) parts.push(`נטיות הולנד מובילות: ${topHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (winnerSkills.length > 0) parts.push(`כישורים מובילים: ${winnerSkills.join(', ')}`);
    if (topConsiderations.length > 0) parts.push(`שיקולים מובילים: ${topConsiderations.map(([c, p]) => `${c} (${p} נק׳)`).join(', ')}`);
    if (preferencesData?.dream) parts.push(`חלום המגירה: ${preferencesData.dream}`);
    if (motivationData) {
      const clusterSummary = motivationClusters
        .map(c => `${c.title}: ${motivationData.motivationScores[c.id] || 0}/5`)
        .join(', ');
      parts.push(`\nמניעים להמשך תעסוקה: ${clusterSummary}`);
    }
    if (intentionDimensions) {
      parts.push(`כוונות תעסוקתיות – מוכנות נפשית: ${intentionDimensions.readiness.toFixed(1)}/5, יוזמה: ${intentionDimensions.proactivity.toFixed(1)}/5, גמישות: ${intentionDimensions.flexibility.toFixed(1)}/5`);
      const levelLabel = intentionDimensions.intentionLevel === 'high' ? 'גבוהה' : intentionDimensions.intentionLevel === 'low' ? 'נמוכה' : 'בינונית';
      parts.push(`רמת כוונות כללית: ${levelLabel} (${intentionDimensions.general.toFixed(1)}/5)`);
    }
    parts.push(`\nהמלצות עיסוק שעלו בדו"ח האישי:`);
    staticRecommendations.forEach((rec, i) => {
      parts.push(`${i + 1}. ${rec.title} (${rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}) – ${rec.reason}`);
    });
    if (thinkingResult) {
      parts.push(`\nהערכת חשיבה וגמישות: ${thinkingResult.totalCorrect}/${thinkingResult.totalQuestions} (רמה: ${thinkingResult.levelLabel}, אחוזון: ${thinkingResult.percentile})`);
    }
    return parts.join('\n');
  }, [topVIA, topSchein, topHolland, winnerSkills, topConsiderations, preferencesData, motivationData, intentionDimensions, staticRecommendations, thinkingResult]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 md:py-14">
      <div className="w-full max-w-3xl space-y-8 md:space-y-10">
        {/* Header */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0} className="text-center space-y-5">
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto rounded-full shadow-[var(--shadow-elevated)] animate-float" />
          <h1 className="text-2xl md:text-4xl font-bold font-display text-foreground tracking-wide leading-snug">
            הפרופיל שלכם ב-<span className="text-secondary">Sageify</span>
          </h1>
          <p className="text-lg text-muted-foreground">כל התובנות שלכם במקום אחד</p>
        </motion.div>

        {/* Human consultation CTA — the next step after Sagi */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          custom={0.3}
          dir="rtl"
          className="bg-card rounded-3xl border border-secondary/30 p-6 md:p-8 shadow-[var(--shadow-elevated)] relative overflow-hidden"
        >
          <span className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black tracking-widest">
            STEP 2 · המענה האנושי
          </span>
          <div className="grid md:grid-cols-[auto,1fr,auto] items-center gap-5 md:gap-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center text-3xl flex-shrink-0">
              🤝
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-foreground tracking-wide mb-2 mt-5 md:mt-0">
                הצעד הבא: פגישת ייעוץ אישית (45 דקות)
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                סיימתם את המשחק ואת השיחה עם סגי — מצוין. עכשיו{' '}
                <span className="text-foreground font-semibold">יועץ.ת תעסוקתי.ת אנושי.ת</span>{' '}
                מקבל.ת את <span className="text-foreground font-semibold">דוח האינטייק</span> שיצרתם,
                ועוזר.ת לכם לתרגם את הנתונים לתוכנית פעולה <span className="text-foreground font-semibold">מנטלית ופרקטית</span> מותאמת אישית.
              </p>
            </div>
            <a
              href="/#/"
              className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold font-display tracking-wide rounded-2xl shadow-[var(--shadow-elevated)] hover:bg-primary/90 transition whitespace-nowrap min-h-[56px] inline-flex items-center justify-center"
            >
              קבעו פגישת ייעוץ ←
            </a>
          </div>
        </motion.div>

        {/* Partial data notice */}
        {isPartial && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="bg-accent/5 border border-accent/20 rounded-2xl p-6 flex items-start gap-4"
            dir="rtl"
          >
            <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="space-y-2">
               <p className="text-foreground font-semibold font-display text-base tracking-wide">
                📊 התוצאות מבוססות על {completedCount} מתוך {totalQuestionnaires} שאלונים
               </p>
               <p className="text-muted-foreground text-base leading-relaxed">
                השלמת שאלונים נוספים תחדד את הפרופיל ותאפשר המלצות מדויקות יותר.
               </p>
               {onBackToHub && (
                 <button
                   onClick={onBackToHub}
                   className="mt-3 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-base font-medium font-display tracking-wide hover:bg-secondary/85 transition-all duration-300 shadow-sm min-h-[52px]"
                 >
                   חזרה להשלמת שאלונים ←
                 </button>
               )}
            </div>
          </motion.div>
        )}

        {/* Text Summary */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
          <div className="bg-card rounded-3xl p-7 md:p-9 border border-border/60 shadow-[var(--shadow-card)]" dir="rtl">
            <div className="flex items-start gap-4 mb-6">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
              <h3 className="text-xl md:text-2xl font-bold font-display text-secondary tracking-wide pt-1">✦ סיכום התוצאות</h3>
            </div>
            <div className="space-y-4 text-foreground text-lg leading-[1.85]">
              <p>
                התוצאות מראות שהחוזקות שלכם הן{' '}
                <span className="text-secondary font-bold">{topVIA.map(t => `"${t.category}"`).join(' ו')}</span>
                , והעוגנים התעסוקתיים המרכזיים שלכם הם{' '}
                <span className="text-primary font-bold">{topSchein.map(t => `"${t.category}"`).join(' ו')}</span>.
              </p>
              {topHolland.length > 0 && (
                <p>הנטיות התעסוקתיות הבולטות שלכם: <span className="font-semibold">{topHolland.map(([cat]) => cat).join(', ')}</span>.</p>
              )}
              {winnerSkills.length > 0 && (
                <p>הכישורים החזקים ביותר: <span className="font-semibold">{winnerSkills.join(', ')}</span>.</p>
              )}
              {preferencesData?.dream && (
                <p>חלום המגירה: <span className="text-secondary font-semibold">{preferencesData.dream}</span></p>
              )}
              {thinkingResult && (
                <p>
                  הערכת חשיבה וגמישות:{' '}
                  <span className="font-semibold">{thinkingResult.levelLabel}</span>
                  {' '}({thinkingResult.totalCorrect} מתוך {thinkingResult.totalQuestions} תשובות נכונות)
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Interactive 3-Phase Roadmap */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
          <InteractiveRoadmap
            chatMessages={chatMessages}
            tokenId={tokenId}
            viaTop={topVIA.map(t => t.category)}
            scheinTop={topSchein.map(t => t.category)}
          />
        </motion.div>

        {/* Smart Match Cards */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
          <div className="bg-card rounded-3xl p-7 md:p-9 border border-border/60 shadow-[var(--shadow-card)]">
            <MatchCards
              viaScores={viaScores}
              scheinScores={scheinScores}
              hollandScores={hollandScores}
              tokenId={tokenId}
            />
          </div>
        </motion.div>

        {/* AI / Static Recommendations */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
          <ExpandableSection title="ההמלצות של סגי" icon="🦉">
            {aiRecommendations ? (
              <div className="bg-background rounded-2xl p-6 md:p-7 border border-border/60">
                <div className="prose prose-lg dark:prose-invert max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:text-xl [&_h1]:font-display [&_h2]:text-lg [&_h2]:font-display [&_h3]:text-base [&_h3]:font-display [&_ul]:mr-4 [&_ol]:mr-4 [&_li]:mb-2 [&_li]:text-base" dir="rtl">
                  <ReactMarkdown>{aiRecommendations}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {staticRecommendations.map((rec, i) => (
                  <a key={i} href={rec.platformUrl} target="_blank" rel="noopener noreferrer"
                    className="block bg-background rounded-2xl p-5 md:p-6 border border-border/60 hover:border-secondary/30 transition-all duration-300 group min-h-[60px]">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-bold font-display text-foreground group-hover:text-secondary transition-colors text-lg">{rec.title}</h4>
                          <span className={`text-base px-3 py-1.5 rounded-full font-medium ${
                            rec.type === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                            rec.type === 'freelance' ? 'bg-primary/15 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}
                          </span>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </ExpandableSection>
        </motion.div>

        {/* Expandable detail sections */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={4} className="space-y-5">
          <p className="text-lg text-muted-foreground text-center font-semibold font-display">👇 לחצו להרחבת הפירוט</p>

          <ExpandableSection title="חוזקות VIA – כל הקטגוריות" icon="◆">
            <div className="space-y-5">
              {Object.entries(viaScores).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                <ScoreBar key={cat} label={cat} description={viaCategoryDescriptions[cat]} score={score} maxScore={5} colorClass="bg-secondary" />
              ))}
            </div>
          </ExpandableSection>

          <ExpandableSection title="עוגנים תעסוקתיים – כל הקטגוריות" icon="●">
            <div className="space-y-5">
              {Object.entries(scheinScores).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                <ScoreBar key={cat} label={cat} description={scheinCategoryDescriptions[cat]} score={score} maxScore={7} colorClass="bg-primary" />
              ))}
            </div>
          </ExpandableSection>

          {topHolland.length > 0 && (
            <ExpandableSection title="נטיות תעסוקתיות (הולנד)" icon="✦">
              <div className="space-y-5">
                {Object.entries(hollandScores || {}).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                  <ScoreBar key={cat} label={cat} description={hollandCategoryDescriptions[cat]} score={score} maxScore={11} colorClass="bg-primary" />
                ))}
              </div>
            </ExpandableSection>
          )}

          {topConsiderations.length > 0 && (
            <ExpandableSection title="שיקולים מובילים" icon="◆">
              <div className="space-y-3">
                {topConsiderations.map(([item, pts]) => (
                  <div key={item} className="flex justify-between items-center bg-background rounded-2xl px-6 py-5 border border-border/60 min-h-[56px]">
                    <span className="font-medium text-foreground text-lg">{item}</span>
                    <span className="text-secondary font-bold font-display text-lg">{pts} נק׳</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {winnerSkills.length > 0 && (
            <ExpandableSection title="כישורים מובילים" icon="●">
              <div className="space-y-3">
                {winnerSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-4 bg-background rounded-2xl px-6 py-5 border border-border/60 min-h-[56px]">
                    <span className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-display font-bold text-base">{i + 1}</span>
                    <span className="text-foreground text-lg">{skill}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {motivationData && (
            <ExpandableSection title="מניעים וכוונות תעסוקתיות" icon="🔥">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold font-display text-foreground text-lg mb-4 tracking-wide">אשכולות מניעים</h4>
                  <div className="space-y-5">
                    {motivationClusters.map(cluster => {
                      const score = motivationData.motivationScores[cluster.id] || 0;
                      return (
                        <div key={cluster.id} className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cluster.icon}</span>
                            <span className="text-lg font-semibold text-foreground">{cluster.title}</span>
                            <span className="text-base text-muted-foreground mr-auto font-display">{score}/5</span>
                          </div>
                          <p className="text-base text-muted-foreground leading-relaxed">{motivationClusterDescriptions[cluster.title] || ''}</p>
                          <div className="w-full h-3.5 bg-muted/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={5}>
                            <div className="h-full bg-primary rounded-full progress-bar-fill" style={{ width: `${(score / 5) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {intentionDimensions && (
                  <div>
                    <h4 className="font-bold font-display text-foreground text-lg mb-4 tracking-wide">ממדי כוונות תעסוקתיות</h4>
                    <div className="space-y-5">
                      {([
                        { key: 'readiness', label: 'מוכנות נפשית', value: intentionDimensions.readiness },
                        { key: 'proactivity', label: 'יוזמה ופרואקטיביות', value: intentionDimensions.proactivity },
                        { key: 'flexibility', label: 'גמישות תעסוקתית', value: intentionDimensions.flexibility },
                      ] as const).map(dim => (
                        <ScoreBar
                          key={dim.key}
                          label={dim.label}
                          description={intentionDimensionDescriptions[dim.label]}
                          score={dim.value}
                          maxScore={5}
                          colorClass="bg-secondary"
                        />
                      ))}
                    </div>
                    <div className={`mt-5 rounded-2xl px-6 py-5 border ${
                      intentionDimensions.intentionLevel === 'high' ? 'bg-secondary/5 border-secondary/20' :
                      intentionDimensions.intentionLevel === 'low' ? 'bg-destructive/5 border-destructive/20' :
                      'bg-muted/30 border-border/60'
                    }`}>
                      <p className="font-bold font-display text-foreground text-base tracking-wide">
                        {intentionDimensions.intentionLevel === 'high' ? '✦ רמת כוונות גבוהה' :
                         intentionDimensions.intentionLevel === 'low' ? '◆ רמת כוונות נמוכה' :
                         '● רמת כוונות בינונית'}
                      </p>
                      <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                        ציון כללי: {intentionDimensions.general.toFixed(1)} מתוך 5
                        {intentionDimensions.intentionLevel === 'high' && ' — יש לכם נכונות גבוהה לפעול ולמצוא עיסוק חדש.'}
                        {intentionDimensions.intentionLevel === 'low' && ' — ייתכן שעדיין לא הבשיל הזמן, וזה בסדר גמור.'}
                        {intentionDimensions.intentionLevel === 'medium' && ' — אתם בשלב חקירה – השיחה עם סגי יכולה לעזור לגבש כיוון.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ExpandableSection>
          )}

          {thinkingResult && (
            <ExpandableSection title="חשיבה וגמישות קוגניטיבית" icon="🧠">
              <div className="space-y-5">
                {/* Score summary */}
                <div className={`rounded-2xl px-6 py-5 border ${
                  thinkingResult.level === 'high' || thinkingResult.level === 'above-average'
                    ? 'bg-secondary/5 border-secondary/20'
                    : thinkingResult.level === 'low' || thinkingResult.level === 'below-average'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-muted/30 border-border/60'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold font-display text-foreground text-base tracking-wide">
                      רמה: {thinkingResult.levelLabel}
                    </p>
                    <span className="text-base text-muted-foreground font-display">
                      אחוזון {thinkingResult.percentile}
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-muted/50 rounded-full overflow-hidden mb-3" role="progressbar">
                    <div
                      className="h-full bg-secondary rounded-full progress-bar-fill"
                      style={{ width: `${(thinkingResult.totalCorrect / thinkingResult.totalQuestions) * 100}%` }}
                    />
                  </div>
                  <p className="text-base text-muted-foreground">
                    {thinkingResult.totalCorrect} תשובות נכונות מתוך {thinkingResult.totalQuestions}
                  </p>
                </div>

                {/* Time used */}
                <div className="bg-background rounded-2xl px-6 py-4 border border-border/60 flex items-center justify-between min-h-[52px]">
                  <span className="text-base font-medium text-foreground">⏱ זמן שהושקע</span>
                  <span className="text-base text-muted-foreground font-display">
                    {Math.floor(thinkingResult.timeUsedSeconds / 60)}:{String(thinkingResult.timeUsedSeconds % 60).padStart(2, '0')} דקות
                  </span>
                </div>

                {/* Interpretation */}
                <div className="bg-background rounded-2xl px-6 py-5 border border-border/60">
                  <p className="text-base text-muted-foreground leading-[1.85]">
                    {thinkingResult.level === 'high' && 'יכולת חשיבה אנליטית גבוהה מאוד – גמישות קוגניטיבית מרשימה וכושר זיהוי דפוסים מתקדם. זהו נכס משמעותי בתפקידים הדורשים פתרון בעיות מורכבות.'}
                    {thinkingResult.level === 'above-average' && 'יכולת חשיבה מעל הממוצע – זיהוי דפוסים טוב ויכולת הסקה לוגית חזקה. חוזקה זו יכולה לתרום בתפקידים אנליטיים ויצירתיים.'}
                    {thinkingResult.level === 'average' && 'יכולת חשיבה ברמה ממוצעת – בסיס טוב לפיתוח נוסף. תרגול וחשיפה לאתגרים חדשים יכולים לחזק את הגמישות הקוגניטיבית.'}
                    {thinkingResult.level === 'below-average' && 'יש מקום לחיזוק יכולות החשיבה האנליטית – אך זה לא משקף את כלל היכולות שלכם. חוזקות אחרות שעלו בשאלונים יכולות לפצות.'}
                    {thinkingResult.level === 'low' && 'הערכת החשיבה מציגה תמונה חלקית בלבד – חוזקות רבות אינן נמדדות במבחן מסוג זה. השאלונים האחרים מספקים תמונה עשירה יותר.'}
                  </p>
                </div>
              </div>
            </ExpandableSection>
          )}

          {preferencesData && (
            <ExpandableSection title="העדפות אישיות" icon="✦">
              <div className="space-y-3">
                {Object.entries(preferencesData.preferences).map(([key, values]) => (
                  <div key={key} className="bg-background rounded-2xl px-6 py-4 border border-border/60">
                    {values.map((v, i) => (
                      <p key={i} className="text-foreground text-base leading-relaxed">✓ {v}</p>
                    ))}
                  </div>
                ))}
              </div>
              {preferencesData.dream && (
                <div className="mt-4 bg-secondary/5 rounded-2xl px-6 py-5 border border-secondary/20">
                  <p className="font-bold font-display text-foreground text-base tracking-wide">✦ חלום המגירה:</p>
                  <p className="text-secondary font-semibold text-lg mt-1">{preferencesData.dream}</p>
                </div>
              )}
            </ExpandableSection>
          )}
        </motion.div>

        {/* Owl AI Chat */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={5} className="print:hidden">
          <OwlChat
            profileSummary={profileSummary}
            initialMessages={chatMessages}
            onMessagesChange={onChatMessagesChange}
          />
        </motion.div>

        {/* Actions */}
        <div className="text-center pb-10 space-y-5 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-medium font-display text-lg tracking-wide hover:bg-primary/85 transition-all duration-300 mx-2 shadow-[var(--shadow-card)] min-h-[56px]"
          >
            הורדה כ-PDF
          </button>
          <br />
          <p className="text-muted-foreground mb-3 text-base">סגי תמיד כאן אם תרצו לעבור שוב</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-10 py-4 rounded-2xl bg-muted text-foreground font-medium font-display text-lg tracking-wide hover:bg-muted/80 transition-all duration-300 min-h-[56px]"
          >
            התחלה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
