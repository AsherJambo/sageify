import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/owl-logo.png';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OwlChatProps {
  profileSummary: string;
  username: string;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onRoadmapDetected?: (roadmapContent: string) => void;
  autoStart?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mxyyirizhnwkmvcbnypn.supabase.co';
const CHAT_URL = `${SUPABASE_URL}/functions/v1/owl-chat`;

const ROADMAP_MARKER = 'Your Sage Action Roadmap';

const OwlChat = ({ profileSummary, username, initialMessages, onMessagesChange, onRoadmapDetected, autoStart = false }: OwlChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      onMessagesChange?.(messages);
    }
  }, [messages]);

  // Check for roadmap in messages
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistant?.content.includes(ROADMAP_MARKER)) {
      onRoadmapDetected?.(lastAssistant.content);
    }
  }, [messages, onRoadmapDetected]);

  const streamChat = async (allMessages: ChatMessage[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eXlpcml6aG53a212Y2JueXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjI4MjUsImV4cCI6MjA4NzY5ODgyNX0.pEstDk6163sy5MC2JuhcvW7A1a8KCEjrkw5ZJ1-40TQ'}`,
      },
      body: JSON.stringify({ messages: allMessages, profileSummary, username }),
    });

    if (!resp.ok || !resp.body) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'שגיאה בחיבור ליועץ AI');
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
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
              }
              return [...prev, { role: 'assistant', content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  // Auto-start conversation
  useEffect(() => {
    if (autoStart && !hasAutoStarted && messages.length === 0) {
      setHasAutoStarted(true);
      const initiate = async () => {
        setIsLoading(true);
        try {
          const initialMsg: ChatMessage = { role: 'user', content: `שלום! סיימתי את כל השאלונים ואני מוכן לשמוע את הניתוח שלך ולבנות תכנית עבודה.` };
          setMessages([initialMsg]);
          await streamChat([initialMsg]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      // Small delay for visual effect
      setTimeout(initiate, 1500);
    }
  }, [autoStart, hasAutoStarted]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasRoadmap = messages.some(m => m.role === 'assistant' && m.content.includes(ROADMAP_MARKER));

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Advisor header */}
      <div className="bg-gradient-to-l from-accent/20 via-accent/10 to-transparent rounded-t-2xl px-6 py-4 flex items-center gap-4 border border-accent/30 border-b-0">
        <div className="relative">
          <img src={owlLogo} alt="" className="w-14 h-14 rounded-full ring-2 ring-accent/50 shadow-lg" />
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full border-2 border-background" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">🦉 Sage Advisor</h3>
          <p className="text-sm text-muted-foreground">ייעוץ קריירה אסטרטגי מותאם אישית</p>
        </div>
        {hasRoadmap && (
          <span className="text-xs bg-accent/15 text-accent px-3 py-1 rounded-full font-medium">
            ✓ Roadmap מוכן
          </span>
        )}
      </div>

      {/* Chat area */}
      <div className="bg-gradient-to-b from-card to-background border-x border-accent/30 overflow-hidden">
        <div className="h-[450px] overflow-y-auto px-5 py-4 space-y-5" dir="rtl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <img src={owlLogo} alt="" className="w-16 h-16 animate-float" />
              <p className="text-muted-foreground">ה-Sage Advisor מנתח את התשובות שלך...</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.role === 'assistant' && (
                <img src={owlLogo} alt="" className="w-9 h-9 rounded-full flex-shrink-0 mt-1 ring-1 ring-accent/30" />
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md shadow-primary/20'
                    : 'bg-card text-foreground rounded-bl-md border border-accent/20 shadow-accent/10'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h2]:text-accent [&_h2]:text-lg [&_h2]:mt-4 [&_h2]:mb-2 [&_strong]:text-foreground [&_li]:text-foreground [&_hr]:border-accent/30">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-primary">
                  {username?.[0] || '👤'}
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <img src={owlLogo} alt="" className="w-9 h-9 rounded-full flex-shrink-0 mt-1 ring-1 ring-accent/30" />
              <div className="bg-card rounded-2xl rounded-bl-md px-5 py-3.5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">🦉 הינשוף מנתח</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border border-accent/30 border-t-0 rounded-b-2xl bg-card/80 backdrop-blur-sm p-3 flex gap-2" dir="rtl">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasRoadmap ? 'רוצה לשאול עוד משהו?' : 'כתבו תשובה ליועץ...'}
          className="resize-none min-h-[44px] max-h-[120px] border-accent/20 focus:border-accent/50 bg-background"
          rows={1}
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="px-5 self-end bg-accent text-accent-foreground hover:bg-accent/90"
        >
          שלח
        </Button>
      </div>
    </div>
  );
};

export default OwlChat;
