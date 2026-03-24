/* ── Part A: Motivation Clusters ── */
export interface MotivationCluster {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const motivationClusters: MotivationCluster[] = [
  {
    id: 'financial',
    title: 'מניעים כלכליים',
    description: 'הבטחת ביטחון כלכלי, שמירה על רמת החיים, כיסוי הוצאות רפואיות ובלתי צפויות.',
    icon: '💰',
  },
  {
    id: 'social',
    title: 'מניעים חברתיים',
    description: 'הימנעות מבדידות, אינטראקציה יומיומית עם אנשים, שמירה על מעגל חברתי פעיל.',
    icon: '🤝',
  },
  {
    id: 'psychological',
    title: 'מניעים פסיכולוגיים ומימוש עצמי',
    description: 'תחושת פרודוקטיביות ותרומה, ניצול המומחיות והניסיון שנצברו, שימור הזהות המקצועית.',
    icon: '🧠',
  },
  {
    id: 'vitality',
    title: 'חיוניות ובריאות',
    description: 'שמירה על חדות קוגניטיבית, שגרה מסודרת ומשמעותית, תרומה לבריאות הכללית.',
    icon: '🌿',
  },
];

/* ── Part B: Career Search Intention Statements ── */
export interface IntentionStatement {
  id: number;
  text: string;
  /** Which scoring dimension(s) this statement belongs to */
  dimensions: ('readiness' | 'proactivity' | 'flexibility')[];
}

export const intentionStatements: IntentionStatement[] = [
  { id: 1,  text: 'אני מתכנן/ת להישאר פעיל/ה מבחינה תעסוקתית גם לאחר הפרישה.',                 dimensions: ['readiness'] },
  { id: 2,  text: 'אני מחפש/ת באופן פעיל הזדמנויות תעסוקתיות חדשות.',                             dimensions: ['proactivity'] },
  { id: 3,  text: 'בחודשים הקרובים אני מתכוון/ת לפנות למקומות עבודה או התנדבות.',                   dimensions: ['proactivity'] },
  { id: 4,  text: 'אני פתוח/ה לעבוד בתחום שונה מזה שעבדתי בו לאורך הקריירה.',                     dimensions: ['flexibility'] },
  { id: 5,  text: 'אני מוכן/ה לקבל תפקיד בהיקף משרה מצומצם או גמיש.',                             dimensions: ['flexibility'] },
  { id: 6,  text: 'אני משקיע/ה זמן בלמידה או הכשרה כדי להתאים את עצמי לשוק העבודה הנוכחי.',       dimensions: ['proactivity'] },
  { id: 7,  text: 'אני מוכן/ה לעבוד בשכר נמוך מזה שהרווחתי, אם העיסוק יהיה משמעותי.',             dimensions: ['flexibility'] },
  { id: 8,  text: 'אני יוזם/ת שיחות עם אנשי מקצוע או ארגונים כדי לבחון אפשרויות.',                dimensions: ['proactivity'] },
  { id: 9,  text: 'יש לי תוכנית ברורה לגבי מה שאני רוצה לעשות בתקופה הקרובה.',                     dimensions: [] },
  { id: 10, text: 'אני מרגיש/ה מוכנ/ה מבחינה נפשית להתחיל פרק תעסוקתי חדש.',                       dimensions: ['readiness'] },
];

/* ── Scoring helpers ── */
export type MotivationScores = Record<string, number>;
export type IntentionAnswers = Record<number, number>;

export interface IntentionDimensions {
  readiness: number;
  proactivity: number;
  flexibility: number;
  general: number;
  intentionLevel: 'high' | 'medium' | 'low';
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateIntentionDimensions(answers: IntentionAnswers): IntentionDimensions {
  const readinessIds = [1, 10];
  const proactivityIds = [2, 3, 6, 8];
  const flexibilityIds = [4, 5, 7];

  const readiness = avg(readinessIds.map(id => answers[id]).filter(Boolean));
  const proactivity = avg(proactivityIds.map(id => answers[id]).filter(Boolean));
  const flexibility = avg(flexibilityIds.map(id => answers[id]).filter(Boolean));

  const allValues = Object.values(answers).filter(Boolean);
  const general = avg(allValues);

  let intentionLevel: 'high' | 'medium' | 'low' = 'medium';
  if (general >= 3.5) intentionLevel = 'high';
  else if (general < 2.5) intentionLevel = 'low';

  return { readiness, proactivity, flexibility, general, intentionLevel };
}

/* Category descriptions for results */
export const motivationClusterDescriptions: Record<string, string> = {
  'מניעים כלכליים': 'הצורך בביטחון כלכלי, שמירה על רמת חיים והתמודדות עם הוצאות.',
  'מניעים חברתיים': 'הצורך באינטראקציה חברתית, מניעת בדידות ושמירה על מעגל חברתי.',
  'מניעים פסיכולוגיים ומימוש עצמי': 'הצורך בתחושת תרומה, שימוש במומחיות ושימור זהות מקצועית.',
  'חיוניות ובריאות': 'הצורך בשמירה על חדות קוגניטיבית, שגרה ובריאות כללית.',
};

export const intentionDimensionDescriptions: Record<string, string> = {
  'מוכנות נפשית': 'המידה שבה אתם מרגישים מוכנים ומחויבים להמשיך בפעילות תעסוקתית.',
  'יוזמה ופרואקטיביות': 'עד כמה אתם פועלים באופן אקטיבי לחפש ולמצוא הזדמנויות חדשות.',
  'גמישות תעסוקתית': 'המידה שבה אתם פתוחים לשינויים בתחום, בהיקף או בתנאי העיסוק.',
};
