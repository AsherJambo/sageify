import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VIAQuestionnaire from '@/components/VIAQuestionnaire';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';
import type { Answers } from '@/lib/scoring';

export default function PreviewVIA() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <PreviewDoneScreen
        title="סיימת את VIA"
        emoji="✨"
        summary={`ענית על ${Object.keys(answers).length} שאלות חוזקות.`}
      />
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <VIAQuestionnaire
        answers={answers}
        onAnswer={(id, score) => setAnswers(prev => ({ ...prev, [id]: score }))}
        onComplete={() => setDone(true)}
        onBackToHub={() => navigate('/preview')}
      />
    </div>
  );
}
