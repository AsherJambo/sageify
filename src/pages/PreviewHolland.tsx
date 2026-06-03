import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';

export default function PreviewHolland() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = getGame('holland');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return <PreviewDoneScreen gameId="holland" title="סיימת את Holland" emoji={game.emoji} summary={game.doneLine} />;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <HollandQuestionnaire onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />
    </div>
  );
}
