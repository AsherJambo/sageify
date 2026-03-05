import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/sageify-owl-icon.jpeg';
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

  const [showHeader, setShowHeader] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowHeader(true), 200);
    setTimeout(() => setShowNarrative(true), 800);
    setTimeout(() => setShowCards(true), 1400);
    setTimeout(() => setShowRecommendations(true), 2000);
    setTimeout(() => setShowCharts(true), 2600);
    setTimeout(() => setShowExtra(true), 3200);
  }, []);

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
        <div className={`text-center space-y-5 transition-all duration-1000 ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto rounded-full shadow-[var(--shadow-elevated)] animate-float" />
          <p className="text-lg text-secondary font-medium tracking-wide">{owlCelebrations.profileReady}</p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">
            הפרופיל שלכם ב-<span className="text-secondary">Sageify</span>
          </h1>
        </div>

        {/* AI Narrative */}
        <div className={`transition-all duration-700 ${showNarrative ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-start gap-3">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold font-serif text-secondary mb-2">{owlCelebrations.narrative}תובנה מרכזית</h3>
                <p className="text-foreground leading-relaxed text-lg">{generateNarrative()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Highlights */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 ${showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <h3 className="text-lg font-bold font-serif text-foreground mb-1">🌟 חוזקות מובילות (VIA)</h3>
            <p className="text-sm text-muted-foreground mb-4">{owlCelebrations.topStrength}</p>
            {topVIA.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{viaCategoryDescriptions[item.category] || ''}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <h3 className="text-lg font-bold font-serif text-foreground mb-1">🧭 עוגנים מובילים (שיין)</h3>
            <p className="text-sm text-muted-foreground mb-4">{owlCelebrations.topAnchor}</p>
            {topSchein.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{scheinCategoryDescriptions[item.category] || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className={`transition-all duration-700 ${showRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <img src={owlLogo} alt="" className="w-10 h-10 rounded-full" />
              <div>
              <h3 className="text-lg font-bold font-serif text-foreground">ההמלצות של סגי</h3>
                <p className="text-sm text-muted-foreground">
                  {aiRecommendations ? 'תובנות והמלצות מהשיחה עם היועץ' : 'הנה כיוונים שמתאימים בדיוק לפרופיל שלכם'}
                </p>
              </div>
            </div>
            {aiRecommendations ? (
              <div className="bg-background rounded-xl p-5 border border-border">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-serif [&_h2]:text-base [&_h2]:font-serif [&_h3]:text-sm [&_h3]:font-serif [&_ul]:mr-4 [&_ol]:mr-4 [&_li]:mb-1" dir="rtl">
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
                    className="block bg-background rounded-xl p-5 border border-border hover:border-secondary/50 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold font-serif text-foreground group-hover:text-secondary transition-colors">{rec.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                          מצאו הזדמנויות ב-{rec.platform} ←
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className={`space-y-6 transition-all duration-700 ${showCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">חוזקות VIA – כל הקטגוריות</h3>
            <div className="space-y-3">
              {Object.entries(viaScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{viaCategoryDescriptions[cat] || ''}</p>
                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full progress-bar-fill"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">עוגנים תעסוקתיים – כל הקטגוריות</h3>
            <div className="space-y-3">
              {Object.entries(scheinScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{scheinCategoryDescriptions[cat] || ''}</p>
                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full progress-bar-fill"
                        style={{ width: `${(score / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Extra results */}
        <div className={`space-y-6 transition-all duration-700 ${showExtra ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {topHolland.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
              <h3 className="text-lg font-bold font-serif text-foreground mb-4">🔍 נטיות תעסוקתיות (הולנד)</h3>
              <div className="space-y-3">
                {Object.entries(hollandScores || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, score]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{cat}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{hollandCategoryDescriptions[cat] || ''}</p>
                      <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
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
            <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
              <h3 className="text-lg font-bold font-serif text-foreground mb-4">📋 שיקולים מובילים</h3>
              <div className="space-y-3">
                {topConsiderations.map(([item, pts]) => (
                  <div key={item} className="flex justify-between items-center bg-background rounded-xl px-4 py-3 border border-border">
                    <span className="font-medium text-foreground">{item}</span>
                    <span className="text-secondary font-bold text-lg">{pts} נק׳</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {winnerSkills.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
              <h3 className="text-lg font-bold font-serif text-foreground mb-4">🏆 כישורים מובילים</h3>
              <div className="space-y-2">
                {winnerSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border">
                    <span className="w-7 h-7 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">{i + 1}</span>
                    <span className="text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preferencesData && (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
              <h3 className="text-lg font-bold font-serif text-foreground mb-4">⚙️ העדפות אישיות</h3>
              <div className="space-y-3">
                {Object.entries(preferencesData.preferences).map(([key, values]) => (
                  <div key={key} className="bg-background rounded-xl px-4 py-3 border border-border">
                    {values.map((v, i) => (
                      <p key={i} className="text-foreground text-sm">✓ {v}</p>
                    ))}
                  </div>
                ))}
              </div>
              {preferencesData.dream && (
                <div className="mt-4 bg-secondary/10 rounded-xl px-4 py-3 border border-secondary/30">
                  <p className="font-bold font-serif text-foreground">🌟 חלום המגירה:</p>
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
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium font-serif hover:bg-primary/90 transition-colors mx-2 shadow-md"
          >
            📄 הורדה כ-PDF
          </button>
          <br />
          <p className="text-muted-foreground mb-3 text-sm">סגי תמיד כאן אם תרצו לעבור שוב</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            התחלה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
