import HollandQuestionnaire from '@/components/HollandQuestionnaire';

export default function PreviewHolland() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <HollandQuestionnaire onComplete={() => {}} onBackToHub={() => {}} />
    </div>
  );
}
