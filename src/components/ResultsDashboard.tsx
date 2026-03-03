import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/owl-logo.png';
import { getTopCategories } from '@/lib/scoring';
import { owlCelebrations } from '@/lib/owlMessages';
import { getRecommendations, type Recommendation } from '@/lib/recommendations';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';
import OwlChat, { type ChatMessage } from '@/components/OwlChat';

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
  viaScores,
  scheinScores,
  hollandScores,
  considerationsData,
  skillsAssignments,
  preferencesData,
  chatMessages,
  onChatMessagesChange,
}: ResultsDashboardProps) => {
  const topVIA = getTopCategories(viaScores, 2);
  const topSchein = getTopCategories(scheinScores, 2);

  // Extract AI-based recommendations from chat messages
  const aiRecommendations = useMemo(() => {
    if (!chatMessages || chatMessages.length === 0) return null;
    
    // Find the last substantial assistant message (likely contains the roadmap)
    const assistantMessages = chatMessages
      .filter(m => m.role === 'assistant' && m.content.length > 100)
      .reverse();
    
    if (assistantMessages.length === 0) return null;
    
    // Combine all assistant messages for a comprehensive summary
    return assistantMessages
      .slice(0, 3) // Take last 3 substantial messages
      .reverse()
      .map(m => m.content)
      .join('\n\n');
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

  // Winner skills
  const winnerSkills = skillsAssignments
    ? Object.entries(skillsAssignments)
        .filter(([, col]) => col === 'winner')
        .map(([id]) => skills.find(s => s.id === Number(id))?.text)
        .filter(Boolean)
    : [];

  // Top Holland
  const topHolland = hollandScores
    ? Object.entries(hollandScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  // Top considerations
  const topConsiderations = considerationsData
    ? Object.entries(considerationsData.points)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  // Build profile summary for AI (synced with SageAdvisor)
  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    parts.push(`חוזקות VIA מובילות: ${topVIA.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`עוגני קריירה מובילים: ${topSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    if (topHolland.length > 0) parts.push(`נטיות הולנד מובילות: ${topHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (winnerSkills.length > 0) parts.push(`כישורי מנצח: ${winnerSkills.join(', ')}`);
    if (topConsiderations.length > 0) parts.push(`שיקולים מובילים: ${topConsiderations.map(([c, p]) => `${c} (${p} נק׳)`).join(', ')}`);
    if (preferencesData?.dream) parts.push(`חלום המגירה: ${preferencesData.dream}`);
    // Sync recommendations from report
    parts.push(`\nהמלצות עיסוק שעלו בדו"ח האישי:`);
    staticRecommendations.forEach((rec, i) => {
      parts.push(`${i + 1}. ${rec.title} (${rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}) – ${rec.description}`);
    });
    return parts.join('\n');
  }, [topVIA, topSchein, topHolland, winnerSkills, topConsiderations, preferencesData, staticRecommendations]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header with celebration */}
        <div className={`text-center space-y-4 transition-all duration-700 ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <img src={owlLogo} alt="Sageify" className="w-24 h-24 mx-auto animate-float" />
          <p className="text-lg text-accent font-semibold">{owlCelebrations.profileReady}</p>
          <h1 className="text-3xl font-bold text-foreground">
            הפרופיל שלכם ב-<span className="text-accent">Sageify</span>
          </h1>
        </div>

        {/* AI Narrative with owl */}
        <div className={`transition-all duration-700 ${showNarrative ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-accent/30 shadow-md">
            <div className="flex items-start gap-3">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-accent mb-2">{owlCelebrations.narrative}תובנה מרכזית</h3>
                <p className="text-foreground leading-relaxed text-lg">{generateNarrative()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Highlights */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 ${showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">🌟 חוזקות מובילות (VIA)</h3>
            <p className="text-sm text-muted-foreground mb-4">{owlCelebrations.topStrength}</p>
            {topVIA.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">ציון: {item.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">🧭 עוגנים מובילים (שיין)</h3>
            <p className="text-sm text-muted-foreground mb-4">{owlCelebrations.topAnchor}</p>
            {topSchein.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-lg">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">ציון: {item.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations - AI-based from advisor chat */}
        <div className={`transition-all duration-700 ${showRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="bg-card rounded-2xl p-6 border border-accent/30 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <img src={owlLogo} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="text-lg font-bold text-foreground">🦉 ההמלצות של הינשוף</h3>
                <p className="text-sm text-muted-foreground">
                  {aiRecommendations ? 'תובנות והמלצות מהשיחה עם היועץ' : 'הנה 3 כיוונים שמתאימים בדיוק לפרופיל שלכם'}
                </p>
              </div>
            </div>
            {aiRecommendations ? (
              <div className="bg-background rounded-xl p-5 border border-border">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_ul]:mr-4 [&_ol]:mr-4 [&_li]:mb-1" dir="rtl">
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
                    className="block bg-background rounded-xl p-5 border border-border hover:border-accent/50 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-foreground group-hover:text-accent transition-colors">{rec.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rec.type === 'volunteer' ? 'bg-secondary/15 text-secondary' :
                            rec.type === 'freelance' ? 'bg-accent/15 text-accent' :
                            'bg-primary/15 text-primary'
                          }`}>
                            {rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{rec.description}</p>
                        <span className="text-xs text-accent font-medium">
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
          {/* VIA Chart */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">חוזקות VIA – כל הקטגוריות</h3>
            <div className="space-y-3">
              {Object.entries(viaScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground">{score.toFixed(1)}</span>
                    </div>
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

          {/* Schein Chart */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">עוגנים תעסוקתיים – כל הקטגוריות</h3>
            <div className="space-y-3">
              {Object.entries(scheinScores)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground">{score.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full progress-bar-fill"
                        style={{ width: `${(score / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Extra results from new questionnaires */}
        <div className={`space-y-6 transition-all duration-700 ${showExtra ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Holland RIASEC */}
          {topHolland.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">🔍 נטיות תעסוקתיות (הולנד)</h3>
              <div className="space-y-3">
                {Object.entries(hollandScores || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, score]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{cat}</span>
                        <span className="text-muted-foreground">{score} / 11</span>
                      </div>
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

          {/* Considerations */}
          {topConsiderations.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">📋 שיקולים מובילים</h3>
              <div className="space-y-3">
                {topConsiderations.map(([item, pts]) => (
                  <div key={item} className="flex justify-between items-center bg-background rounded-xl px-4 py-3 border border-border">
                    <span className="font-medium text-foreground">{item}</span>
                    <span className="text-accent font-bold text-lg">{pts} נק׳</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Winner Skills */}
          {winnerSkills.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">🏆 ארגז הכלים המנצח</h3>
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

          {/* Preferences & Dream */}
          {preferencesData && (
            <div className="bg-card rounded-2xl p-6 border border-accent/30 shadow-md">
              <h3 className="text-lg font-bold text-foreground mb-4">⚙️ העדפות אישיות</h3>
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
                <div className="mt-4 bg-accent/10 rounded-xl px-4 py-3 border border-accent/30">
                  <p className="font-bold text-foreground">🌟 חלום המגירה:</p>
                  <p className="text-accent font-semibold text-lg">{preferencesData.dream}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Owl AI Chat */}
        <div className={`transition-all duration-700 ${showExtra ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <OwlChat
            profileSummary={profileSummary}
            initialMessages={chatMessages}
            onMessagesChange={onChatMessagesChange}
          />
        </div>

        {/* Restart */}
        <div className="text-center pb-8">
          <p className="text-muted-foreground mb-3 text-sm">🦉 הינשוף תמיד כאן אם תרצו לעבור שוב</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            התחלה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
