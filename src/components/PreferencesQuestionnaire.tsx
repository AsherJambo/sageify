import { useState } from 'react';
import { preferenceQuestions, dreamOptions } from '@/data/preferencesData';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';

interface PreferencesQuestionnaireProps {
  onComplete: (preferences: Record<string, string[]>, dream: string) => void;
}

const PreferencesQuestionnaire = ({ onComplete }: PreferencesQuestionnaireProps) => {
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [dream, setDream] = useState<string>('');

  const handleSelect = (questionId: string, option: string, multiSelect: boolean) => {
    setPreferences(prev => {
      if (multiSelect) {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(option)
            ? current.filter(o => o !== option)
            : [...current, option],
        };
      }
      return { ...prev, [questionId]: [option] };
    });
  };

  const allPrefsAnswered = preferenceQuestions.every(q => (preferences[q.id] || []).length > 0);
  const canComplete = allPrefsAnswered && dream !== '';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ חלק ו׳
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">העדפות וחלום המגירה</h2>
          <p className="text-muted-foreground text-lg">ענו על שאלות ההעדפה ובחרו את חלום המגירה שלכם</p>
        </div>

        {/* Preference Questions */}
        {preferenceQuestions.map((q) => (
          <div key={q.id} className="bg-card rounded-3xl p-6 md:p-8 border border-border/60 shadow-[var(--shadow-card)] slide-up">
            <h3 className="font-bold font-display text-foreground text-lg mb-1 tracking-wide">{q.title}</h3>
            {q.multiSelect && <p className="text-sm text-muted-foreground mb-4">ניתן לסמן מספר אפשרויות</p>}
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = (preferences[q.id] || []).includes(opt);
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(q.id, opt, q.multiSelect)}
                    className={`w-full text-right px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 text-base ${
                      isSelected
                        ? 'bg-primary/5 text-foreground border-primary/40 shadow-[var(--shadow-card)]'
                        : 'bg-card text-foreground border-border/60 hover:border-secondary/30'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Dream drawer */}
        <div className="bg-card rounded-3xl p-6 md:p-8 border-2 border-secondary/20 shadow-[var(--shadow-card)] slide-up">
          <h3 className="font-bold font-display text-foreground text-lg mb-1 tracking-wide">✦ חלום המגירה</h3>
          <p className="text-sm text-muted-foreground mb-4">
            אם תבחר/י תחום אחד שתמיד רצית ללמוד או לעשות – מה יהיה?
          </p>
          <div className="space-y-2">
            {dreamOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setDream(opt)}
                className={`w-full text-right px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 text-base ${
                  dream === opt
                    ? 'bg-secondary/8 text-foreground border-secondary/40 shadow-[var(--shadow-card)]'
                    : 'bg-card text-foreground border-border/60 hover:border-secondary/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={() => onComplete(preferences, dream)}
          completeDisabled={!canComplete}
          completeLabel="סיום וצפייה בתוצאות"
        />
      </div>
    </div>
  );
};

export default PreferencesQuestionnaire;
