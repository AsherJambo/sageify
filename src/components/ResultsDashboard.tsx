import owlLogo from '@/assets/owl-logo.png';
import { getTopCategories } from '@/lib/scoring';

interface ResultsDashboardProps {
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
}

const ResultsDashboard = ({ viaScores, scheinScores }: ResultsDashboardProps) => {
  const topVIA = getTopCategories(viaScores, 2);
  const topSchein = getTopCategories(scheinScores, 2);

  const maxVIA = Math.max(...Object.values(viaScores), 1);
  const maxSchein = Math.max(...Object.values(scheinScores), 1);

  const generateNarrative = () => {
    const v1 = topVIA[0]?.category;
    const v2 = topVIA[1]?.category;
    const s1 = topSchein[0]?.category;
    const s2 = topSchein[1]?.category;
    return `הפרופיל שלכם מראה שהחוזקות המרכזיות שלכם הן "${v1}" ו"${v2}", בשילוב עם צורך עמוק ב"${s1}" ו"${s2}". שילוב ייחודי זה מעיד על כך שתפרחו בתפקידים שמאפשרים לכם להביא את החוכמה והניסיון שלכם לידי ביטוי, תוך שמירה על הערכים שחשובים לכם ביותר.`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <img src={owlLogo} alt="Sageify" className="w-20 h-20 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">
            הפרופיל שלכם ב-<span className="text-accent">Sageify</span>
          </h1>
        </div>

        {/* AI Narrative */}
        <div className="bg-card rounded-2xl p-6 border border-accent/30 shadow-md">
          <h3 className="text-lg font-bold text-accent mb-3">💡 תובנה מרכזית</h3>
          <p className="text-foreground leading-relaxed text-lg">{generateNarrative()}</p>
        </div>

        {/* Top Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">🌟 חוזקות מובילות (VIA)</h3>
            {topVIA.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-accent">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">ציון: {item.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">🧭 עוגנים מובילים (שיין)</h3>
            {topSchein.map((item, i) => (
              <div key={item.category} className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-accent">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.category}</p>
                  <p className="text-sm text-muted-foreground">ציון: {item.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIA Chart */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">חוזקות VIA – כל הקטגוריות</h3>
          <div className="space-y-3">
            {Object.entries(viaScores)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{score.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full progress-bar-fill"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Schein Chart */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">עוגנים תעסוקתיים – כל הקטגוריות</h3>
          <div className="space-y-3">
            {Object.entries(scheinScores)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{score.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full progress-bar-fill"
                      style={{ width: `${(score / 7) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Restart */}
        <div className="text-center pb-8">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
          >
            התחלה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
