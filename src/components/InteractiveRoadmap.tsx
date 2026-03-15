import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ExternalLink, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { trackInteraction } from '@/lib/interactionTracker';

interface RoadmapTask {
  title: string;
  description: string;
  link?: string;
  successMetric?: string;
  whySagei?: string;
  matchScore?: number;
}

interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  tasks: RoadmapTask[];
  impactLevel: 'Low' | 'Medium' | 'High';
  incomePotential: 'Low' | 'Medium' | 'High';
  timeframe: string;
}

interface InteractiveRoadmapProps {
  chatMessages?: { role: string; content: string }[];
  tokenId?: string;
  viaTop?: string[];
  scheinTop?: string[];
}

function extractRoadmapFromChat(messages?: { role: string; content: string }[]): RoadmapTask[] {
  if (!messages?.length) return [];
  const roadmapMsg = messages
    .filter(m => m.role === 'assistant')
    .find(m => m.content.includes('Sage Action Roadmap'));
  if (!roadmapMsg) return [];

  const taskRegex = /\d+\.\s*\*\*(.+?)\*\*\s*[–-]\s*(.+?)(?:\n|$)/g;
  const tasks: RoadmapTask[] = [];
  let match;
  while ((match = taskRegex.exec(roadmapMsg.content)) !== null) {
    tasks.push({ title: match[1].trim(), description: match[2].trim() });
  }
  return tasks;
}

const impactLabels: Record<string, string> = {
  Low: 'נמוך',
  Medium: 'בינוני',
  High: 'גבוה',
};

function getWhySageiDefault(viaTop?: string[], scheinTop?: string[]): (phase: number) => string {
  const via = viaTop?.slice(0, 2).join(' ו') || 'החוזקות שלכם';
  const schein = scheinTop?.[0] || 'העוגן התעסוקתי';
  return (phase: number) => {
    switch (phase) {
      case 1: return `בהתבסס על ${via}, סגי ממליץ להתחיל בחקירה פרקטית כדי לבחון את הכיוון בשטח`;
      case 2: return `העוגן "${schein}" מצביע על כך שתוכלו להצליח בתפקידים שדורשים העמקה ופיתוח`;
      case 3: return `השילוב של ${via} עם ניסיון העבר שלכם מציב אתכם במקום מצוין ליצירת השפעה אמיתית`;
      default: return 'סגי מזהה פוטנציאל משמעותי בכיוון הזה';
    }
  };
}

function getMatchScore(phase: number): number {
  return phase === 1 ? 78 : phase === 2 ? 88 : 94;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 22,
  mass: 0.8,
};

