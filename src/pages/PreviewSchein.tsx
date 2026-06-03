import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheinJourney from '@/components/ScheinJourney';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';
import type { Answers } from '@/lib/scoring';

export default function PreviewSchein() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const game = getGame('schein');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return (
    <PreviewDoneScreen
      gameId="schein"
      title="הגעת לסוף מסע העוגנים"
      emoji={game.emoji}
      summary={`${game.doneLine} ${Object.keys(answers).length} עוגנים דורגו.`}
    />
  );

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <ScheinJourney
        answers={answers}
        onAnswer={(id, score) => setAnswers(prev => ({ ...prev, [id]: score }))}
        onComplete={() => setDone(true)}
        onBackToHub={() => navigate('/preview')}
      />
    </div>
  );
}
