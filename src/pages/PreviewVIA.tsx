import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';
import type { Answers } from '@/lib/scoring';

export default function PreviewVIA() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const game = getGame('via');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return (
    <PreviewDoneScreen
      gameId="via"
      title="סיימת את VIA"
      emoji={game.emoji}
      summary={`${game.doneLine} ענית על ${Object.keys(answers).length} שאלות חוזקות.`}
    />
  );

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <VIAQuestionnaire
        answers={answers}
        onAnswer={(id, score) => setAnswers(prev => ({ ...prev, [id]: score }))}
        onComplete={() => setDone(true)}
        onBackToHub={() => navigate('/preview')}
      />
    </div>
  );
}
