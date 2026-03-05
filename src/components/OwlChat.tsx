import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import owlLogo from '@/assets/sageify-owl-icon.jpeg';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OwlChatProps {
  profileSummary: string;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mxyyirizhnwkmvcbnypn.supabase.co';
const CHAT_URL = `${SUPABASE_URL}/functions/v1/owl-chat`;

const OwlChat = ({ profileSummary, initialMessages, onMessagesChange }: OwlChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState((initialMessages?.length || 0) > 0);
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

  const startChat = async () => {
    setIsOpen(true);
    setHasStarted(true);
    if (messages.length > 0) return;

    setIsLoading(true);
    try {
      const initialMsg: ChatMessage = { role: 'user', content: 'שלום! סיימתי את האבחון ואשמח לשמוע את דעתך על התוצאות.' };
      setMessages([initialMsg]);
      await streamChat([initialMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isOpen) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-secondary/15 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <img src={owlLogo} alt="" className="w-16 h-16 rounded-full animate-float" />
          <div className="flex-1">
            <h3 className="text-xl font-bold font-display text-foreground mb-1 tracking-wide">שיחה עם סגי – יועץ Sageify</h3>
            <p className="text-muted-foreground">
              רוצים להפוך את התוצאות לתכנית עבודה? סגי כאן כדי לעזור לכם לבנות את הצעד הבא.
            </p>
          </div>
        </div>
        <Button
          onClick={startChat}
          className="w-full mt-5 text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/85 rounded-2xl font-display tracking-wide shadow-[var(--shadow-elevated)]"
        >
          {hasStarted ? 'חזרה לשיחה' : 'בואו נדבר'}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-secondary/15 shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="bg-primary/3 px-6 py-4 flex items-center gap-4 border-b border-border/60">
        <img src={owlLogo} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <h3 className="font-bold font-display text-foreground tracking-wide">סגי – יועץ Sageify</h3>
          <p className="text-xs text-muted-foreground">יועץ קריירה AI אישי</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-muted-foreground">
          ▾ מזער
        </Button>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4" dir="rtl">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <img src={owlLogo} alt="" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <img src={owlLogo} alt="" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <span className="text-muted-foreground text-sm animate-pulse">🌿 סגי חושב...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2" dir="rtl">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="כתבו הודעה לסגי..."
          className="resize-none min-h-[44px] max-h-[120px] rounded-xl"
          rows={1}
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="px-4 self-end bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl"
        >
          שלח
        </Button>
      </div>
    </div>
  );
};

export default OwlChat;