const InteractiveRoadmap = ({ chatMessages, tokenId, viaTop, scheinTop }: InteractiveRoadmapProps) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [starredTasks, setStarredTasks] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-1');

  const extractedTasks = extractRoadmapFromChat(chatMessages);
  const getWhySagei = getWhySageiDefault(viaTop, scheinTop);

  const phases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      phase: 1,
      title: 'חקירה',
      subtitle: 'Exploration',
      icon: <Users className="w-5 h-5" />,
      color: 'text-secondary',
      borderColor: 'border-secondary/20',
      bgColor: 'bg-secondary/5',
      impactLevel: 'Medium',
      incomePotential: 'Low',
      timeframe: '0-30 ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(0, Math.ceil(extractedTasks.length / 3)).map(t => ({
            ...t, successMetric: 'השלמת חקירה ראשונית', whySagei: getWhySagei(1), matchScore: getMatchScore(1),
          }))
        : [
            { title: 'מנטורינג או צל מקצועי', description: 'בלו יומיים עם מי שכבר עושה את מה שמעניין אתכם', successMetric: 'לפחות 2 מפגשים', whySagei: getWhySagei(1), matchScore: 82 },
            { title: 'התנדבות ניסיונית', description: 'בחרו פרויקט התנדבות קצר (2-4 שבועות) בתחום שעניין אתכם', successMetric: 'התחלת פרויקט אחד', whySagei: getWhySagei(1), matchScore: 76 },
            { title: 'מיפוי רשת קשרים', description: 'זהו 5 אנשים בתחום החדש ושוחחו איתם', successMetric: '5 שיחות', whySagei: getWhySagei(1), matchScore: 79 },
          ],
    },
    {
      id: 'phase-2',
      phase: 2,
      title: 'מעבר',
      subtitle: 'Transition',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-primary',
      borderColor: 'border-primary/20',
      bgColor: 'bg-primary/5',
      impactLevel: 'High',
      incomePotential: 'Medium',
      timeframe: '30-90 ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(Math.ceil(extractedTasks.length / 3), Math.ceil(extractedTasks.length * 2 / 3)).map(t => ({
            ...t, successMetric: 'רכישת כלים חדשים', whySagei: getWhySagei(2), matchScore: getMatchScore(2),
          }))
        : [
            { title: 'קורס מקצועי ממוקד', description: 'הירשמו לקורס או הכשרה בתחום הנבחר', successMetric: 'סיום קורס אחד', whySagei: getWhySagei(2), matchScore: 91 },
            { title: 'חברות בדירקטוריון', description: 'בדקו אפשרויות לכהן כדירקטור חיצוני', successMetric: 'הגשת מועמדות', whySagei: getWhySagei(2), matchScore: 85 },
            { title: 'בניית פורטפוליו', description: 'צרו פרויקט ראשון שמדגים את היכולות החדשות', successMetric: 'פרויקט אחד מוגמר', whySagei: getWhySagei(2), matchScore: 88 },
          ],
    },
    {
      id: 'phase-3',
      phase: 3,
      title: 'השפעה',
      subtitle: 'Impact',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-accent-foreground',
      borderColor: 'border-accent/20',
      bgColor: 'bg-accent/5',
      impactLevel: 'High',
      incomePotential: 'High',
      timeframe: '90+ ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(Math.ceil(extractedTasks.length * 2 / 3)).map(t => ({
            ...t, successMetric: 'יצירת ערך מתמשך', whySagei: getWhySagei(3), matchScore: getMatchScore(3),
          }))
        : [
            { title: 'יזמות חברתית', description: 'הקימו מיזם חברתי שמשלב את הניסיון שלכם עם הערכים', successMetric: 'השקה ראשונית', whySagei: getWhySagei(3), matchScore: 94 },
            { title: 'הנחיית קהילה', description: 'בנו קבוצת פעולה סביב הנושא שבחרתם', successMetric: '10+ משתתפים', whySagei: getWhySagei(3), matchScore: 92 },
            { title: 'מנהיגות מגזרית', description: 'הפכו למובילי דעה בתחום החדש', successMetric: 'הרצאה או מאמר ראשון', whySagei: getWhySagei(3), matchScore: 96 },
          ],
    },
  ];

  const handleTaskToggle = (phaseId: string, taskTitle: string) => {
    const key = `${phaseId}:${taskTitle}`;
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (tokenId) {
          trackInteraction({
            tokenId,
            interactionType: 'complete_phase',
            targetType: 'roadmap_task',
            targetTitle: taskTitle,
            metadata: { phaseId },
          });
        }
      }
      return next;
    });
  };

  const handleStar = (taskTitle: string) => {
    const isStarred = starredTasks.has(taskTitle);
    setStarredTasks(prev => {
      const next = new Set(prev);
      if (isStarred) next.delete(taskTitle);
      else next.add(taskTitle);
      return next;
    });
    if (tokenId) {
      trackInteraction({
        tokenId,
        interactionType: isStarred ? 'dismiss' : 'star',
        targetType: 'roadmap_task',
        targetTitle: taskTitle,
      });
    }
  };

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Progress header */}
      <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-7 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display text-foreground tracking-wide">
            🌿 מפת הדרכים שלכם
          </h3>
          <span className="text-base font-display font-bold text-secondary">{progressPct}% הושלם</span>
        </div>
        <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between mt-4">
          {phases.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={p.color}>{p.icon}</span>
              <span>{p.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards — Glassmorphism */}
      <div className="relative">
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border/30 hidden md:block" />

        {phases.map((phase, idx) => {
          const isExpanded = expandedPhase === phase.id;
          const phaseCompleted = phase.tasks.every(t => completedTasks.has(`${phase.id}:${t.title}`));

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-3xl border overflow-hidden mb-4 md:mr-10 relative ${
                phaseCompleted ? 'opacity-75' : ''
              } ${
                isExpanded
                  ? 'bg-card/90 backdrop-blur-2xl border-secondary/25 shadow-[var(--shadow-elevated)]'
                  : 'bg-card/70 backdrop-blur-xl border-border/40 shadow-[var(--shadow-card)]'
              }`}
            >
              {/* Timeline dot */}
              <div className={`hidden md:flex absolute -right-[52px] top-6 w-5 h-5 rounded-full border-2 ${phase.borderColor} ${phaseCompleted ? 'bg-secondary' : 'bg-card'}`} />

              {/* Phase header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className={`w-full flex items-center justify-between px-7 py-6 hover:bg-muted/10 transition-all duration-300 min-h-[72px]`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${phase.bgColor} border ${phase.borderColor} flex items-center justify-center ${phase.color}`}>
                    {phaseCompleted ? <CheckCircle2 className="w-6 h-6" /> : phase.icon}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-display text-foreground text-lg">שלב {phase.phase}: {phase.title}</span>
                      <span className="text-sm text-muted-foreground">({phase.timeframe})</span>
                    </div>
                    <div className="flex gap-4 mt-1.5">
                      <span className="text-sm text-muted-foreground">
                        השפעה: <span className="font-bold text-secondary">{impactLabels[phase.impactLevel]}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        הכנסה: <span className="font-bold text-secondary">{impactLabels[phase.incomePotential]}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Tasks — spring expand */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springTransition}
                    className="overflow-hidden"
                  >
                    <div className="px-7 pb-6 pt-3 space-y-4">
                      {phase.tasks.map((task, ti) => {
                        const taskKey = `${phase.id}:${task.title}`;
                        const isCompleted = completedTasks.has(taskKey);
                        const isStarred = starredTasks.has(task.title);

                        return (
                          <motion.div
                            key={ti}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ti * 0.08, ...springTransition }}
                            className={`rounded-2xl border p-5 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-secondary/5 border-secondary/15 backdrop-blur-sm'
                                : 'bg-card/60 backdrop-blur-xl border-border/40 hover:bg-card/80 hover:border-secondary/20'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => handleTaskToggle(phase.id, task.title)}
                                className={`mt-0.5 w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all min-w-[28px] min-h-[28px] ${
                                  isCompleted
                                    ? 'bg-secondary border-secondary text-secondary-foreground'
                                    : 'border-muted-foreground/30 hover:border-secondary'
                                }`}
                              >
                                {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`font-bold text-base ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Success Metric Badge */}
                                    {task.matchScore && (
                                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-bold border border-secondary/15">
                                        {task.matchScore}% התאמה
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleStar(task.title)}
                                      className={`transition-colors p-1 min-w-[36px] min-h-[36px] flex items-center justify-center ${isStarred ? 'text-gold' : 'text-muted-foreground/30 hover:text-gold/60'}`}
                                    >
                                      <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                
                                {/* "Why Sagei chose this" */}
                                {task.whySagei && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-3 bg-secondary/5 backdrop-blur-sm border border-secondary/10 rounded-xl px-4 py-3"
                                  >
                                    <p className="text-sm text-secondary font-medium">
                                      🌿 למה סגי בחר בזה עבורכם:
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{task.whySagei}</p>
                                  </motion.div>
                                )}

                                {task.successMetric && (
                                  <div className="mt-2 flex items-center gap-1.5">
                                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                                      🎯 {task.successMetric}
                                    </span>
                                  </div>
                                )}
                                {task.link && (
                                  <a
                                    href={task.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => tokenId && trackInteraction({
                                      tokenId,
                                      interactionType: 'click',
                                      targetType: 'roadmap_task',
                                      targetTitle: task.title,
                                    })}
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 min-h-[44px]"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    למידע נוסף
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveRoadmap;
