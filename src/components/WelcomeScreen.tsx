import { useState, useEffect } from 'react';
import owlLogo from '@/assets/owl-logo.png';
import { owlWelcome } from '@/lib/owlMessages';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowGreeting(true), 300);
    setTimeout(() => setShowIntro(true), 800);
    setTimeout(() => setShowDetails(true), 1400);
    setTimeout(() => setShowCTA(true), 2000);
  }, []);

  const journeySteps = [
    { icon: '🌟', title: 'חלק א׳: חוזקות VIA', desc: '48 שאלות – גלו את הכוחות הפנימיים שלכם' },
    { icon: '🧭', title: 'חלק ב׳: עוגנים תעסוקתיים', desc: '40 שאלות – מצאו מה באמת מניע אתכם' },
    { icon: '📋', title: 'חלק ג׳: שיקולים בבחירת עיסוק', desc: 'בחרו 6 שיקולים וחלקו ביניהם 100 נקודות' },
    { icon: '🔍', title: 'חלק ד׳: נטיות תעסוקתיות (הולנד)', desc: '66 שאלות – מצאו את הנטיות שלכם' },
    { icon: '🧰', title: 'חלק ה׳: כישורים ותנאי סף', desc: '20 כישורים – מיינו לארגז הכלים שלכם' },
    { icon: '⚙️', title: 'חלק ו׳: העדפות וחלום המגירה', desc: 'העדפות אישיות + תחום החלום שלכם' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center space-y-10">
        
        {/* Logo with premium presentation */}
        <div className="relative">
          <div className="w-40 h-40 mx-auto rounded-full bg-card shadow-xl border border-border flex items-center justify-center">
            <img
              src={owlLogo}
              alt="Sageify - ינשוף החוכמה"
              className="w-28 h-28 animate-float"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-foreground/5 rounded-full blur-md animate-shadow-pulse" />
        </div>

        {/* Greeting card */}
        <div
          className={`transition-all duration-700 ${
            showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border-t border-r border-border rotate-[-135deg] rounded-sm" />
            <h2 className="text-2xl font-bold font-serif text-foreground mb-3">
              {owlWelcome.greeting}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {owlWelcome.intro}
            </p>
          </div>
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-700 ${
            showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
            ברוכים הבאים ל-<span className="text-secondary">Sageify</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">הערכה מקצועית לגילוי חוזקות ומיפוי כיוונים תעסוקתיים</p>
        </div>

        {/* Journey steps */}
        <div
          className={`transition-all duration-700 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {journeySteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border shadow-sm text-right">
                <span className="text-2xl mt-0.5">{step.icon}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm font-serif">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-4">⏱️ זמן משוער: 40-50 דקות | ההתקדמות נשמרת אוטומטית</p>
        </div>

        {/* CTA */}
        <div
          className={`transition-all duration-700 ${
            showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <button
            onClick={onStart}
            className="mt-2 px-12 py-5 bg-secondary text-secondary-foreground rounded-xl text-xl font-semibold hover:bg-secondary/90 transition-all duration-300 hover:scale-105 shadow-lg group font-serif"
          >
            <span className="flex items-center gap-2 justify-center">
              {owlWelcome.cta}
              <span className="inline-block transition-transform group-hover:translate-x-[-4px]">🦉</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
