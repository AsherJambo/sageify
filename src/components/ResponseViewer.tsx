import { generatePrintHTML } from '@/lib/pdfTemplate';
import { viaQuestions, viaCategories } from '@/data/viaQuestions';
import { scheinQuestions, scheinCategories } from '@/data/scheinQuestions';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import { skills } from '@/data/skillsData';
import { preferenceQuestions, dreamOptions } from '@/data/preferencesData';
import { calculateCategoryScores, getTopCategories, type Answers } from '@/lib/scoring';
import { Button } from '@/components/ui/button';

interface ResponseViewerProps {
  username: string;
  idNumber?: string | null;
  responseData: Record<string, unknown>;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold mb-3 text-primary border-b border-border pb-1">{title}</h3>
    {children}
  </div>
);

const ScoreBar = ({ label, score, max }: { label: string; score: number; max: number }) => (
  <div className="flex items-center gap-3 mb-1.5">
    <span className="text-sm w-36 text-right shrink-0">{label}</span>
    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${(score / max) * 100}%` }}
      />
    </div>
    <span className="text-xs text-muted-foreground w-10 text-left">{score.toFixed(1)}</span>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'muted' }) => {
  const colors = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    muted: 'bg-muted text-muted-foreground',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>{children}</span>;
};

const ResponseViewer = ({ username, idNumber, responseData, onClose }: ResponseViewerProps) => {
  const data = responseData as {
    step?: string;
    viaAnswers?: Answers;
    scheinAnswers?: Answers;
    finalViaAnswers?: Answers;
    finalScheinAnswers?: Answers;
    hollandAnswers?: Record<string, boolean>;
    skillsAssignments?: Record<string, string>;
    considerationsData?: { selected: string[]; points: Record<string, number> };
    preferencesData?: { preferences: Record<string, string[]>; dream: string };
    chatMessages?: { role: 'user' | 'assistant'; content: string }[];
  };

  // VIA scores
  const viaAnswers = data.finalViaAnswers || data.viaAnswers || {};
  const viaScores = calculateCategoryScores(viaAnswers, viaQuestions, viaCategories);
  const topVia = getTopCategories(viaScores, 3);
  const viaMax = Math.max(...Object.values(viaScores), 1);

  // Schein scores
  const scheinAnswers = data.finalScheinAnswers || data.scheinAnswers || {};
  const scheinScores = calculateCategoryScores(scheinAnswers, scheinQuestions, scheinCategories);
  const topSchein = getTopCategories(scheinScores, 3);
  const scheinMax = Math.max(...Object.values(scheinScores), 1);

  // Holland scores
  const hollandAnswers = data.hollandAnswers || {};
  const hollandScores: Record<string, number> = {};
  hollandCategories.forEach(cat => { hollandScores[cat] = 0; });
  Object.entries(hollandAnswers).forEach(([id, val]) => {
    if (val) {
      const q = hollandQuestions.find(q => q.id === Number(id));
      if (q) hollandScores[q.category] = (hollandScores[q.category] || 0) + 1;
    }
  });
  const topHolland = Object.entries(hollandScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const hollandMax = Math.max(...Object.values(hollandScores), 1);

  // Skills
  const skillsAssignments = data.skillsAssignments || {};
  const winnerSkills = Object.entries(skillsAssignments)
    .filter(([, col]) => col === 'winner')
    .map(([id]) => skills.find(s => s.id === Number(id))?.text)
    .filter(Boolean);
  const burnoutSkills = Object.entries(skillsAssignments)
    .filter(([, col]) => col === 'burnout')
    .map(([id]) => skills.find(s => s.id === Number(id))?.text)
    .filter(Boolean);

  // Considerations
  const considerations = data.considerationsData;

  // Preferences
  const preferences = data.preferencesData;

  const hasData = (obj: object) => Object.keys(obj).length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-auto" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h2 className="text-xl font-bold">תוצאות: {username}</h2>
            {idNumber && <p className="text-sm text-muted-foreground">ת.ז: {idNumber}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              const printContent = document.getElementById('response-viewer-content');
              if (!printContent) return;
              const win = window.open('', '_blank');
              if (!win) return;
              win.document.write(generatePrintHTML(username, printContent.innerHTML, idNumber));
              win.document.close();
              setTimeout(() => { win.print(); }, 400);
            }}>
              📄 PDF
            </Button>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </div>

        <div id="response-viewer-content">

        {/* VIA */}
        {hasData(viaAnswers) && (
          <Section title="💜 חוזקות VIA">
            <div className="mb-3 flex gap-2 flex-wrap">
              {topVia.map(t => <Badge key={t.category} variant="success">⭐ {t.category}</Badge>)}
            </div>
            {Object.entries(viaScores).sort(([,a],[,b]) => b - a).map(([cat, score]) => (
              <ScoreBar key={cat} label={cat} score={score} max={viaMax} />
            ))}
          </Section>
        )}

        {/* Schein */}
        {hasData(scheinAnswers) && (
          <Section title="⚓ עוגני קריירה (שיין)">
            <div className="mb-3 flex gap-2 flex-wrap">
              {topSchein.map(t => <Badge key={t.category} variant="success">⭐ {t.category}</Badge>)}
            </div>
            {Object.entries(scheinScores).sort(([,a],[,b]) => b - a).map(([cat, score]) => (
              <ScoreBar key={cat} label={cat} score={score} max={scheinMax} />
            ))}
          </Section>
        )}

        {/* Holland */}
        {hasData(hollandAnswers) && (
          <Section title="🔍 קוד הולנד">
            <div className="mb-3 flex gap-2 flex-wrap">
              {topHolland.map(([cat]) => <Badge key={cat} variant="success">⭐ {cat}</Badge>)}
            </div>
            {Object.entries(hollandScores).sort(([,a],[,b]) => b - a).map(([cat, score]) => (
              <ScoreBar key={cat} label={cat} score={score} max={hollandMax} />
            ))}
          </Section>
        )}

        {/* Skills */}
        {hasData(skillsAssignments) && (
          <Section title="🏆 כישורים">
            {winnerSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1 text-green-700 dark:text-green-400">✅ כישורי מנצח:</p>
                <ul className="text-sm space-y-1 mr-4">
                  {winnerSkills.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            {burnoutSkills.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-1 text-yellow-700 dark:text-yellow-400">⚠️ כישורי שחיקה:</p>
                <ul className="text-sm space-y-1 mr-4">
                  {burnoutSkills.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
          </Section>
        )}

        {/* Considerations */}
        {considerations && considerations.selected?.length > 0 && (
          <Section title="⚖️ שיקולים בבחירת מקצוע">
            <div className="space-y-1.5">
              {considerations.selected
                .sort((a, b) => (considerations.points[b] || 0) - (considerations.points[a] || 0))
                .map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="text-sm flex-1">{item}</span>
                    <Badge variant="default">{considerations.points[item] || 0} נק׳</Badge>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* Preferences */}
        {preferences && (
          <Section title="🎯 העדפות">
            {preferenceQuestions.map(q => {
              const selected = preferences.preferences?.[q.id];
              if (!selected?.length) return null;
              return (
                <div key={q.id} className="mb-3">
                  <p className="text-sm font-semibold mb-1">{q.title}</p>
                  <ul className="text-sm mr-4 space-y-0.5">
                    {selected.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              );
            })}
            {preferences.dream && (
              <div className="mt-2">
                <p className="text-sm font-semibold mb-1">🌟 מגירת חלומות:</p>
                <Badge variant="warning">{preferences.dream}</Badge>
              </div>
            )}
          </Section>
        )}

        {/* Chat Messages */}
        {data.chatMessages && data.chatMessages.length > 0 && (
          <Section title="שיחה עם סגי היועץ">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary/10 text-foreground mr-8'
                      : 'bg-muted text-foreground ml-8'
                  }`}
                >
                  <p className="text-xs font-bold mb-1 text-muted-foreground">
                    {msg.role === 'user' ? '👤 המשתמש' : '🌿 סגי'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Current step */}
        <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
          שלב נוכחי: <Badge variant="muted">{data.step || 'לא ידוע'}</Badge>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;
