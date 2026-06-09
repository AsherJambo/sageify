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
import { silentSaveInsights } from '@/lib/insightsSaver';
import type { ThinkingResult } from '@/data/thinkingQuestions';

interface SageAdvisorProps {
  username?: string;
  tokenId?: string;
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  thinkingResult?: ThinkingResult;
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
  considerationsData, skillsAssignments, preferencesData, thinkingResult,
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
    if (thinkingResult) {
      parts.push(`\nהערכת חשיבה וגמישות קוגניטיבית: ${thinkingResult.totalCorrect}/${thinkingResult.totalQuestions} תשובות נכונות (רמה: ${thinkingResult.levelLabel}, אחוזון: ${thinkingResult.percentile})`);
      if (thinkingResult.level === 'high' || thinkingResult.level === 'above-average') {
        parts.push(`→ חשיבה אנליטית חזקה – מתאים לתפקידים הדורשים פתרון בעיות מורכבות, ייעוץ אסטרטגי, ניתוח נתונים`);
      } else if (thinkingResult.level === 'average') {
        parts.push(`→ יכולת חשיבה ממוצעת – מתאים למגוון רחב של פעילויות`);
      } else {
        parts.push(`→ מומלץ להתמקד בפעילויות המבוססות על ניסיון וידע מעשי יותר מאשר חשיבה מופשטת`);
      }
    }
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

  // Auto-extract and save activity choices from AI responses
  const savedActivityNames = useRef<Set<string>>(new Set());
  const rawAssistantContent = useRef<string>(''); // Store raw content for data extraction

