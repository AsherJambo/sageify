import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ExternalLink, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { trackInteraction } from '@/lib/interactionTracker';

interface RoadmapTask {
  title: string;
  description: string;
  link?: string;
  successMetric?: string;
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

const impactColors: Record<string, string> = {
  Low: 'text-muted-foreground',
  Medium: 'text-primary',
  High: 'text-secondary',
};

const InteractiveRoadmap = ({ chatMessages, tokenId, viaTop, scheinTop }: InteractiveRoadmapProps) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [starredTasks, setStarredTasks] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-1');

  const extractedTasks = extractRoadmapFromChat(chatMessages);

  const phases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      phase: 1,
      title: 'חקירה',
      subtitle: 'Exploration',
      icon: <Users className="w-5 h-5" />,
      color: 'text-secondary',
      borderColor: 'border-secondary/30',
      bgColor: 'bg-secondary/5',
      impactLevel: 'Medium',
      incomePotential: 'Low',
      timeframe: '0-30 ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(0, Math.ceil(extractedTasks.length / 3)).map(t => ({
            ...t,
            successMetric: 'השלמת חקירה ראשונית',
          }))
        : [
            { title: 'מנטורינג או צל מקצועי', description: 'בלו יומיים עם מי שכבר עושה את מה שמעניין אותך', successMetric: 'לפחות 2 מפגשים' },
            { title: 'התנדבות ניסיונית', description: 'בחר פרויקט התנדבות קצר (2-4 שבועות) בתחום שעניין אותך', successMetric: 'התחלת פרויקט אחד' },
            { title: 'מיפוי רשת קשרים', description: 'זהה 5 אנשים בתחום החדש ושוחח איתם', successMetric: '5 שיחות' },
          ],
    },
    {
      id: 'phase-2',
      phase: 2,
      title: 'מעבר',
      subtitle: 'Transition',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-primary',
      borderColor: 'border-primary/30',
      bgColor: 'bg-primary/5',
      impactLevel: 'High',
      incomePotential: 'Medium',
      timeframe: '30-90 ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(Math.ceil(extractedTasks.length / 3), Math.ceil(extractedTasks.length * 2 / 3)).map(t => ({
            ...t,
            successMetric: 'רכישת כלים חדשים',
          }))
        : [
            { title: 'קורס מקצועי ממוקד', description: 'הירשם לקורס או הכשרה בתחום הנבחר', successMetric: 'סיום קורס אחד' },
            { title: 'חברות בדירקטוריון', description: 'בדוק אפשרויות לכהן כדירקטור חיצוני', successMetric: 'הגשת מועמדות' },
            { title: 'בניית פורטפוליו', description: 'צור פרויקט ראשון שמדגים את היכולות החדשות', successMetric: 'פרויקט אחד מוגמר' },
          ],
    },
    {
      id: 'phase-3',
      phase: 3,
      title: 'השפעה',
      subtitle: 'Impact',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-accent-foreground',
      borderColor: 'border-accent/30',
      bgColor: 'bg-accent/5',
      impactLevel: 'High',
      incomePotential: 'High',
      timeframe: '90+ ימים',
      tasks: extractedTasks.length > 0
        ? extractedTasks.slice(Math.ceil(extractedTasks.length * 2 / 3)).map(t => ({
            ...t,
            successMetric: 'יצירת ערך מתמשך',
          }))
        : [
            { title: 'יזמות חברתית', description: 'הקם מיזם חברתי שמשלב את הניסיון שלך עם הערכים', successMetric: 'השקה ראשונית' },
            { title: 'הנחיית קהילה', description: 'בנה קבוצת פעולה סביב הנושא שבחרת', successMetric: '10+ משתתפים' },
            { title: 'מנהיגות מגזרית', description: 'הפוך למוביל דעה בתחום החדש שלך', successMetric: 'הרצאה או מאמר ראשון' },
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
      <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold font-display text-foreground tracking-wide">
            מפת הדרכים האינטראקטיבית
          </h3>
          <span className="text-sm font-display font-bold text-secondary">{progressPct}% הושלם</span>
        </div>
        <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {phases.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={p.color}>{p.icon}</span>
              <span>{p.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      {phases.map((phase, idx) => {
        const isExpanded = expandedPhase === phase.id;
        const phaseCompleted = phase.tasks.every(t => completedTasks.has(`${phase.id}:${t.title}`));

        return (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className={`rounded-3xl border ${phase.borderColor} overflow-hidden shadow-[var(--shadow-card)] ${phaseCompleted ? 'opacity-75' : ''}`}
          >
            {/* Phase header */}
            <button
              onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              className={`w-full flex items-center justify-between px-6 py-5 ${phase.bgColor} hover:brightness-95 transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${phase.bgColor} border ${phase.borderColor} flex items-center justify-center ${phase.color}`}>
                  {phaseCompleted ? <CheckCircle2 className="w-5 h-5" /> : phase.icon}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-display text-foreground">Phase {phase.phase}: {phase.title}</span>
                    <span className="text-xs text-muted-foreground">({phase.timeframe})</span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Social Impact: <span className={`font-bold ${impactColors[phase.impactLevel]}`}>{phase.impactLevel}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Income: <span className={`font-bold ${impactColors[phase.incomePotential]}`}>{phase.incomePotential}</span>
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Tasks */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-2 space-y-3">
                    {phase.tasks.map((task, ti) => {
                      const taskKey = `${phase.id}:${task.title}`;
                      const isCompleted = completedTasks.has(taskKey);
                      const isStarred = starredTasks.has(task.title);

                      return (
                        <div
                          key={ti}
                          className={`flex items-start gap-3 rounded-2xl border border-border/60 p-4 transition-all ${
                            isCompleted ? 'bg-secondary/5 border-secondary/20' : 'bg-card hover:bg-muted/20'
                          }`}
                        >
                          <button
                            onClick={() => handleTaskToggle(phase.id, task.title)}
                            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-secondary border-secondary text-secondary-foreground'
                                : 'border-muted-foreground/30 hover:border-secondary'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-bold text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.title}
                              </h4>
                              <button
                                onClick={() => handleStar(task.title)}
                                className={`flex-shrink-0 transition-colors ${isStarred ? 'text-gold' : 'text-muted-foreground/30 hover:text-gold/60'}`}
                              >
                                <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                            {task.successMetric && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
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
                                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                למידע נוסף
                              </a>
                            )}
                          </div>
                        </div>
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
  );
};

export default InteractiveRoadmap;
