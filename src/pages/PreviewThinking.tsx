import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThinkingCrackingCards from '@/components/ThinkingCrackingCards';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import PreviewIntroScreen from '@/components/PreviewIntroScreen';
import { getGame } from '@/lib/previewGames';
import type { ThinkingResult } from '@/data/thinkingQuestions';

const PreviewThinking = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<ThinkingResult | null>(null);
  const game = getGame('thinking');

  if (!started) return <PreviewIntroScreen game={game} onStart={() => setStarted(true)} />;
  if (result) return (
    <PreviewDoneScreen
      gameId="thinking"
      title="פיצחת את כל הכרטיסים"
      emoji={game.emoji}
      summary={`${game.doneLine} פתרת ${result.totalCorrect}/${result.totalQuestions} · רמה: ${result.levelLabel}`}
    />
  );
  return <ThinkingCrackingCards onComplete={(r) => setResult(r)} onBackToHub={() => navigate('/preview')} />;
};

export default PreviewThinking;
