import { useState } from 'react';
import ScheinJourney from '@/components/ScheinJourney';
import type { Answers } from '@/lib/scoring';

export default function PreviewSchein() {
  const [answers, setAnswers] = useState<Answers>({});
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <ScheinJourney
        answers={answers}
        onAnswer={(id, score) => setAnswers(prev => ({ ...prev, [id]: score }))}
        onComplete={() => {}}
        onBackToHub={() => {}}
      />
    </div>
  );
}
