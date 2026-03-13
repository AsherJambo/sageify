import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import QuestionnaireNav from './QuestionnaireNav';

interface PersonalitySlidersProps {
  onComplete: (sliders: Record<string, number | string>) => void;
}

const TRAIT_PAIRS = [
  { id: 'routine_innovation', left: 'שגרה ויציבות', right: 'חדשנות וגמישות', icon: '🔄' },
  { id: 'solo_team', left: 'עבודה עצמאית', right: 'עבודה בצוות', icon: '👥' },
  { id: 'depth_breadth', left: 'התמחות עמוקה', right: 'מגוון רחב', icon: '🔬' },
  { id: 'practical_theoretical', left: 'מעשי ויישומי', right: 'תיאורטי ומחקרי', icon: '⚙️' },
  { id: 'leading_supporting', left: 'הובלה וניהול', right: 'תמיכה וליווי', icon: '🎯' },
  { id: 'structured_flexible', left: 'מסגרת קבועה', right: 'חופש מוחלט', icon: '📐' },
];

const VALUE_CARDS = [
  { id: 'social_impact', label: 'השפעה חברתית', emoji: '🌍', desc: 'לתרום לשינוי חברתי משמעותי' },
  { id: 'personal_growth', label: 'צמיחה אישית', emoji: '🌱', desc: 'ללמוד ולהתפתח כל הזמן' },
  { id: 'financial_security', label: 'ביטחון כלכלי', emoji: '💰', desc: 'להבטיח הכנסה ויציבות' },
  { id: 'legacy', label: 'מורשת', emoji: '🏛️', desc: 'להשאיר חותם לדורות הבאים' },
  { id: 'community', label: 'קהילה', emoji: '🤝', desc: 'לבנות קשרים ולהיות חלק ממשהו גדול' },
  { id: 'creativity', label: 'יצירתיות', emoji: '🎨', desc: 'לבטא את עצמי בדרכים חדשות' },
  { id: 'health', label: 'בריאות ואיכות חיים', emoji: '❤️', desc: 'לשמור על גוף ונפש' },
  { id: 'knowledge', label: 'ידע ומומחיות', emoji: '📚', desc: 'להעמיק ולהפוך למומחה' },
];

const PersonalitySliders = ({ onComplete }: PersonalitySlidersProps) => {
  const [sliders, setSliders] = useState<Record<string, number>>(
    Object.fromEntries(TRAIT_PAIRS.map(t => [t.id, 50]))
  );
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (id: string, value: number[]) => {
    setSliders(prev => ({ ...prev, [id]: value[0] }));
  };

  const toggleValue = (id: string) => {
    setSelectedValues(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) return prev; // max 3
        next.add(id);
      }
      return next;
    });
  };

  const handleComplete = () => {
    if (selectedValues.size < 2) {
      setError('יש לבחור לפחות 2 ערכים');
      return;
    }
    setError(null);
    const result = {
      ...sliders,
      values: Array.from(selectedValues).join(','),
    };
    onComplete(result);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ פרופיל אישיות
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            מפת הנטיות שלך
          </h2>
          <p className="text-muted-foreground text-lg">הזיזו את הסליידר למקום שהכי מדויק עבורכם</p>
        </div>

        {/* Personality Sliders */}
        <div className="space-y-6">
          {TRAIT_PAIRS.map((trait, idx) => (
            <motion.div
              key={trait.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="bg-card rounded-3xl p-6 border border-border/60 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{trait.icon}</span>
                <div className="flex-1 flex justify-between text-sm font-medium">
                  <span className="text-foreground">{trait.right}</span>
                  <span className="text-foreground">{trait.left}</span>
                </div>
              </div>
              <Slider
                value={[sliders[trait.id]]}
                onValueChange={(v) => handleSliderChange(trait.id, v)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">100</span>
                <span className="text-xs text-secondary font-bold">{sliders[trait.id]}</span>
                <span className="text-xs text-muted-foreground">0</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Alignment Cards */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold font-display text-foreground tracking-wide">
              ✦ בחירת ערכים
            </h3>
            <p className="text-muted-foreground text-sm">
              בחרו 2-3 ערכים שהכי חשובים לכם בשלב הזה של החיים
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {VALUE_CARDS.map((card, idx) => {
              const isSelected = selectedValues.has(card.id);
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  onClick={() => toggleValue(card.id)}
                  className={`relative text-right p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-secondary/8 border-secondary/40 shadow-[var(--shadow-card)]'
                      : 'bg-card border-border/60 hover:border-secondary/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{card.emoji}</div>
                  <h4 className="font-bold font-display text-sm text-foreground">{card.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-3 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={handleComplete}
          completeDisabled={false}
          completeLabel="המשך"
        />
      </div>
    </div>
  );
};

export default PersonalitySliders;
