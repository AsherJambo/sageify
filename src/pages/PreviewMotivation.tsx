import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MotivationMixer from '@/components/MotivationMixer';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';

const PreviewMotivation = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = getGame('motivation');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return <PreviewDoneScreen gameId="motivation" title="מיקסר המוטיבציה הושלם" emoji={game.emoji} summary={game.doneLine} />;
  return <MotivationMixer onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewMotivation;
