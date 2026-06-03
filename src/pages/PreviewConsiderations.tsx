import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsiderationsTagCloud from '@/components/ConsiderationsTagCloud';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';

const PreviewConsiderations = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = getGame('considerations');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return <PreviewDoneScreen gameId="considerations" title="ענן השיקולים נשקל" emoji={game.emoji} summary={game.doneLine} />;
  return <ConsiderationsTagCloud onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewConsiderations;
