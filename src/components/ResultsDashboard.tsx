import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/owl-logo.png';
import { getTopCategories } from '@/lib/scoring';
import { owlCelebrations } from '@/lib/owlMessages';
import { getRecommendations, type Recommendation } from '@/lib/recommendations';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';
import OwlChat, { type ChatMessage } from '@/components/OwlChat';
import { viaCategoryDescriptions, scheinCategoryDescriptions, hollandCategoryDescriptions } from '@/data/categoryDescriptions';

interface ResultsDashboardProps {
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  chatMessages?: ChatMessage[];
  onChatMessagesChange?: (messages: ChatMessage[]) => void;
}

const ResultsDashboard = ({
  viaScores, scheinScores, hollandScores,
  considerationsData, skillsAssignments, preferencesData,
  chatMessages, onChatMessagesChange,
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
      transition: { duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  const generateNarrative = () => {
    const v1 = topVIA[0]?.category;
    const v2 = topVIA[1]?.category;
    const s1 = topSchein[0]?.category;
    const s2 = topSchein[1]?.category;
    return `הפרופיל שלכם מראה שהחוזקות המרכזיות שלכם הן "${v1}" ו"${v2}", בשילוב עם צורך עמוק ב"${s1}" ו"${s2}". שילוב ייחודי זה מעיד על כך שתפרחו בתפקידים שמאפשרים לכם להביא את החוכמה והניסיון שלכם לידי ביטוי, תוך שמירה על הערכים שחשובים לכם ביותר.`;
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
      <div className="w-full max-w-3xl space-y-10">
        {/* Header */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0} className="text-center space-y-5">
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto rounded-full shadow-[var(--shadow-elevated)] animate-float" />
          <p className="text-lg text-secondary font-medium tracking-wide">{owlCelebrations.profileReady}</p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">
            הפרופיל שלכם ב-<span className="text-secondary">Sageify</span>
          </h1>
        </motion.div>

        {/* AI Narrative */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
          <div className="bg-card rounded-3xl p-8 border border-border/60 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold font-display text-secondary mb-3 tracking-wide">{owlCelebrations.narrative}תובנה מרכזית</h3>
                <p className="text-foreground leading-relaxed text-lg">{generateNarrative()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold font-display text-foreground mb-1 tracking-wide">חוזקות מובילות (VIA)</h3>
            <p className="text-sm text-muted-foreground mb-5">{owlCelebrations.topStrength}</p>
            {topVIA.map((item, i) => (
              <div key={item.category} className="flex items-center gap-4 mb-4">
                <span className="w-9 h-9 rounded-full bg-secondary/8 text-secondary flex items-center justify-center font-display font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{viaCategoryDescriptions[item.category] || ''}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold font-display text-foreground mb-1 tracking-wide">עוגנים מובילים (שיין)</h3>
            <p className="text-sm text-muted-foreground mb-5">{owlCelebrations.topAnchor}</p>
            {topSchein.map((item, i) => (
              <div key={item.category} className="flex items-center gap-4 mb-4">
                <span className="w-9 h-9 rounded-full bg-primary/8 text-primary flex items-center justify-center font-display font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{scheinCategoryDescriptions[item.category] || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
          <div className="bg-card rounded-3xl p-8 border border-border/60 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-4 mb-6">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full" />
              <div>
              <h3 className="text-lg font-bold font-display text-foreground tracking-wide">ההמלצות של סגי</h3>
                <p className="text-sm text-muted-foreground">
                  {aiRecommendations ? 'תובנות והמלצות מהשיחה עם היועץ' : 'כיוונים שמתאימים בדיוק לפרופיל שלכם'}
                </p>
              </div>
            </div>
            {aiRecommendations ? (
              <div className="bg-background rounded-2xl p-6 border border-border/60">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-display [&_h2]:text-base [&_h2]:font-display [&_h3]:text-sm [&_h3]:font-display [&_ul]:mr-4 [&_ol]:mr-4 [&_li]:mb-1" dir="rtl">
                  <ReactMarkdown>{aiRecommendations}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {staticRecommendations.map((rec, i) => (
                  <a
                    key={i}
                    href={rec.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-background rounded-2xl p-6 border border-border/60 hover:border-secondary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold font-display text-foreground group-hover:text-secondary transition-colors tracking-wide">{rec.title}</h4>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            rec.type === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                            rec.type === 'freelance' ? 'bg-primary/15 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-1">{rec.description}</p>
                        <p className="text-xs text-secondary italic">{rec.reason}</p>
                        <span className="text-xs text-secondary font-medium">
                          מצאו הזדמנויות ב-{rec.platform} →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={4} className="space-y-8">
          <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">חוזקות VIA – כל הקטגוריות</h3>
            <div className="space-y-4">
              {Object.entries(viaScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{viaCategoryDescriptions[cat] || ''}</p>
                    <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full progress-bar-fill"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">עוגנים תעסוקתיים – כל הקטגוריות</h3>
            <div className="space-y-4">
              {Object.entries(scheinScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{scheinCategoryDescriptions[cat] || ''}</p>
                    <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full progress-bar-fill"
                        style={{ width: `${(score / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Extra results */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={5} className="space-y-8">
          {topHolland.length > 0 && (
            <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">נטיות תעסוקתיות (הולנד)</h3>
              <div className="space-y-4">
                {Object.entries(hollandScores || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, score]) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{cat}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{hollandCategoryDescriptions[cat] || ''}</p>
                      <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full progress-bar-fill"
                          style={{ width: `${(score / 11) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {topConsiderations.length > 0 && (
            <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">שיקולים מובילים</h3>
              <div className="space-y-3">
                {topConsiderations.map(([item, pts]) => (
                  <div key={item} className="flex justify-between items-center bg-background rounded-2xl px-5 py-3.5 border border-border/60">
                    <span className="font-medium text-foreground">{item}</span>
                    <span className="text-secondary font-bold font-display text-lg">{pts} נק׳</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {winnerSkills.length > 0 && (
            <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">כישורים מובילים</h3>
              <div className="space-y-3">
                {winnerSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background rounded-2xl px-5 py-3.5 border border-border/60">
                    <span className="w-8 h-8 rounded-full bg-secondary/8 text-secondary flex items-center justify-center font-display font-bold text-sm">{i + 1}</span>
                    <span className="text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preferencesData && (
            <div className="bg-card rounded-3xl p-7 border border-border/60 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold font-display text-foreground mb-5 tracking-wide">העדפות אישיות</h3>
              <div className="space-y-3">
                {Object.entries(preferencesData.preferences).map(([key, values]) => (
                  <div key={key} className="bg-background rounded-2xl px-5 py-3.5 border border-border/60">
                    {values.map((v, i) => (
                      <p key={i} className="text-foreground text-sm">✓ {v}</p>
                    ))}
                  </div>
                ))}
              </div>
              {preferencesData.dream && (
                <div className="mt-5 bg-secondary/5 rounded-2xl px-5 py-4 border border-secondary/20">
                  <p className="font-bold font-display text-foreground tracking-wide">✦ חלום המגירה:</p>
                  <p className="text-secondary font-semibold text-lg">{preferencesData.dream}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Owl AI Chat */}
        <div className={`print:hidden transition-all duration-700 ${showExtra ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <OwlChat
            profileSummary={profileSummary}
            initialMessages={chatMessages}
            onMessagesChange={onChatMessagesChange}
          />
        </div>

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
