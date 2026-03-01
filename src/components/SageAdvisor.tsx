import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/owl-logo.png';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ChatMessage } from '@/components/OwlChat';
import { getTopCategories } from '@/lib/scoring';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';

interface SageAdvisorProps {
  username?: string;
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
  username,
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

  // Check if roadmap already exists in initial messages
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

  // Build profile summary
  const topVIA = getTopCategories(viaScores, 3);
  const topSchein = getTopCategories(scheinScores, 3);

  const topHolland = hollandScores
    ? Object.entries(hollandScores).sort(([, a], [, b]) => b - a).slice(0, 3)
    : [];

  const winnerSkills = skillsAssignments
    ? Object.entries(skillsAssignments)
        .filter(([, col]) => col === 'winner')
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
    parts.push(`עוגני קריירה מובילים: ${topSchein.map(t => `${t.category} (${t.score.toFixed(1)})`).join(', ')}`);
    if (topHolland.length > 0) parts.push(`נטיות הולנד: ${topHolland.map(([c, s]) => `${c} (${s})`).join(', ')}`);
    if (winnerSkills.length > 0) parts.push(`כישורי מנצח: ${winnerSkills.join(', ')}`);
    if (topConsiderations.length > 0) parts.push(`שיקולים מובילים: ${topConsiderations.map(([c, p]) => `${c} (${p} נק׳)`).join(', ')}`);
    if (preferencesData?.dream) parts.push(`חלום המגירה: ${preferencesData.dream}`);
    return parts.join('\n');
  }, []);

  const streamChat = async (allMessages: ChatMessage[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eXlpcml6aG53a212Y2JueXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjI4MjUsImV4cCI6MjA4NzY5ODgyNX0.pEstDk6163sy5MC2JuhcvW7A1a8KCEjrkw5ZJ1-40TQ'}`,
      },
      body: JSON.stringify({ messages: allMessages, profileSummary }),
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
            // Detect roadmap
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

  // Auto-start on mount
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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
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

  // Loading phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <img src={owlLogo} alt="Sage Advisor" className="w-28 h-28 mx-auto animate-float" />
          <h2 className="text-2xl font-bold text-foreground">
            ה-Sage Advisor מנתח את התשובות שלך...
          </h2>
          <p className="text-muted-foreground">
            מעבד את הפרופיל שלך ומכין תובנות מותאמות אישית
          </p>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full progress-bar-fill animate-pulse"
              style={{ width: '85%' }}
            />
          </div>
          <p className="text-sm text-muted-foreground">85%</p>
        </div>
      </div>
    );
  }

  // Chat phase
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-2xl flex flex-col" style={{ minHeight: 'calc(100vh - 48px)' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="relative">
            <img src={owlLogo} alt="" className="w-14 h-14 rounded-full ring-2 ring-accent/40" />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Sage Career Advisor</h2>
            <p className="text-sm text-muted-foreground">
              {isStreaming ? '🟢 כותב...' : '🟢 מחובר'}
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-4" dir="rtl">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <img src={owlLogo} alt="" className="w-9 h-9 rounded-full flex-shrink-0 mt-1 ring-1 ring-accent/30" />
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-accent/20 text-foreground rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-accent [&_h2]:text-accent [&_h3]:text-accent [&_strong]:text-accent [&_li]:mb-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <img src={owlLogo} alt="" className="w-9 h-9 rounded-full flex-shrink-0 mt-1 ring-1 ring-accent/30" />
              <div className="bg-card border border-accent/20 rounded-2xl rounded-bl-sm px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Roadmap detected → finish button */}
        {roadmapDetected && !isStreaming && (
          <div className="px-2 py-4 border-t border-border">
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-center space-y-3">
              <p className="text-foreground font-semibold">✅ מפת הדרכים שלך מוכנה!</p>
              <Button
                onClick={() => {
                  setPhase('done');
                  onFinish?.();
                }}
                className="w-full py-6 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
              >
                סיום והמשך לסיכום 🦉
              </Button>
            </div>
          </div>
        )}

        {/* Input area */}
        {!roadmapDetected && (
          <div className="border-t border-border pt-3 flex gap-2" dir="rtl">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתבו הודעה ל-Sage Advisor..."
              className="resize-none min-h-[48px] max-h-[120px] bg-card border-accent/20"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="px-5 self-end bg-accent text-accent-foreground hover:bg-accent/90"
            >
              שלח
            </Button>
          </div>
        )}

        {/* Continue chatting even after roadmap */}
        {roadmapDetected && !isStreaming && (
          <div className="flex gap-2 mt-2" dir="rtl">
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
              className="resize-none min-h-[44px] max-h-[100px] bg-card border-accent/20"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="px-4 self-end"
              variant="outline"
            >
              שלח
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SageAdvisor;
