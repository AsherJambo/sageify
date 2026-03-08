import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/owl-logo.png';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ChatMessage } from '@/components/OwlChat';
import { getTopCategories } from '@/lib/scoring';
import { getRecommendations } from '@/lib/recommendations';
import type { SkillColumn } from '@/data/skillsData';
import { skills } from '@/data/skillsData';
import { viaCategoryDescriptions, scheinCategoryDescriptions, hollandCategoryDescriptions } from '@/data/categoryDescriptions';
import { useLiveSearch, type SearchResult } from '@/hooks/useLiveSearch';
import SearchResultsCards from '@/components/SearchResultsCards';
import { supabase } from '@/integrations/supabase/client';

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
  const [searchResultsByMessage, setSearchResultsByMessage] = useState<Record<number, SearchResult[]>>({});
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

  // === Debug Logging: Data sent to AI Advisor ===
  useEffect(() => {
    console.group('%c🦉 Sageify Advisor — Data Pipeline', 'color: #d4a017; font-weight: bold; font-size: 14px');
    console.log('%c📊 VIA Scores:', 'color: #4CAF50; font-weight: bold', viaScores);
    console.log('%c⚓ Schein Scores:', 'color: #2196F3; font-weight: bold', scheinScores);
    console.log('%c🔬 Holland Scores:', 'color: #9C27B0; font-weight: bold', hollandScores || 'N/A');
    console.log('%c🎯 Top VIA:', 'color: #4CAF50', topVIA);
    console.log('%c🎯 Top Schein:', 'color: #2196F3', topSchein);
    console.log('%c🎯 Top Holland:', 'color: #9C27B0', topHolland);
    console.log('%c🏆 Winner Skills:', 'color: #FF9800; font-weight: bold', winnerSkills);
    console.log('%c🔥 Burnout Skills:', 'color: #f44336', burnoutSkills);
    console.log('%c⚖️ Top Considerations:', 'color: #00BCD4', topConsiderations);
    console.log('%c💭 Dream:', 'color: #E91E63', preferencesData?.dream || 'N/A');
    console.log('%c📋 Preferences:', 'color: #795548', preferencesData?.preferences || 'N/A');
    console.log('%c📝 Profile Summary (sent to AI):\n', 'color: #607D8B; font-weight: bold', profileSummary);
    console.log('%c🎫 Token ID:', 'color: #9E9E9E', tokenId || 'anonymous');
    console.log('%c📦 Recommendations:', 'color: #FF5722', recommendations);
    console.groupEnd();
  }, []);

  const { searchState, executeSearch, extractSearchQueries, cleanSearchTags } = useLiveSearch(profileSummary);

  // Auto-extract and save opportunities from AI responses
  const savedOpportunityTitles = useRef<Set<string>>(new Set());

  const extractAndSaveOpportunities = useCallback(async (text: string) => {
    const regex = /\[OPPORTUNITY_LOG:\s*(\{[\s\S]*?\})\]/g;
    let match;
    const opportunities: Array<{
      title: string; category: string; organization: string;
      description: string; whyFits: string; location: string; link: string;
    }> = [];

    while ((match = regex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.title && !savedOpportunityTitles.current.has(parsed.title)) {
          opportunities.push(parsed);
        }
      } catch { /* skip malformed */ }
    }

    for (const opp of opportunities) {
      try {
        await supabase.from('opportunities').insert([{
          title: opp.title,
          organization_name: opp.organization || 'לא צוין',
          category: opp.category || 'work',
          description: opp.description || '',
          link: opp.link || '',
          location: opp.location || null,
          target_traits: JSON.parse(JSON.stringify({
            source: 'ai-advisor',
            whyFits: opp.whyFits || '',
            tokenId: tokenId || '',
          })),
        }]);
        savedOpportunityTitles.current.add(opp.title);
        console.log('Auto-saved opportunity:', opp.title);
      } catch (e) {
        console.error('Auto-save opportunity error:', e);
      }
    }
  }, [tokenId]);

  const cleanOpportunityTags = useCallback((text: string): string => {
    return text.replace(/\[OPPORTUNITY_LOG:\s*\{[\s\S]*?\}\]/g, '').trim();
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

  // Process search queries from AI response
  const processSearchQueries = async (assistantContent: string, msgIndex: number) => {
    const queries = extractSearchQueries(assistantContent);
    if (queries.length === 0) return;

    // Clean search tags from the displayed message
    setMessages(prev => prev.map((m, i) => 
      i === msgIndex ? { ...m, content: cleanSearchTags(m.content) } : m
    ));

    // Execute first search query
    const results = await executeSearch(queries[0]);
    if (results.length > 0) {
      setSearchResultsByMessage(prev => ({ ...prev, [msgIndex]: results }));
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
        // After streaming, check for search queries and auto-save opportunities
        setMessages(prev => {
          const lastAssistant = prev.findIndex((m, i) => m.role === 'assistant' && i === prev.length - 1);
          if (lastAssistant >= 0) {
            processSearchQueries(prev[lastAssistant].content, lastAssistant);
            extractAndSaveOpportunities(prev[lastAssistant].content);
          }
          return prev;
        });
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
      // Check for search queries and auto-save opportunities after streaming
      setMessages(prev => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'assistant') {
          processSearchQueries(prev[lastIdx].content, lastIdx);
          extractAndSaveOpportunities(prev[lastIdx].content);
        }
        return prev;
      });
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
    { icon: '🔍', label: 'חפש לי הזדמנויות', msg: 'חפש לי הזדמנויות ספציפיות שמתאימות לפרופיל שלי - עבודה, התנדבות או קורסים' },
    { icon: '◆', label: 'בניית תכנית פעולה', msg: 'אני מוכן! בוא נבנה תכנית פעולה קונקרטית' },
    { icon: '✦', label: 'דירוג כיוונים', msg: 'תן לי דירוג של 1-10 לכל כיוון תעסוקתי שעלה, עם הסבר קצר' },
    { icon: '●', label: 'כיוונים יצירתיים', msg: 'תציע לי כיוונים יצירתיים ולא שגרתיים שאולי לא חשבתי עליהם' },
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

  // Separate messages for display
  const visibleMessages = messages.filter(m => m.role !== 'user' || m.content !== 'שלום! סיימתי את כל שאלוני האבחון. אשמח לשמוע את הניתוח שלך ולבנות תכנית פעולה.');

  return (
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="w-full max-w-3xl flex flex-col gap-5 sm:gap-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <img src={owlLogo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full ring-2 ring-secondary/20 shadow-[var(--shadow-elevated)]" />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground tracking-wide">Sage Career Advisor</h2>
          <p className="text-muted-foreground text-sm tracking-wide">
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                מנתח ומייצר תובנות...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-secondary/60 rounded-full" />
                מוכן לייעוץ
              </span>
            )}
          </p>
        </div>

        {/* Profile Summary Card — collapsible after first response */}
        {visibleMessages.length <= 1 ? (
          <div className="bg-card rounded-3xl border border-border/60 p-5 sm:p-8 shadow-[var(--shadow-card)]" dir="rtl">
            <h3 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-3 tracking-wide">
              <span className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-sm text-secondary">✦</span>
              סיכום הפרופיל האישי שלך
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">◆ חוזקות מובילות</p>
                {topVIA.map(t => (
                  <p key={t.category} className="text-muted-foreground pr-2">• {t.category} – {viaCategoryDescriptions[t.category] || ''}</p>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">◆ עוגני קריירה</p>
                {topSchein.map(t => (
                  <p key={t.category} className="text-muted-foreground pr-2">• {t.category} – {scheinCategoryDescriptions[t.category] || ''}</p>
                ))}
              </div>
              {topHolland.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">◆ נטיות הולנד</p>
                  {topHolland.map(([c]) => (
                    <p key={c} className="text-muted-foreground pr-2">• {c} – {hollandCategoryDescriptions[c] || ''}</p>
                  ))}
                </div>
              )}
              {winnerSkills.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">◆ כישורים מובילים</p>
                  {winnerSkills.slice(0, 4).map((s, i) => (
                    <p key={i} className="text-muted-foreground pr-2">• {s}</p>
                  ))}
                </div>
              )}
            </div>
            {recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-semibold text-foreground mb-2">✦ הצעות עיסוק מהדו״ח</p>
                {recommendations.map((rec, i) => (
                  <p key={i} className="text-muted-foreground text-sm pr-2">
                    {rec.icon} {rec.title} – {rec.reason}
                  </p>
                ))}
              </div>
            )}
            {preferencesData?.dream && (
              <div className="mt-3">
                <p className="text-secondary font-semibold text-sm">✦ חלום המגירה: {preferencesData.dream}</p>
              </div>
            )}
          </div>
        ) : (
          <details className="group" dir="rtl">
            <summary className="cursor-pointer flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <span className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-xs text-secondary">✦</span>
              <span>הצגת סיכום הפרופיל</span>
              <span className="text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-3 bg-card rounded-2xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-xs">◆ חוזקות</p>
                  {topVIA.map(t => <p key={t.category} className="text-muted-foreground text-xs pr-2">• {t.category}</p>)}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-xs">◆ עוגנים</p>
                  {topSchein.map(t => <p key={t.category} className="text-muted-foreground text-xs pr-2">• {t.category}</p>)}
                </div>
              </div>
            </div>
          </details>
        )}

        {/* Conversation Thread */}
        <div className="space-y-6" dir="rtl">
          {visibleMessages.map((msg, i) => {
            // Find the original index in full messages array for search results mapping
            const originalIdx = messages.indexOf(msg);
            return (
            <div
              key={i}
              className={`flex gap-3 items-start transition-all duration-700 ${
                i === visibleMessages.length - 1 ? 'opacity-100' : 'opacity-100'
              }`}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              {msg.role === 'assistant' ? (
                <>
                  {/* Sagi avatar */}
                  <div className="flex-shrink-0 pt-1">
                    <img
                      src={owlLogo}
                      alt="סגי"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-1 ring-secondary/20 shadow-sm"
                    />
                  </div>
                  {/* Sagi message bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold font-display text-foreground tracking-wide">סגי</span>
                      <span className="text-[10px] text-muted-foreground/60">יועץ קריירה</span>
                    </div>
                    <div className="bg-card rounded-2xl rounded-tr-md border border-border/60 p-4 sm:p-6 shadow-[var(--shadow-card)]">
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:text-secondary [&_h1]:font-display [&_h1]:text-lg [&_h2]:text-secondary [&_h2]:font-display [&_h2]:text-base [&_h3]:text-secondary [&_h3]:font-display [&_h3]:text-sm [&_strong]:text-secondary [&_li]:mb-1.5 [&_ul]:mr-4 [&_ol]:mr-4 text-foreground leading-relaxed text-sm">
                        <ReactMarkdown>{cleanOpportunityTags(cleanSearchTags(msg.content))}</ReactMarkdown>
                      </div>
                    </div>
                    {/* Search results inline after assistant message */}
                    {searchResultsByMessage[originalIdx] && (
                      <SearchResultsCards
                        results={searchResultsByMessage[originalIdx]}
                        isSearching={false}
                        query=""
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* User avatar */}
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display font-bold text-sm">
                        {username ? username.charAt(0) : '👤'}
                      </span>
                    </div>
                  </div>
                  {/* User message bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{username || 'אני'}</span>
                    </div>
                    <div className="bg-primary/5 rounded-2xl rounded-tr-md border border-primary/10 px-4 py-3 sm:px-5 sm:py-4">
                      <p className="text-foreground text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            );
          })}

          {/* Live search indicator */}
          {searchState.isSearching && (
            <SearchResultsCards
              results={[]}
              isSearching={true}
              query={searchState.query}
            />
          )}

          {/* Streaming indicator inline */}
          {isStreaming && visibleMessages[visibleMessages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 pt-1">
                <img src={owlLogo} alt="סגי" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-1 ring-secondary/20 shadow-sm animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold font-display text-foreground tracking-wide">סגי</span>
                </div>
                <div className="bg-card rounded-2xl rounded-tr-md border border-border/60 px-4 py-3 sm:px-6 sm:py-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-muted-foreground text-xs mr-2">מנסח תשובה...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Roadmap detected → finish */}
        {roadmapDetected && !isStreaming && (
          <div className="bg-card rounded-3xl border border-secondary/20 p-6 sm:p-10 shadow-[var(--shadow-elevated)] text-center space-y-5">
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

        {/* Journey Action Cards */}
        {!roadmapDetected && !isStreaming && messages.length >= 2 && (
          <div dir="rtl" className="flex flex-wrap gap-2 justify-center">
            {journeyActions.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.msg)}
                className="inline-flex items-center gap-1.5 bg-card hover:bg-muted/50 border border-border/60 hover:border-secondary/30 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-secondary transition-all duration-200"
              >
                <span className="text-sm">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat input — unified for all states */}
        {!isStreaming && messages.length >= 2 && (
          <div dir="rtl" className="bg-card rounded-2xl border border-border/60 p-3 shadow-[var(--shadow-card)]">
            <div className="flex gap-2 items-end">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-display font-bold text-xs">
                    {username ? username.charAt(0) : '👤'}
                  </span>
                </div>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={roadmapDetected ? 'יש עוד שאלות? המשיכו לשוחח...' : 'כתבו שאלה חופשית ליועץ...'}
                className="resize-none min-h-[40px] max-h-[100px] bg-transparent border-0 focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground/50"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-30"
              >
                <span className="text-base">←</span>
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default SageAdvisor;
