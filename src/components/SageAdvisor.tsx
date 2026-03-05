import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/sageify-owl-icon.jpeg';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ChatMessage } from '@/components/OwlChat';
import { getTopCategories } from '@/lib/scoring';
import { getRecommendations } from '@/lib/recommendations';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';
import { viaCategoryDescriptions, scheinCategoryDescriptions, hollandCategoryDescriptions } from '@/data/categoryDescriptions';

interface SageAdvisorProps {
  username?: string;
  tokenId?: string;
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onRoadmapReady?: () => void;
  onFinish?: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mxyyirizhnwkmvcbnypn.supabase.co';
const CHAT_URL = `${SUPABASE_URL}/functions/v1/owl-chat`;

const SageAdvisor = ({
  username, tokenId,
  viaScores, scheinScores, hollandScores,
  considerationsData, skillsAssignments, preferencesData,
  initialMessages, onMessagesChange, onRoadmapReady, onFinish,
}: SageAdvisorProps) => {
  const [phase, setPhase] = useState<'loading' | 'chat' | 'done'>(
    initialMessages && initialMessages.length > 0 ? 'chat' : 'loading'
  );
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [roadmapDetected, setRoadmapDetected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages?.some(m => m.content.includes('Sage Action Roadmap'))) {
      setRoadmapDetected(true);
      setPhase('done');
      onRoadmapReady?.();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) onMessagesChange?.(messages);
  }, [messages]);

  const topVIA = getTopCategories(viaScores, 3);
  const topSchein = getTopCategories(scheinScores, 3);
  const recommendations = getRecommendations(viaScores, scheinScores);
  const bottomVIA = getTopCategories(viaScores, 100).slice(-2);
  const bottomSchein = getTopCategories(scheinScores, 100).slice(-2);

  const topHolland = hollandScores
    ? Object.entries(hollandScores).sort(([, a], [, b]) => b - a).slice(0, 3)
    : [];
  const bottomHolland = hollandScores
    ? Object.entries(hollandScores).sort(([, a], [, b]) => a - b).slice(0, 2)
    : [];

  const winnerSkills = skillsAssignments
    ? Object.entries(skillsAssignments)
        .filter(([, col]) => col === 'winner')
        .map(([id]) => skills.find(s => s.id === Number(id))?.text)
        .filter(Boolean)
    : [];

  const burnoutSkills = skillsAssignments
    ? Object.entries(skillsAssignments)
        .filter(([, col]) => col === 'burnout')
        .map(([id]) => skills.find(s => s.id === Number(id))?.text)
        .filter(Boolean)
    : [];

  const topConsiderations = considerationsData
    ? Object.entries(considerationsData.points).sort(([, a], [, b]) => b - a).slice(0, 6)
    : [];

  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    if (username) parts.push(`שם המשתמש: ${username}`);
    parts.push(`חוזקות VIA מובילות: ${topVIA.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`חוזקות VIA חלשות: ${bottomVIA.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`עוגני קריירה מובילים: ${topSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    parts.push(`עוגני קריירה חלשים: ${bottomSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    if (topHolland.length > 0) parts.push(`נטיות הולנד חזקות: ${topHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (bottomHolland.length > 0) parts.push(`נטיות הולנד חלשות: ${bottomHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (winnerSkills.length > 0) parts.push(`כישורים מובילים: ${winnerSkills.join(', ')}`);
    if (burnoutSkills.length > 0) parts.push(`כישורי שחיקה (להימנע): ${burnoutSkills.join(', ')}`);
    if (topConsiderations.length > 0) parts.push(`שיקולים מובילים: ${topConsiderations.map(([c, p]) => `${c} (${p} נק׳)`).join(', ')}`);
    if (preferencesData?.dream) parts.push(`חלום המגירה: ${preferencesData.dream}`);
    parts.push(`\nהמלצות עיסוק שעלו בדו"ח האישי:`);
    recommendations.forEach((rec, i) => {
      parts.push(`${i + 1}. ${rec.title} (${rec.type === 'volunteer' ? 'התנדבות' : rec.type === 'freelance' ? 'פרילנס' : 'עבודה'}) – ${rec.reason}`);
    });
    return parts.join('\n');
  }, []);

  const streamChat = async (allMessages: ChatMessage[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eXlpcml6aG53a212Y2JueXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjI4MjUsImV4cCI6MjA4NzY5ODgyNX0.pEstDk6163sy5MC2JuhcvW7A1a8KCEjrkw5ZJ1-40TQ'}`,
      },
      body: JSON.stringify({ messages: allMessages, profileSummary, tokenId }),
    });

    if (!resp.ok || !resp.body) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'שגיאה בחיבור ליועץ');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantSoFar = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            const current = assistantSoFar;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
              }
              return [...prev, { role: 'assistant', content: current }];
            });
            if (current.includes('Sage Action Roadmap') && !roadmapDetected) {
              setRoadmapDetected(true);
              onRoadmapReady?.();
            }
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(async () => {
      setPhase('chat');
      setIsStreaming(true);
      try {
        const initialMsg: ChatMessage = {
          role: 'user',
          content: 'שלום! סיימתי את כל שאלוני האבחון. אשמח לשמוע את הניתוח שלך ולבנות תכנית פעולה.',
        };
        setMessages([initialMsg]);
        await streamChat([initialMsg]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsStreaming(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!text) setInput('');
    setIsStreaming(true);
    try {
      await streamChat(newMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Journey action cards
  const journeyActions = [
    { icon: '🔍', label: 'מה פחות מתאים לי?', msg: 'ספר לי עוד על מה שפחות מתאים לי ולמה כדאי להימנע מזה' },
    { icon: '🎯', label: 'בניית תכנית פעולה', msg: 'אני מוכן! בוא נבנה תכנית פעולה קונקרטית' },
    { icon: '📊', label: 'דירוג כיוונים', msg: 'תן לי דירוג של 1-10 לכל כיוון תעסוקתי שעלה, עם הסבר קצר' },
    { icon: '💡', label: 'כיוונים יצירתיים', msg: 'תציע לי כיוונים יצירתיים ולא שגרתיים שאולי לא חשבתי עליהם' },
  ];

  // Loading phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center space-y-8">
          <img src={owlLogo} alt="Sage Advisor" className="w-28 h-28 mx-auto animate-float rounded-full shadow-[var(--shadow-elevated)]" />
          <h2 className="text-3xl font-bold font-display text-foreground tracking-wide">
            מנתח את התוצאות שלך...
          </h2>
          <p className="text-muted-foreground text-lg">
            מעבד את הפרופיל שלך ומכין תובנות מותאמות אישית
          </p>
          <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full progress-bar-fill animate-pulse"
              style={{ width: '85%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Get the latest assistant message for the journey card display
  const latestAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <img src={owlLogo} alt="" className="w-20 h-20 mx-auto rounded-full ring-2 ring-secondary/20 shadow-[var(--shadow-elevated)]" />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">Sage Career Advisor</h2>
          <p className="text-muted-foreground text-sm tracking-wide">
            {isStreaming ? '● מנתח ומייצר תובנות...' : '● מוכן לייעוץ'}
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-card rounded-3xl border border-border/60 p-8 shadow-[var(--shadow-card)]" dir="rtl">
          <h3 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-3 tracking-wide">
            <span className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-sm">📊</span>
            סיכום הפרופיל האישי שלך
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground">🌟 חוזקות מובילות</p>
              {topVIA.map(t => (
                <p key={t.category} className="text-muted-foreground pr-2">• {t.category} – {viaCategoryDescriptions[t.category] || ''}</p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground">🧭 עוגני קריירה</p>
              {topSchein.map(t => (
                <p key={t.category} className="text-muted-foreground pr-2">• {t.category} – {scheinCategoryDescriptions[t.category] || ''}</p>
              ))}
            </div>
            {topHolland.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">🔍 נטיות הולנד</p>
                {topHolland.map(([c]) => (
                  <p key={c} className="text-muted-foreground pr-2">• {c} – {hollandCategoryDescriptions[c] || ''}</p>
                ))}
              </div>
            )}
            {winnerSkills.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">🏆 כישורים מובילים</p>
                {winnerSkills.slice(0, 4).map((s, i) => (
                  <p key={i} className="text-muted-foreground pr-2">• {s}</p>
                ))}
              </div>
            )}
          </div>
          {recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="font-semibold text-foreground mb-2">💡 הצעות עיסוק מהדו"ח</p>
              {recommendations.map((rec, i) => (
                <p key={i} className="text-muted-foreground text-sm pr-2">
                  {rec.icon} {rec.title} – {rec.reason}
                </p>
              ))}
            </div>
          )}
          {preferencesData?.dream && (
            <div className="mt-3">
              <p className="text-secondary font-semibold text-sm">⭐ חלום המגירה: {preferencesData.dream}</p>
            </div>
          )}
        </div>

        {/* Advisor Response Card — Guided Journey style */}
        {latestAssistantMsg && (
          <div className="bg-card rounded-3xl border border-border/60 p-10 shadow-[var(--shadow-card)]" dir="rtl">
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-border/60">
              <img src={owlLogo} alt="" className="w-12 h-12 rounded-full ring-1 ring-secondary/20" />
              <div>
                <p className="font-semibold font-display text-foreground tracking-wide">סגי – יועץ הקריירה שלך</p>
                <p className="text-xs text-muted-foreground">ניתוח מבוסס AI</p>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:text-secondary [&_h1]:font-display [&_h2]:text-secondary [&_h2]:font-display [&_h3]:text-secondary [&_h3]:font-display [&_strong]:text-secondary [&_li]:mb-1.5 text-foreground leading-relaxed">
              <ReactMarkdown>{latestAssistantMsg.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && !latestAssistantMsg && (
          <div className="bg-card rounded-3xl border border-border/60 p-10 shadow-[var(--shadow-card)] text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-muted-foreground text-sm mt-4">סגי מנתח את הנתונים שלך...</p>
          </div>
        )}

        {/* Roadmap detected → finish */}
        {roadmapDetected && !isStreaming && (
          <div className="bg-card rounded-3xl border border-secondary/20 p-10 shadow-[var(--shadow-elevated)] text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/8 flex items-center justify-center text-3xl">✓</div>
            <h3 className="text-xl font-bold font-display text-foreground tracking-wide">מפת הדרכים שלך מוכנה</h3>
            <p className="text-muted-foreground text-sm">כל התובנות וההמלצות מחכות לך בסיכום</p>
            <Button
              onClick={() => {
                setPhase('done');
                onFinish?.();
              }}
              className="w-full max-w-sm mx-auto py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/85 rounded-2xl shadow-[var(--shadow-elevated)] font-display tracking-wide"
            >
              סיום והמשך לסיכום
            </Button>
          </div>
        )}

        {/* Journey Action Cards — replaces chat input */}
        {!roadmapDetected && !isStreaming && messages.length >= 2 && (
          <div dir="rtl" className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground text-center">בחרו את הצעד הבא:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journeyActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.msg)}
                  className="group bg-card hover:bg-muted border border-border hover:border-secondary/40 rounded-xl p-5 text-right transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="text-2xl mb-2 block">{action.icon}</span>
                  <p className="font-semibold text-foreground group-hover:text-secondary transition-colors font-serif">
                    {action.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Free-text input — collapsible, secondary to action cards */}
        {!roadmapDetected && !isStreaming && messages.length >= 2 && (
          <div className="border-t border-border pt-4" dir="rtl">
            <p className="text-xs text-muted-foreground mb-2 text-center">או כתבו שאלה חופשית:</p>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="כתבו שאלה ליועץ..."
                className="resize-none min-h-[48px] max-h-[100px] bg-card border-border rounded-xl"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className="px-5 self-end bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl"
              >
                שלח
              </Button>
            </div>
          </div>
        )}

        {/* Continue chatting after roadmap */}
        {roadmapDetected && !isStreaming && (
          <div className="flex gap-2" dir="rtl">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="יש עוד שאלות? המשיכו לשוחח..."
              className="resize-none min-h-[44px] max-h-[100px] bg-card border-border rounded-xl"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="px-4 self-end rounded-xl"
              variant="outline"
            >
              שלח
            </Button>
          </div>
        )}

        {/* Previous messages — expandable history */}
        {messages.filter(m => m.role === 'user').length > 1 && (
          <details className="text-sm" dir="rtl">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-center py-2">
              📜 הצג היסטוריית שיחה ({messages.length} הודעות)
            </summary>
            <div className="mt-3 space-y-3 max-h-[400px] overflow-y-auto px-2">
              {messages.slice(0, -1).map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary/5 border border-primary/10 mr-auto max-w-[85%]'
                      : 'bg-card border border-border ml-auto max-w-[85%]'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1 [&_p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{msg.content}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default SageAdvisor;
