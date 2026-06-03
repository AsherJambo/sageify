import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HollandQuestionnaire from '@/components/HollandQuestionnaire';
import PreviewDoneScreen from '@/components/PreviewDoneScreen';

export default function PreviewHolland() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  if (done) {
    return <PreviewDoneScreen title="סיימת את Holland" emoji="🧭" summary="התשובות נרשמו בהצלחה במצב תצוגה מקדימה." />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <HollandQuestionnaire
        onComplete={() => setDone(true)}
        onBackToHub={() => navigate('/preview')}
      />
    </div>
  );
}
