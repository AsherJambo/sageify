import React, { useState } from 'react';
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

type PhaseTone = 'sage' | 'amber' | 'coral';

interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  emoji: string;
  icon: React.ReactNode;
  tone: PhaseTone;
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

// Owl Forest tone palette — chunky, cream surfaces with semantic accents
const toneStyles: Record<PhaseTone, {
  surface: string;       // closed card background
  surfaceOpen: string;   // expanded card background
  border: string;        // border color class
  ring: string;          // forest border for chunky outline
  chipBg: string;        // icon chip background
  chipText: string;      // icon chip text color
  accentText: string;    // label highlight color
  shadow: string;        // chunky bottom shadow (closed)
  shadowOpen: string;    // chunky bottom shadow (expanded)
  dot: string;           // timeline dot bg when active
}> = {
  sage: {
    surface: 'bg-sage-light',
    surfaceOpen: 'bg-card',
    border: 'border-sage',
    ring: 'border-foreground',
    chipBg: 'bg-sage',
    chipText: 'text-foreground',
    accentText: 'text-foreground',
    shadow: '0 6px 0 0 hsl(var(--sage) / 0.55)',
    shadowOpen: '0 6px 0 0 hsl(var(--foreground) / 0.9)',
    dot: 'bg-sage',
  },
  amber: {
    surface: 'bg-gold-light',
    surfaceOpen: 'bg-card',
    border: 'border-accent',
    ring: 'border-foreground',
    chipBg: 'bg-accent',
    chipText: 'text-accent-foreground',
    accentText: 'text-foreground',
    shadow: '0 6px 0 0 hsl(var(--accent) / 0.6)',
    shadowOpen: '0 6px 0 0 hsl(var(--foreground) / 0.9)',
    dot: 'bg-accent',
  },
  coral: {
    surface: 'bg-coral-soft',
    surfaceOpen: 'bg-card',
    border: 'border-destructive',
    ring: 'border-foreground',
    chipBg: 'bg-destructive',
    chipText: 'text-destructive-foreground',
    accentText: 'text-foreground',
    shadow: '0 6px 0 0 hsl(var(--destructive) / 0.55)',
    shadowOpen: '0 6px 0 0 hsl(var(--foreground) / 0.9)',
    dot: 'bg-destructive',
  },
};

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
      emoji: '🔭',
      icon: <Users className="w-6 h-6" />,
      tone: 'sage',
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
      emoji: '🌱',
      icon: <TrendingUp className="w-6 h-6" />,
      tone: 'amber',
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
      emoji: '🦉',
      icon: <Zap className="w-6 h-6" />,
      tone: 'coral',
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
    <div className="space-y-8" dir="rtl">
      {/* Progress header — chunky owl card */}
      <div
        className="bg-card border-2 border-foreground rounded-3xl p-7"
        style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.9)' }}
      >
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <h3 className="text-2xl font-serif font-bold text-foreground tracking-wide flex items-center gap-2">
            <span aria-hidden="true">🦉</span>
            מפת הדרכים שלכם
          </h3>
          <span
            className="text-lg font-serif font-bold px-4 py-1.5 rounded-full bg-accent text-accent-foreground border-2 border-foreground"
            style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
          >
            🪙 {progressPct}% הושלם
          </span>
        </div>
        <div className="w-full h-5 bg-sand-warm rounded-full overflow-hidden border-2 border-foreground">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between mt-5 gap-3 flex-wrap">
          {phases.map(p => {
            const s = toneStyles[p.tone];
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 text-base font-medium text-foreground px-3 py-1.5 rounded-full border-2 border-foreground ${s.surface}`}
              >
                <span aria-hidden="true">{p.emoji}</span>
                <span>{p.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase cards */}
      <div className="relative">
        <div className="absolute right-6 top-4 bottom-4 w-1 bg-foreground/15 rounded-full hidden md:block" />

        {phases.map((phase, idx) => {
          const isExpanded = expandedPhase === phase.id;
          const phaseCompleted = phase.tasks.every(t => completedTasks.has(`${phase.id}:${t.title}`));
          const s = toneStyles[phase.tone];

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-3xl overflow-hidden mb-7 md:mr-12 relative border-2 border-foreground ${
                isExpanded ? s.surfaceOpen : s.surface
              } ${phaseCompleted ? 'opacity-90' : ''}`}
              style={{ boxShadow: isExpanded ? s.shadowOpen : s.shadow }}
            >
              {/* Timeline dot */}
              <div
                className={`hidden md:flex absolute -right-[58px] top-8 w-7 h-7 rounded-full border-2 border-foreground items-center justify-center ${phaseCompleted ? s.dot : 'bg-card'}`}
                aria-hidden="true"
              >
                {phaseCompleted && <CheckCircle2 className="w-4 h-4 text-foreground" />}
              </div>

              {/* Phase header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className="w-full flex items-center justify-between px-6 md:px-8 py-6 hover:bg-foreground/5 transition-colors duration-200 min-h-[88px] text-right"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 border-foreground flex items-center justify-center text-2xl ${s.chipBg} ${s.chipText}`}
                    style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                  >
                    {phaseCompleted ? <CheckCircle2 className="w-7 h-7" /> : <span aria-hidden="true">{phase.emoji}</span>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold font-serif text-foreground text-xl md:text-2xl">
                        שלב {phase.phase}: {phase.title}
                      </span>
                      <span className="text-sm md:text-base text-foreground/70 font-medium px-2.5 py-0.5 rounded-full bg-card border border-foreground/30">
                        {phase.timeframe}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-sm md:text-base text-foreground/80 px-3 py-1 rounded-full bg-card border-2 border-foreground/20">
                        השפעה: <span className="font-bold text-foreground">{impactLabels[phase.impactLevel]}</span>
                      </span>
                      <span className="text-sm md:text-base text-foreground/80 px-3 py-1 rounded-full bg-card border-2 border-foreground/20">
                        הכנסה: <span className="font-bold text-foreground">{impactLabels[phase.incomePotential]}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-7 h-7 text-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Tasks */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springTransition}
                    className="overflow-hidden"
                  >
                    <div className="px-6 md:px-8 pb-7 pt-2 space-y-5">
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
                            className={`rounded-2xl border-2 p-5 md:p-6 transition-colors duration-200 ${
                              isCompleted
                                ? `${s.surface} border-foreground/40`
                                : 'bg-card border-foreground/25 hover:border-foreground/50'
                            }`}
                            style={{
                              boxShadow: isCompleted
                                ? '0 3px 0 0 hsl(var(--foreground) / 0.35)'
                                : '0 4px 0 0 hsl(var(--foreground) / 0.55)',
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => handleTaskToggle(phase.id, task.title)}
                                aria-label={isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                                className={`mt-1 w-12 h-12 rounded-xl border-2 border-foreground flex-shrink-0 flex items-center justify-center transition-transform active:translate-y-[2px] ${
                                  isCompleted
                                    ? 'bg-sage text-foreground'
                                    : 'bg-card hover:bg-sand-warm'
                                }`}
                                style={{
                                  boxShadow: isCompleted
                                    ? '0 2px 0 0 hsl(var(--foreground) / 0.7)'
                                    : '0 3px 0 0 hsl(var(--foreground) / 0.7)',
                                }}
                              >
                                {isCompleted && <CheckCircle2 className="w-6 h-6" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <h4 className={`font-serif font-bold text-lg md:text-xl leading-relaxed ${isCompleted ? 'line-through text-foreground/50' : 'text-foreground'}`}>
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {task.matchScore && (
                                      <span
                                        className="text-sm px-3 py-1.5 rounded-full bg-accent text-accent-foreground font-bold border-2 border-foreground"
                                        style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.85)' }}
                                      >
                                        🪙 {task.matchScore}% XP
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleStar(task.title)}
                                      aria-label={isStarred ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
                                      className={`transition-colors p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl border-2 ${
                                        isStarred
                                          ? 'bg-accent text-accent-foreground border-foreground'
                                          : 'bg-card text-foreground/50 border-foreground/30 hover:text-foreground hover:border-foreground/60'
                                      }`}
                                      style={isStarred ? { boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.85)' } : undefined}
                                    >
                                      <Star className={`w-6 h-6 ${isStarred ? 'fill-current' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-base md:text-lg text-foreground/80 mt-2 leading-relaxed">{task.description}</p>

                                {task.whySagei && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-4 bg-sand-warm border-2 border-foreground/30 rounded-2xl px-5 py-4"
                                    style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.35)' }}
                                  >
                                    <p className="text-base font-serif font-bold text-foreground flex items-center gap-2">
                                      <span aria-hidden="true">🦉</span>
                                      למה סגי בחר בזה עבורכם:
                                    </p>
                                    <p className="text-base text-foreground/80 mt-1.5 leading-relaxed">{task.whySagei}</p>
                                  </motion.div>
                                )}

                                {task.successMetric && (
                                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm px-4 py-1.5 rounded-full bg-sage-light text-foreground font-medium border-2 border-foreground/30">
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
                                    className="inline-flex items-center gap-2 text-base text-destructive-foreground bg-destructive hover:bg-destructive/90 mt-4 px-4 py-2 rounded-xl border-2 border-foreground font-bold min-h-[48px]"
                                    style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}
                                  >
                                    <ExternalLink className="w-5 h-5" />
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
