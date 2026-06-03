import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillsDragColumns from '@/components/SkillsDragColumns';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';

const PreviewSkills = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = getGame('skills');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (done) return <PreviewDoneScreen gameId="skills" title="הכישורים מוינו" emoji={game.emoji} summary={game.doneLine} />;
  return <SkillsDragColumns onComplete={() => setDone(true)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewSkills;
