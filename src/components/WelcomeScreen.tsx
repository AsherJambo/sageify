import { useState, useEffect } from 'react';
import sageifyLogo from '@/assets/owl-logo.png';
import heroBanner from '@/assets/hero-banner.png';
import { owlWelcome } from '@/lib/owlMessages';

interface WelcomeScreenProps {
  onStart: () => void;
  partnerOrg?: { org_name: string; logo_url: string | null; custom_welcome_message: string };
}

const WelcomeScreen = ({ onStart, partnerOrg }: WelcomeScreenProps) => {
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
      desc: 'חיפוש AI חי שמוצא לידים ספציפיים: משרות, התנדבויות ותפקידים בישראל',
    },
    {
      icon: '●',
      title: 'חוכמת קהילה',
      desc: 'סגי מזהה דפוסים בהשוואה לפרופילים דומים – ומראה מה הוביל אחרים לשביעות רצון',
    },
  ];

  const explorationAreas = [
    { icon: '◆', title: 'כישורים ותנאי סף', desc: 'מיינו 20 כישורים לארגז הכלים' },
    { icon: '⚓', title: 'עוגנים תעסוקתיים', desc: 'גלו מה באמת מניע אתכם' },
    { icon: '⚖', title: 'שיקולים בבחירת עיסוק', desc: 'בחרו ותעדפו שיקולים' },
    { icon: '🧭', title: 'נטיות תעסוקתיות', desc: 'גלו את הנטיות המקצועיות' },
    { icon: '✦', title: 'חוזקות VIA', desc: 'גלו את הכוחות הפנימיים' },
    { icon: '●', title: 'העדפות ופרופיל אישי', desc: 'העדפות וחלום המגירה' },
    { icon: '🧠', title: 'הערכת חשיבה וגמישות', desc: 'חשיפת חוזקות חשיבה ייחודיות' },
    { icon: '🧭', title: 'שיחה אישית עם סגי', desc: 'ייעוץ AI מותאם אישית' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[340px] md:h-[520px] overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(160,35%,18%)/0.5] via-[hsl(160,35%,18%)/0.6] to-[hsl(var(--background))]" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-6 text-center">
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-8">
              {partnerOrg?.logo_url && (
                <img
                  src={partnerOrg.logo_url}
                  alt={partnerOrg.org_name}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-xl object-contain bg-white/10 p-2"
                />
              )}
              <img
                src={sageifyLogo}
                alt="Sageify"
                className="w-20 h-20 md:w-32 md:h-32 mx-auto rounded-full shadow-[var(--shadow-elevated)] border-2 border-white/15"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white tracking-wide">
              Sageify
            </h1>
            <p className="text-base md:text-xl text-white/75 mt-2 md:mt-4 max-w-md mx-auto font-light tracking-wide">
              {partnerOrg?.custom_welcome_message 
                ? partnerOrg.custom_welcome_message
                : 'שיחה מקצועית לגילוי חוזקות ומיפוי כיוונים תעסוקתיים'}
            </p>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="flex-1 flex flex-col items-center px-4 md:px-6 -mt-10 relative z-20">
        <div className="max-w-2xl w-full space-y-10 md:space-y-16">

          {/* Greeting card */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="bg-card rounded-3xl p-6 md:p-10 shadow-[var(--shadow-card)] border border-border/60">
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
                 className="bg-card rounded-2xl p-5 md:p-7 border border-border/60 shadow-[var(--shadow-card)] text-center space-y-2 md:space-y-3 hover:border-secondary/30 transition-all duration-300"
                >
                  <div className="w-11 h-11 md:w-14 md:h-14 mx-auto rounded-full bg-secondary/8 border border-secondary/15 flex items-center justify-center text-base md:text-lg text-secondary font-display">
                    {pillar.icon}
                  </div>
                  <p className="font-bold font-display text-foreground tracking-wide text-base">
                    {pillar.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Exploration areas */}
          <div
            className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-center text-muted-foreground text-base mb-4 font-display tracking-wide">
              תחומי הגילוי שלכם
            </p>
            <div className="grid grid-cols-1 gap-3">
              {explorationAreas.map((area: any, i) => {
                const isLast = i === explorationAreas.length - 1;
                const isComingSoon = area.comingSoon;
                return (
                <div
                  key={i}
                  className={`flex items-center gap-5 bg-card rounded-2xl p-5 border shadow-[var(--shadow-card)] text-right group transition-all duration-300 ${
                    isLast
                      ? 'border-secondary/30 bg-secondary/[0.03]'
                      : isComingSoon
                        ? 'border-dashed border-border bg-card/50'
                        : 'border-border/60'
                  }`}
                >
                  <span className={`text-lg w-10 text-center flex-shrink-0 ${
                    isLast ? 'text-secondary' : 'text-muted-foreground/70'
                  }`}>
                    {area.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold font-display tracking-wide text-base ${
                        isLast ? 'text-secondary' : 'text-foreground'
                      }`}>{area.title}</p>
                      {isComingSoon && (
                        <span className="text-xs bg-gold-light text-foreground px-2 py-0.5 rounded-full font-display font-semibold">
                          בקרוב
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{area.desc}</p>
                  </div>
                </div>
                );
              })}
            </div>
            <p className="text-muted-foreground/60 text-sm mt-5 text-center tracking-wide">
              בעמוד הבא תבצעו זיהוי קצר, ובהמשך תוכלו לבחור אילו שאלונים למלא · מומלץ להשלים לפחות 3 · ההתקדמות נשמרת אוטומטית
            </p>
          </div>

          {/* CTA */}
          <div
             className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center pb-12 md:pb-20 ${
              showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <button
              onClick={onStart}
              className="px-10 py-5 md:px-14 md:py-6 bg-primary text-primary-foreground rounded-2xl text-lg md:text-xl font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)] group"
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