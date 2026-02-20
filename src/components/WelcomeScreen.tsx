import owlLogo from '@/assets/owl-logo.png';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 fade-in">
      <div className="max-w-lg text-center space-y-8">
        <img
          src={owlLogo}
          alt="Sageify - ינשוף החוכמה"
          className="w-32 h-32 mx-auto mb-4"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          ברוכים הבאים ל-<span className="text-accent">Sageify</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          גלו את החוזקות והעוגנים התעסוקתיים שלכם – 
          כלי מבוסס מחקר שיעזור לכם למצוא את הדרך המתאימה ביותר 
          לפרק הבא בחייכם.
        </p>
        <div className="space-y-3 text-muted-foreground text-body-lg">
          <p>📋 <strong>חלק א׳:</strong> שאלון חוזקות VIA – 48 שאלות</p>
          <p>🧭 <strong>חלק ב׳:</strong> עוגנים תעסוקתיים של שיין – 40 שאלות</p>
          <p>⏱️ זמן משוער: 20-30 דקות</p>
        </div>
        <button
          onClick={onStart}
          className="mt-6 px-10 py-4 bg-primary text-primary-foreground rounded-lg text-xl font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          בואו נתחיל →
        </button>
        <p className="text-sm text-muted-foreground">
          ההתקדמות שלכם נשמרת אוטומטית – אפשר לעצור ולחזור בכל עת.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
