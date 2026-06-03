import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThinkingCrackingCards from '@/components/ThinkingCrackingCards';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import type { ThinkingResult } from '@/data/thinkingQuestions';

const PreviewThinking = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<ThinkingResult | null>(null);

  if (result) {
    return (
      <PreviewDoneScreen
        title="פיצחת את כל הכרטיסים"
        emoji="🧩"
        summary={`פתרת נכון ${result.totalCorrect} מתוך ${result.totalQuestions} · רמה: ${result.levelLabel}`}
      />
    );
  }

  return (
    <ThinkingCrackingCards
      onComplete={(r) => setResult(r)}
      onBackToHub={() => navigate('/preview')}
    />
  );
};

export default PreviewThinking;
