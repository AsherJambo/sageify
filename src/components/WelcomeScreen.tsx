import { useState, useEffect } from 'react';
import sageifyLogo from '@/assets/owl-logo.png';
import heroBanner from '@/assets/hero-banner.png';
import { owlWelcome } from '@/lib/owlMessages';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showPillars, setShowPillars] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowGreeting(true), 500);
    setTimeout(() => setShowIntro(true), 1400);
    setTimeout(() => setShowPillars(true), 2200);
    setTimeout(() => setShowDetails(true), 3200);
    setTimeout(() => setShowCTA(true), 4200);
  }, []);

  const pillars = [
    {
      icon: '◆',
      title: 'דיוק פסיכולוגי',
      desc: 'מערכת שנבנתה על ידי מומחי פסיכולוגיה תעסוקתית – מגשרת בין "מי שאתם" ל"מה תעשו מחר"',
    },
    {
      icon: '✦',
      title: 'סריקת שוק בזמן אמת',
      desc: 'חיפוש AI חי שמוצא לידים ספציפיים: משרות, התנדבויות ותפקידים בישראל – לא רק קטגוריות כלליות',
    },
    {
      icon: '●',
      title: 'סינון שיתופי',
      desc: 'ה-AI מזהה דפוסים בהשוואה לפרופילים דומים – ומראה מה הוביל אחרים לשביעות רצון גבוהה',
    },
  ];

  const journeySteps = [
    { num: '01', title: 'חוזקות VIA', desc: '48 שאלות – גלו את הכוחות הפנימיים שלכם' },
    { num: '02', title: 'עוגנים תעסוקתיים', desc: '40 שאלות – מה באמת מניע אתכם' },
    { num: '03', title: 'שיקולים בבחירת עיסוק', desc: 'בחרו 6 שיקולים וחלקו 100 נקודות' },
    { num: '04', title: 'נטיות תעסוקתיות', desc: '66 שאלות – גלו את הנטיות שלכם' },
    { num: '05', title: 'כישורים ותנאי סף', desc: '20 כישורים – מיינו לארגז הכלים' },
    { num: '06', title: 'העדפות וחלום המגירה', desc: 'העדפות אישיות + תחום החלום שלכם' },
    { num: '07', title: 'יועץ AI והתאמת עיסוק', desc: 'שיחה אישית עם יועץ חכם + התאמה ממאגר עיסוקים ייחודי לגיל השלישי' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[460px] md:h-[520px] overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,45%,14%)/0.5] via-[hsl(210,45%,14%)/0.65] to-[hsl(var(--background))]" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <img
              src={sageifyLogo}
              alt="Sageify"
              className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full shadow-[var(--shadow-elevated)] border-2 border-white/15 mb-8"
            />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display text-white tracking-wide">
              Sageify
            </h1>
            <p className="text-lg md:text-xl text-white/70 mt-4 max-w-md mx-auto font-light tracking-wide">
              הערכה מקצועית לגילוי חוזקות ומיפוי כיוונים תעסוקתיים
            </p>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="flex-1 flex flex-col items-center px-6 -mt-10 relative z-20">
        <div className="max-w-2xl w-full space-y-16">

          {/* Greeting card */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="bg-card rounded-3xl p-10 shadow-[var(--shadow-card)] border border-border/60">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-4 tracking-wide">
                {owlWelcome.greeting}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {owlWelcome.intro}
              </p>
            </div>
          </div>

          {/* 3 Pillars — Value Proposition */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showPillars ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border/60 shadow-[var(--shadow-card)] text-center space-y-3 hover:border-secondary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-secondary/8 border border-secondary/15 flex items-center justify-center text-lg text-secondary font-display">
                    {pillar.icon}
                  </div>
                  <p className="font-bold font-display text-foreground tracking-wide text-sm">
                    {pillar.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Journey steps — editorial numbered list */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-3">
              {journeySteps.map((step, i) => {
                const isHighlight = step.num === '07';
                return (
                <div
                  key={i}
                  className={`flex items-center gap-5 bg-card rounded-2xl p-5 border shadow-[var(--shadow-card)] text-right group transition-all duration-300 ${
                    isHighlight
                      ? 'border-secondary/30 bg-secondary/[0.03]'
                      : 'border-border/60 hover:border-secondary/30'
                  }`}
                >
                  <span className={`text-xs font-display tracking-widest w-8 text-center flex-shrink-0 ${
                    isHighlight ? 'text-secondary font-bold' : 'text-muted-foreground/50'
                  }`}>
                    {step.num}
                  </span>
                  <div className={`h-8 w-px ${isHighlight ? 'bg-secondary/30' : 'bg-border/60'}`} />
                  <div className="flex-1">
                    <p className={`font-semibold font-display tracking-wide ${
                      isHighlight ? 'text-secondary' : 'text-foreground'
                    }`}>{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                  {isHighlight && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium flex-shrink-0">
                      חדש
                    </span>
                  )}
                </div>
                );
              })}
            </div>
            <p className="text-muted-foreground/60 text-sm mt-6 text-center tracking-wide">
              ⏱ זמן משוער: 40–50 דקות · ההתקדמות נשמרת אוטומטית
            </p>
          </div>

          {/* CTA */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center pb-20 ${
              showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <button
              onClick={onStart}
              className="px-14 py-5 bg-primary text-primary-foreground rounded-2xl text-xl font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)] group"
            >
              <span className="flex items-center gap-3 justify-center">
                {owlWelcome.cta}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-[6px]">←</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;