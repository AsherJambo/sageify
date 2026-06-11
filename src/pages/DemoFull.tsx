import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import QuestionnaireByToken from './QuestionnaireByToken';
import owlLogo from '@/assets/owl-logo.png';

const DEMO_PASSWORD = 'sageify';
const AUTH_KEY = 'sageify-demo-full-auth';

const DemoFull = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [reset, setReset] = useState(false);

  useEffect(() => {
    // Always reset demo state on entry so each visit starts fresh
    try {
      localStorage.removeItem('sageify-state-demo-full');
      localStorage.removeItem('sageify-chat-demo-full');
    } catch { /* ignore */ }
    setReset(true);
    try {
      if (sessionStorage.getItem(AUTH_KEY) === '1') setAuthed(true);
    } catch { /* ignore */ }
  }, []);

  if (!authed) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/60 rounded-3xl p-8 shadow-[var(--shadow-elevated)]">
          <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto rounded-full" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground font-display">דמו פרימיום — חוויה מלאה</h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              גרסת דמו זהה לחוויה שמקבל הלקוח. הזינו סיסמה כדי להיכנס.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password.trim().toLowerCase() === DEMO_PASSWORD) {
                try { sessionStorage.setItem(AUTH_KEY, '1'); } catch { /* ignore */ }
                setAuthed(true);
              } else {
                toast.error('סיסמה שגויה');
              }
            }}
            className="space-y-3 text-right"
          >
            <label className="block text-sm font-semibold text-foreground">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הזינו סיסמה"
              autoFocus
              className="w-full text-center px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px]"
            />
            <button
              type="submit"
              className="w-full px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold font-display tracking-wide hover:bg-primary/85 transition-all shadow-[var(--shadow-elevated)] min-h-[52px]"
            >
              כניסה לדמו ←
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <QuestionnaireByToken demoMode />;
};

export default DemoFull;
