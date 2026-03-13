import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSmartMatches, submitFeedback, type MatchedOpportunity } from '@/lib/smartMatch';
import { trackInteraction } from '@/lib/interactionTracker';
import owlLogo from '@/assets/owl-logo.png';

interface MatchCardsProps {
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  tokenId?: string;
}

const categoryLabels: Record<string, string> = {
  work: 'משרה',
  volunteer: 'התנדבות',
  course: 'קורס',
  freelance: 'פרילנס',
};

const categoryColors: Record<string, string> = {
  work: 'bg-primary/15 text-primary',
  volunteer: 'bg-secondary/15 text-secondary',
  course: 'bg-accent/15 text-accent-foreground',
  freelance: 'bg-muted text-muted-foreground',
};

const MatchCards = ({ viaScores, scheinScores, hollandScores, tokenId }: MatchCardsProps) => {
  const [matches, setMatches] = useState<MatchedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSmartMatches(viaScores, scheinScores, hollandScores, tokenId)
      .then(data => {
        if (!cancelled) {
          setMatches(data.matches);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Smart match error:', err);
          setError('לא הצלחנו לטעון את ההמלצות. נסו שוב.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [viaScores, scheinScores, hollandScores, tokenId]);

  const handleFeedback = async (oppId: string, oppTitle: string, feedback: 'accurate' | 'interesting' | 'not_relevant') => {
    if (!tokenId) return;
    setFeedbackSent(prev => ({ ...prev, [oppId]: feedback }));
    // Track interaction
    trackInteraction({
      tokenId,
      interactionType: feedback === 'not_relevant' ? 'dismiss' : feedback === 'accurate' ? 'star' : 'explore',
      targetType: 'opportunity',
      targetTitle: oppTitle,
      targetId: oppId,
      metadata: { feedback },
    });
    try {
      await submitFeedback(tokenId, oppId, feedback);
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center animate-pulse">
          <img src={owlLogo} alt="" className="w-10 h-10 rounded-full" />
        </div>
        <p className="text-muted-foreground font-display">מחפש את ההתאמות הטובות ביותר...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>לא נמצאו הזדמנויות מתאימות כרגע.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <img src={owlLogo} alt="" className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide">3 הנתיבים המובילים שלך</h3>
          <p className="text-sm text-muted-foreground">התאמה אישית מבוססת הפרופיל הפסיכומטרי שלך</p>
        </div>
      </div>

      <AnimatePresence>
        {matches.slice(0, 3).map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-3xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300"
          >
            {/* Match score header */}
            <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/40">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[match.category] || 'bg-muted text-muted-foreground'}`}>
                {categoryLabels[match.category] || match.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">התאמה</span>
                <span className={`text-lg font-bold font-display ${
                  match.matchScore >= 70 ? 'text-secondary' : match.matchScore >= 40 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {match.matchScore}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold font-display text-foreground tracking-wide mb-1">{match.title}</h4>
                <p className="text-sm text-secondary font-medium">{match.organization_name}</p>
                {match.location && <p className="text-xs text-muted-foreground mt-1">📍 {match.location}</p>}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{match.description}</p>

              {/* AI Rationale */}
              {match.aiRationale && (
                <div className="bg-secondary/5 rounded-2xl px-5 py-4 border border-secondary/15">
                  <p className="text-xs font-bold text-secondary mb-1.5 font-display">💡 למה זה מתאים לך?</p>
                  <p className="text-sm text-foreground leading-relaxed">{match.aiRationale}</p>
                </div>
              )}

              {/* Trait reasons */}
              {!match.aiRationale && match.reasons.length > 0 && (
                <div className="bg-muted/30 rounded-2xl px-5 py-4">
                  <p className="text-xs font-bold text-muted-foreground mb-1.5 font-display">🎯 למה זה מתאים:</p>
                  <ul className="space-y-1">
                    {match.reasons.map((r, j) => (
                      <li key={j} className="text-sm text-foreground">✓ {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={match.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium font-display text-sm tracking-wide hover:bg-primary/85 transition-all duration-300 shadow-[var(--shadow-card)]"
                >
                  למידע נוסף ←
                </a>

                {tokenId && !feedbackSent[match.id] && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleFeedback(match.id, 'accurate')}
                      className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-colors"
                      title="מדויק"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(match.id, 'interesting')}
                      className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="מעניין"
                    >
                      🤔
                    </button>
                    <button
                      onClick={() => handleFeedback(match.id, 'not_relevant')}
                      className="text-xs px-3 py-1.5 rounded-xl bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="לא רלוונטי"
                    >
                      👎
                    </button>
                  </div>
                )}
                {feedbackSent[match.id] && (
                  <span className="text-xs text-secondary font-medium">✓ תודה על המשוב!</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Additional matches */}
      {matches.length > 3 && (
        <div className="space-y-3 pt-4">
          <p className="text-sm font-display font-bold text-muted-foreground tracking-wide">הזדמנויות נוספות שעשויות לעניין אותך:</p>
          {matches.slice(3).map((match, i) => (
            <motion.a
              key={match.id}
              href={match.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center justify-between bg-card rounded-2xl px-5 py-4 border border-border/60 hover:border-secondary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryColors[match.category]}`}>
                  {categoryLabels[match.category]}
                </span>
                <span className="font-medium text-foreground group-hover:text-secondary transition-colors">{match.title}</span>
                <span className="text-xs text-muted-foreground">({match.organization_name})</span>
              </div>
              <span className="text-sm font-bold font-display text-muted-foreground">{match.matchScore}%</span>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchCards;
