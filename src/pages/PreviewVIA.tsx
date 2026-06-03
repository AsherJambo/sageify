import { useState } from 'react';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import type { Answers } from '@/lib/scoring';

export default function PreviewVIA() {
  const [answers, setAnswers] = useState<Answers>({});
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <VIAQuestionnaire
        answers={answers}
        onAnswer={(id, score) => setAnswers(prev => ({ ...prev, [id]: score }))}
        onComplete={() => {}}
        onBackToHub={() => {}}
      />
    </div>
  );
}
