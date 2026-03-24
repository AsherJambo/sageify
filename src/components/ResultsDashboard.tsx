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
import MatchCards from '@/components/MatchCards';
import InteractiveRoadmap from '@/components/InteractiveRoadmap';

interface ResultsDashboardProps {
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  chatMessages?: ChatMessage[];
  onChatMessagesChange?: (messages: ChatMessage[]) => void;
  onBackToHub?: () => void;
  tokenId?: string;
}

/* ── Expandable Section ── */
const ExpandableSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-7 py-5 text-right hover:bg-muted/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-base font-bold font-display text-foreground tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-7 pb-6 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultsDashboard = ({
  viaScores, scheinScores, hollandScores,
  considerationsData, skillsAssignments, preferencesData,
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
      transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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

  const completedCount = useMemo(() => {
    let count = 0;
    if (Object.keys(viaScores).length > 0) count++;
    if (Object.keys(scheinScores).length > 0) count++;
    if (hollandScores && Object.keys(hollandScores).length > 0) count++;
    if (considerationsData && considerationsData.selected.length > 0) count++;
    if (skillsAssignments && Object.keys(skillsAssignments).length > 0) count++;
    if (preferencesData && preferencesData.dream) count++;
    return count;
  }, [viaScores, scheinScores, hollandScores, considerationsData, skillsAssignments, preferencesData]);

  const isPartial = completedCount < 6;

  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    parts.push(`חוזקות VIA מובילות: ${topVIA.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`עוגני קריירה מובילים: ${topSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    if (topHolland.length > 0) parts.push(`נטיות הולנד מובילות: ${topHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (winnerSkills.length > 0) parts.push(`כישורים מובילים: ${winnerSkills.join(', ')}`);
    if (topConsiderations.length > 0) parts.push(`שיקולים מובילים: ${topConsiderations.map(([c, p]) => `${c} (${p} נק׳)`).join(', ')}`);
    if (preferencesData?.dream) parts.push(`חלום המגירה: ${preferencesData.dream}`);
    parts.push(`\nהמלצות עיסוק שעלו בדו"ח האישי:`);
    staticRecommendations.forEach((rec, i) => {
      parts.push(`${i + 1}. ${rec.title} (${rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}) – ${rec.reason}`);
    });
    return parts.join('\n');
  }, [topVIA, topSchein, topHolland, winnerSkills, topConsiderations, preferencesData, staticRecommendations]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0} className="text-center space-y-5">
          <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto rounded-full shadow-[var(--shadow-elevated)] animate-float" />
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            הפרופיל שלכם ב-<span className="text-secondary">Sageify</span>
          </h1>
        </motion.div>

        {/* Partial data notice */}
        {isPartial && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-4"
            dir="rtl"
          >
            <img src={owlLogo} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="text-foreground font-semibold font-display text-sm tracking-wide">
                📊 התוצאות מבוססות על {completedCount} מתוך 6 שאלונים
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                השלמת שאלונים נוספים תחדד את הפרופיל ותאפשר המלצות מדויקות יותר. 
                תוכלו תמיד לחזור ולהשלים שאלונים שטרם מילאתם.
              </p>
            </div>
          </motion.div>
        )}

        {/* Text Summary */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
          <div className="bg-card rounded-3xl p-8 border border-border/60 shadow-[var(--shadow-card)]" dir="rtl">
            <div className="flex items-start gap-4 mb-5">
              <img src={owlLogo} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
              <h3 className="text-lg font-bold font-display text-secondary tracking-wide pt-1">✦ סיכום התוצאות</h3>
            </div>
            <div className="space-y-3 text-foreground text-base leading-relaxed">
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
          <div className="bg-card rounded-3xl p-8 border border-border/60 shadow-[var(--shadow-card)]">
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
              <div className="bg-background rounded-2xl p-6 border border-border/60">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-display [&_h2]:text-base [&_h2]:font-display [&_h3]:text-sm [&_h3]:font-display [&_ul]:mr-4 [&_ol]:mr-4 [&_li]:mb-1" dir="rtl">
                  <ReactMarkdown>{aiRecommendations}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {staticRecommendations.map((rec, i) => (
                  <a key={i} href={rec.platformUrl} target="_blank" rel="noopener noreferrer"
                    className="block bg-background rounded-2xl p-5 border border-border/60 hover:border-secondary/30 transition-all duration-200 group">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold font-display text-foreground group-hover:text-secondary transition-colors text-sm">{rec.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rec.type === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                            rec.type === 'freelance' ? 'bg-primary/15 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </ExpandableSection>
        </motion.div>

        {/* Expandable detail sections */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={4} className="space-y-4">
          <p className="text-sm text-muted-foreground text-center font-medium">לחצו להרחבת הפירוט ▼</p>

          <ExpandableSection title="חוזקות VIA – כל הקטגוריות" icon="◆">
            <div className="space-y-3">
              {Object.entries(viaScores).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <span className="text-sm font-medium text-foreground">{cat}</span>
                  <p className="text-xs text-muted-foreground">{viaCategoryDescriptions[cat] || ''}</p>
                  <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: `${(score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ExpandableSection>

          <ExpandableSection title="עוגנים תעסוקתיים – כל הקטגוריות" icon="●">
            <div className="space-y-3">
              {Object.entries(scheinScores).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <span className="text-sm font-medium text-foreground">{cat}</span>
                  <p className="text-xs text-muted-foreground">{scheinCategoryDescriptions[cat] || ''}</p>
                  <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full progress-bar-fill" style={{ width: `${(score / 7) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ExpandableSection>

          {topHolland.length > 0 && (
            <ExpandableSection title="נטיות תעסוקתיות (הולנד)" icon="✦">
              <div className="space-y-3">
                {Object.entries(hollandScores || {}).sort(([, a], [, b]) => b - a).map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <span className="text-sm font-medium text-foreground">{cat}</span>
                    <p className="text-xs text-muted-foreground">{hollandCategoryDescriptions[cat] || ''}</p>
                    <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full progress-bar-fill" style={{ width: `${(score / 11) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {topConsiderations.length > 0 && (
            <ExpandableSection title="שיקולים מובילים" icon="◆">
              <div className="space-y-2">
                {topConsiderations.map(([item, pts]) => (
                  <div key={item} className="flex justify-between items-center bg-background rounded-2xl px-5 py-3 border border-border/60">
                    <span className="font-medium text-foreground text-sm">{item}</span>
                    <span className="text-secondary font-bold font-display">{pts} נק׳</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {winnerSkills.length > 0 && (
            <ExpandableSection title="כישורים מובילים" icon="●">
              <div className="space-y-2">
                {winnerSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background rounded-2xl px-5 py-3 border border-border/60">
                    <span className="w-7 h-7 rounded-full bg-secondary/8 text-secondary flex items-center justify-center font-display font-bold text-xs">{i + 1}</span>
                    <span className="text-foreground text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {preferencesData && (
            <ExpandableSection title="העדפות אישיות" icon="✦">
              <div className="space-y-2">
                {Object.entries(preferencesData.preferences).map(([key, values]) => (
                  <div key={key} className="bg-background rounded-2xl px-5 py-3 border border-border/60">
                    {values.map((v, i) => (
                      <p key={i} className="text-foreground text-sm">✓ {v}</p>
                    ))}
                  </div>
                ))}
              </div>
              {preferencesData.dream && (
                <div className="mt-4 bg-secondary/5 rounded-2xl px-5 py-4 border border-secondary/20">
                  <p className="font-bold font-display text-foreground text-sm tracking-wide">✦ חלום המגירה:</p>
                  <p className="text-secondary font-semibold">{preferencesData.dream}</p>
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
        <div className="text-center pb-8 space-y-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-medium font-display tracking-wide hover:bg-primary/85 transition-all duration-300 mx-2 shadow-[var(--shadow-card)]"
          >
            הורדה כ-PDF
          </button>
          <br />
          <p className="text-muted-foreground mb-3 text-sm">סגי תמיד כאן אם תרצו לעבור שוב</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-3 rounded-2xl bg-muted text-foreground font-medium font-display tracking-wide hover:bg-muted/80 transition-all duration-300"
          >
            התחלה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
