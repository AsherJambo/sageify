import { useState } from 'react';
import { preferenceQuestions, dreamOptions } from '@/data/preferencesData';
import OwlMessage from './OwlMessage';

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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
            ⚙️ חלק ו׳
          </div>
          <h2 className="text-2xl font-bold text-foreground">העדפות וחלום המגירה</h2>
          <p className="text-muted-foreground">ענו על שאלות ההעדפה ובחרו את חלום המגירה שלכם</p>
        </div>

        {/* Preference Questions */}
        {preferenceQuestions.map((q) => (
          <div key={q.id} className="bg-card rounded-xl p-5 border border-border slide-up">
            <h3 className="font-bold text-foreground text-lg mb-1">{q.title}</h3>
            {q.multiSelect && <p className="text-sm text-muted-foreground mb-3">ניתן לסמן מספר אפשרויות</p>}
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = (preferences[q.id] || []).includes(opt);
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(q.id, opt, q.multiSelect)}
                    className={`w-full text-right px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/50'
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
        <div className="bg-card rounded-xl p-5 border border-accent/30 shadow-md slide-up">
          <h3 className="font-bold text-foreground text-lg mb-1">🌟 חלום המגירה</h3>
          <p className="text-sm text-muted-foreground mb-3">
            אם תבחר/י תחום אחד שתמיד רצית ללמוד או לעשות – מה יהיה?
          </p>
          <div className="space-y-2">
            {dreamOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setDream(opt)}
                className={`w-full text-right px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  dream === opt
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-background text-foreground border-border hover:border-accent/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => onComplete(preferences, dream)}
            disabled={!canComplete}
            className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
          >
            🦉 סיום חלק ו׳ וצפייה בתוצאות ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesQuestionnaire;
