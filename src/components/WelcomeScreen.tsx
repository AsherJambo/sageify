import { useState, useEffect } from 'react';
import sageifyLogo from '@/assets/sageify-logo.jpeg';
import heroBanner from '@/assets/hero-banner.png';
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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[420px] md:h-[480px] overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,40%,16%)/0.4] via-[hsl(210,40%,16%)/0.6] to-[hsl(var(--background))]" />
        
        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div
            className={`transition-all duration-700 ${
              showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <img
              src={sageifyLogo}
              alt="Sageify"
              className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full shadow-2xl border-2 border-white/20 mb-6"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white drop-shadow-lg">
              Sageify
            </h1>
            <p className="text-lg md:text-xl text-white/80 mt-3 max-w-lg mx-auto font-light">
              הערכה מקצועית לגילוי חוזקות ומיפוי כיוונים תעסוקתיים
            </p>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="flex-1 flex flex-col items-center px-6 -mt-8 relative z-20">
        <div className="max-w-2xl w-full space-y-10">

          {/* Greeting card */}
          <div
            className={`transition-all duration-700 ${
              showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
              <h2 className="text-2xl font-bold font-serif text-foreground mb-3">
                {owlWelcome.greeting}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {owlWelcome.intro}
              </p>
            </div>
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
            <p className="text-muted-foreground text-sm mt-4 text-center">⏱️ זמן משוער: 40-50 דקות | ההתקדמות נשמרת אוטומטית</p>
          </div>

          {/* CTA */}
          <div
            className={`transition-all duration-700 text-center pb-12 ${
              showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <button
              onClick={onStart}
              className="px-12 py-5 bg-secondary text-secondary-foreground rounded-xl text-xl font-semibold hover:bg-secondary/90 transition-all duration-300 hover:scale-105 shadow-lg group font-serif"
            >
              <span className="flex items-center gap-2 justify-center">
                {owlWelcome.cta}
                <span className="inline-block transition-transform group-hover:translate-x-[-4px]">🦉</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