  const extractAndSaveActivityChoices = useCallback(async (text: string) => {
    const regex = /\[ACTIVITY_CHOICE:\s*(\{[\s\S]*?\})\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.activity && !savedActivityNames.current.has(parsed.activity)) {
          // Build psychological drivers from current scores
          const topVIA = Object.entries(viaScores).sort(([,a],[,b]) => b - a)[0]?.[0] || '';
          const topSchein = Object.entries(scheinScores).sort(([,a],[,b]) => b - a)[0]?.[0] || '';
          const topHolland = hollandScores ? Object.entries(hollandScores).sort(([,a],[,b]) => b - a)[0]?.[0] || '' : '';

          await supabase.from('activity_choices').insert([{
            token_id: tokenId,
            activity_type: parsed.type || 'other',
            activity_name: parsed.activity,
            organization: parsed.organization || null,
            category: parsed.type || 'other',
            reasons: parsed.reasons || [],
            psychological_drivers: { via_top: topVIA, schein_top: topSchein, holland_top: topHolland },
            source: 'ai-advisor',
          }]);
          savedActivityNames.current.add(parsed.activity);
          console.log('Auto-saved activity choice:', parsed.activity);
        }
      } catch { /* skip malformed */ }
    }
  }, [tokenId, viaScores, scheinScores, hollandScores]);

  const cleanActivityChoiceTags = useCallback((text: string): string => {
    return text.replace(/\[ACTIVITY_CHOICE:\s*\{[\s\S]*?\}\]/g, '').trim();
  }, []);

  // Combined cleaning function for all structured tags
  const cleanAllStructuredTags = useCallback((text: string): string => {
    let cleaned = cleanSearchTags(text);
    cleaned = cleanOpportunityTags(cleaned);
    cleaned = cleanActivityChoiceTags(cleaned);
    return cleaned;
  }, [cleanSearchTags, cleanOpportunityTags, cleanActivityChoiceTags]);

  const streamChat = async (allMessages: ChatMessage[]) => {
    console.group('%c🦉 Advisor Chat Request', 'color: #d4a017; font-weight: bold');
    console.log('%c💬 Messages count:', 'color: #2196F3', allMessages.length);
    console.log('%c📤 Payload:', 'color: #4CAF50', { messagesCount: allMessages.length, hasProfileSummary: !!profileSummary, profileSummaryLength: profileSummary.length, tokenId: tokenId || 'anonymous' });
    console.groupEnd();

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
      console.error('%c❌ Advisor Response Error:', 'color: #f44336; font-weight: bold', resp.status, errData);
      throw new Error(errData.error || 'שגיאה בחיבור ליועץ');
    }
    console.log('%c✅ Advisor Stream Started:', 'color: #4CAF50; font-weight: bold', `Status ${resp.status}`);

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
            rawAssistantContent.current = assistantSoFar; // Store raw content for data extraction
            const cleanedContent = cleanAllStructuredTags(assistantSoFar);
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: cleanedContent } : m));
              }
              return [...prev, { role: 'assistant', content: cleanedContent }];
            });
            if (cleanedContent.includes('Sage Action Roadmap') && !roadmapDetected) {
              setRoadmapDetected(true);
              onRoadmapReady?.();
              // Silent background save of retiree insights
              if (tokenId) {
                silentSaveInsights({
                  tokenId,
                  viaScores, scheinScores, hollandScores,
                  considerationsData, skillsAssignments, preferencesData,
                  chatMessages: messages,
                });
              }
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
      rawAssistantContent.current = ''; // Clear raw content for new conversation
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
            // Use the raw content (with technical tags) for data extraction
            const rawContent = rawAssistantContent.current;
            processSearchQueries(rawContent, lastAssistant);
            extractAndSaveOpportunities(rawContent);
            extractAndSaveActivityChoices(rawContent);
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
    rawAssistantContent.current = ''; // Clear raw content for new response
    setIsStreaming(true);
    try {
      await streamChat(newMessages);
      // Check for search queries and auto-save opportunities after streaming
      setMessages(prev => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'assistant') {
          // Use the raw content for data extraction
          const rawContent = rawAssistantContent.current;
          processSearchQueries(rawContent, lastIdx);
          extractAndSaveOpportunities(rawContent);
          extractAndSaveActivityChoices(rawContent);
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="max-w-md text-center space-y-8">
          <div
            className="w-32 h-32 mx-auto rounded-full bg-card border-2 border-foreground flex items-center justify-center animate-float"
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
          >
            <img src={owlLogo} alt="Sagi" className="w-24 h-24 rounded-full" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground tracking-wide">
            סגי מנתח את הסיפור שלך… 🦉
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed">
            מכין תובנות אישיות וחם מהתנור עבורך
          </p>
          <div className="w-full h-5 bg-sand-warm rounded-full overflow-hidden border-2 border-foreground">
            <div
              className="h-full bg-accent animate-pulse"
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
    <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
      <div className="w-full max-w-3xl flex flex-col gap-5 sm:gap-8">

        {/* Header — owl badge + status chip */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-card border-2 border-foreground flex items-center justify-center"
              style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
            >
              <img src={owlLogo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-sage rounded-full border-2 border-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground tracking-wide">
            סגי — היועץ שלך 🦉
          </h2>
          <div className="flex justify-center">
            {isStreaming ? (
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground border-2 border-foreground text-sm font-bold"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
              >
                <span className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                סגי חושב…
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-light text-foreground border-2 border-foreground text-sm font-bold"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
              >
                <span className="w-2 h-2 bg-sage rounded-full" />
                מוכן לשיחה
              </span>
            )}
          </div>
        </div>

        {/* Profile Summary Card — collapsible after first response */}
        {visibleMessages.length <= 1 ? (
          <div
            className="bg-card rounded-3xl border-2 border-foreground p-5 sm:p-8"
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
            dir="rtl"
          >
            <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-5 flex items-center gap-3 tracking-wide">
              <span
                className="w-10 h-10 rounded-xl bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                aria-hidden="true"
              >🪙</span>
              סיכום הפרופיל שלך
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div className="bg-sage-light border-2 border-foreground/25 rounded-2xl p-4 space-y-2">
                <p className="font-serif font-bold text-foreground flex items-center gap-2">🌿 חוזקות מובילות</p>
                {topVIA.map(t => (
                  <p key={t.category} className="text-foreground/80 leading-relaxed">• {t.category} – {viaCategoryDescriptions[t.category] || ''}</p>
                ))}
              </div>
              <div className="bg-gold-light border-2 border-foreground/25 rounded-2xl p-4 space-y-2">
                <p className="font-serif font-bold text-foreground flex items-center gap-2">⚓ עוגני קריירה</p>
                {topSchein.map(t => (
                  <p key={t.category} className="text-foreground/80 leading-relaxed">• {t.category} – {scheinCategoryDescriptions[t.category] || ''}</p>
                ))}
              </div>
              {topHolland.length > 0 && (
                <div className="bg-sky-soft border-2 border-foreground/25 rounded-2xl p-4 space-y-2">
                  <p className="font-serif font-bold text-foreground flex items-center gap-2">🧭 נטיות הולנד</p>
                  {topHolland.map(([c]) => (
                    <p key={c} className="text-foreground/80 leading-relaxed">• {c} – {hollandCategoryDescriptions[c] || ''}</p>
                  ))}
                </div>
              )}
              {winnerSkills.length > 0 && (
                <div className="bg-coral-soft border-2 border-foreground/25 rounded-2xl p-4 space-y-2">
                  <p className="font-serif font-bold text-foreground flex items-center gap-2">🏆 כישורים מובילים</p>
                  {winnerSkills.slice(0, 4).map((s, i) => (
                    <p key={i} className="text-foreground/80 leading-relaxed">• {s}</p>
                  ))}
                </div>
              )}
            </div>
            {recommendations.length > 0 && (
              <div className="mt-5 pt-5 border-t-2 border-dashed border-foreground/25">
                <p className="font-serif font-bold text-foreground mb-3 flex items-center gap-2">✨ הצעות עיסוק מהדו״ח</p>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <p key={i} className="text-foreground/80 leading-relaxed">
                      <span aria-hidden="true">{rec.icon}</span> <span className="font-bold text-foreground">{rec.title}</span> – {rec.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {preferencesData?.dream && (
              <div className="mt-4">
                <span
                  className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground border-2 border-foreground font-bold text-base"
                  style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                >
                  💭 חלום המגירה: {preferencesData.dream}
                </span>
              </div>
            )}
          </div>
        ) : (
          <details className="group" dir="rtl">
            <summary className="cursor-pointer flex items-center justify-center gap-2 text-base font-bold text-foreground/75 hover:text-foreground transition-colors py-2 list-none">
              <span
                className="w-7 h-7 rounded-full bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center text-sm"
                aria-hidden="true"
              >🪙</span>
              <span>הצגת סיכום הפרופיל</span>
              <span className="text-sm transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div
              className="mt-3 bg-card rounded-2xl border-2 border-foreground p-5"
              style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.85)' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-foreground">🌿 חוזקות</p>
                  {topVIA.map(t => <p key={t.category} className="text-foreground/80">• {t.category}</p>)}
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-foreground">⚓ עוגנים</p>
                  {topSchein.map(t => <p key={t.category} className="text-foreground/80">• {t.category}</p>)}
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
                  {/* Sagi avatar — owl badge */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-foreground flex items-center justify-center"
                      style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                    >
                      <img src={owlLogo} alt="סגי" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
                    </div>
                  </div>
                  {/* Sagi message — no bubble; clean reading surface */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-serif font-bold text-foreground tracking-wide">סגי</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full bg-sage-light text-foreground border border-foreground/30 font-bold"
                      >
                        🦉 יועץ קריירה
                      </span>
                    </div>
                    <div className="text-foreground leading-relaxed text-base sm:text-lg prose prose-base max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:font-serif [&_h1]:text-foreground [&_h1]:text-2xl [&_h2]:font-serif [&_h2]:text-foreground [&_h2]:text-xl [&_h3]:font-serif [&_h3]:text-foreground [&_h3]:text-lg [&_strong]:text-foreground [&_strong]:font-bold [&_a]:text-destructive [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2 [&_code]:bg-sand-warm [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-foreground [&_li]:mb-1.5 [&_ul]:mr-5 [&_ol]:mr-5 [&_blockquote]:border-r-4 [&_blockquote]:border-accent [&_blockquote]:pr-4 [&_blockquote]:bg-gold-light [&_blockquote]:py-2 [&_blockquote]:rounded-lg">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center"
                      style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                    >
                      <span className="font-serif font-bold text-lg">
                        {username ? username.charAt(0) : '👤'}
                      </span>
                    </div>
                  </div>
                  {/* User message bubble — coral high-contrast */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-serif font-bold text-foreground">{username || 'אני'}</span>
                    </div>
                    <div
                      className="bg-destructive text-destructive-foreground rounded-2xl rounded-tr-md border-2 border-foreground px-5 py-4"
                      style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.85)' }}
                    >
                      <p className="text-base sm:text-lg leading-relaxed">{msg.content}</p>
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
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-foreground flex items-center justify-center animate-pulse"
                  style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                >
                  <img src={owlLogo} alt="סגי" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-serif font-bold text-foreground tracking-wide">סגי</span>
                </div>
                <div
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gold-light border-2 border-foreground"
                  style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                >
                  <span className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-foreground text-sm font-bold mr-1">סגי חושב… 🦉</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Roadmap detected → finish */}
        {roadmapDetected && !isStreaming && (
          <div
            className="bg-card rounded-3xl border-2 border-foreground p-6 sm:p-10 text-center space-y-5"
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
          >
            <div
              className="w-20 h-20 mx-auto rounded-full bg-sage border-2 border-foreground flex items-center justify-center text-4xl"
              style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.85)' }}
              aria-hidden="true"
            >🦉</div>
            <h3 className="text-2xl font-serif font-bold text-foreground tracking-wide">
              מפת הדרכים שלך מוכנה!
            </h3>
            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
              כל התובנות וההמלצות מחכות לך בסיכום
            </p>
            <Button
              onClick={() => {
                setPhase('done');
                onFinish?.();
              }}
              className="w-full max-w-sm mx-auto py-7 text-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl border-2 border-foreground font-serif font-bold tracking-wide active:translate-y-[2px] transition-transform"
              style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
            >
              ← סיום והמשך לסיכום
            </Button>
          </div>
        )}

        {/* Journey Action Chips — amber XP chips */}
        {!roadmapDetected && !isStreaming && messages.length >= 2 && (
          <div dir="rtl" className="flex flex-wrap gap-2.5 justify-center">
            {journeyActions.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.msg)}
                className="inline-flex items-center gap-2 bg-card hover:bg-gold-light border-2 border-foreground rounded-full px-4 py-2.5 text-sm sm:text-base font-bold text-foreground transition-transform active:translate-y-[2px] min-h-[48px]"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
              >
                <span className="text-base" aria-hidden="true">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat composer — chunky owl prompt */}
        {!isStreaming && messages.length >= 2 && (
          <div
            dir="rtl"
            className="bg-card rounded-3xl border-2 border-foreground p-3 sm:p-4"
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
          >
            <div className="flex gap-3 items-end">
              <div className="flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-full bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center"
                  style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                >
                  <span className="font-serif font-bold text-base">
                    {username ? username.charAt(0) : '👤'}
                  </span>
                </div>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={roadmapDetected ? 'יש עוד שאלות? המשיכו לשוחח עם סגי…' : 'כתבו שאלה חופשית לסגי…'}
                className="resize-none min-h-[48px] max-h-[120px] bg-transparent border-0 focus-visible:ring-0 shadow-none text-base sm:text-lg placeholder:text-foreground/40 text-foreground"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-foreground disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[2px] transition-transform"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                aria-label="שלח"
              >
                <span className="text-xl font-bold">←</span>
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
