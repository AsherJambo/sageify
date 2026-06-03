import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesFlowingSliders from '@/components/PreferencesFlowingSliders';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';

const PreviewPreferences = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = getGame('preferences');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return <PreviewDoneScreen gameId="preferences" title="ההעדפות נשמרו" emoji={game.emoji} summary={game.doneLine} />;
  return <PreferencesFlowingSliders onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewPreferences;
