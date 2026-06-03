import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheinJourney from '@/components/ScheinJourney';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import type { Answers } from '@/lib/scoring';

export default function PreviewSchein() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <PreviewDoneScreen
        title="הגעת לסוף מסע העוגנים"
        emoji="⚓"
        summary={`${Object.keys(answers).length} עוגנים דורגו במסע שלך.`}
      />
    );
  }

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
