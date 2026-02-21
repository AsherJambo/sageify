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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-8">
        {/* Owl logo with gentle floating animation */}
        <div className="relative">
          <img
            src={owlLogo}
            alt="Sageify - ינשוף החוכמה"
            className="w-36 h-36 mx-auto mb-2 animate-float"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-foreground/5 rounded-full blur-sm animate-shadow-pulse" />
        </div>

        {/* Owl greeting — speech bubble style */}
        <div
          className={`transition-all duration-700 ${
            showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-card border border-accent/30 rounded-2xl p-5 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border-t border-r border-accent/30 rotate-[-135deg] rounded-sm" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            ברוכים הבאים ל-<span className="text-accent">Sageify</span>
          </h1>
        </div>

        {/* Journey overview with icons */}
        <div
          className={`transition-all duration-700 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm">
              <span className="text-3xl">🌟</span>
              <div className="text-right">
                <p className="font-semibold text-foreground">חלק א׳: חוזקות VIA</p>
                <p className="text-sm text-muted-foreground">48 שאלות – גלו את הכוחות הפנימיים שלכם</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-sm">
              <span className="text-3xl">🧭</span>
              <div className="text-right">
                <p className="font-semibold text-foreground">חלק ב׳: עוגנים תעסוקתיים</p>
                <p className="text-sm text-muted-foreground">40 שאלות – מצאו מה באמת מניע אתכם</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">⏱️ זמן משוער: 20-30 דקות | ההתקדמות נשמרת אוטומטית</p>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`transition-all duration-700 ${
            showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <button
            onClick={onStart}
            className="mt-4 px-10 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg group"
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
