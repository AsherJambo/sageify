export type RIASEC = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface Bottle {
  id: string;
  name: string;
  description: string;
  category: RIASEC;
  emoji: string;
  color: string; // tailwind class for accent
}

export const RIASEC_NAMES: Record<RIASEC, string> = {
  R: 'הביצועית',
  I: 'החקרנית',
  A: 'האמנותית',
  S: 'החברתית',
  E: 'היזמית',
  C: 'המנהלתית',
};

export const RIASEC_FULL: Record<RIASEC, string> = {
  R: 'ביצועית (Realistic)',
  I: 'חקרנית (Investigative)',
  A: 'אמנותית (Artistic)',
  S: 'חברתית (Social)',
  E: 'יזמית (Enterprising)',
  C: 'מנהלתית (Conventional)',
};

export const BOTTLES: Bottle[] = [
  // R
  { id: 'r1', name: 'תמצית מכניקה', description: 'לתקן, לפרק ולהרכיב מכשירים או חומרה', category: 'R', emoji: '⚙️', color: 'bg-amber-100' },
  { id: 'r2', name: 'שיקוי שטח', description: 'לעבוד בחוץ, בטבע או באוויר הפתוח', category: 'R', emoji: '🏔️', color: 'bg-amber-100' },
  { id: 'r3', name: 'תרכיז חומרה', description: 'להפעיל מכונות, כלים או ציוד טכנולוגי פיזי', category: 'R', emoji: '🔧', color: 'bg-amber-100' },
  { id: 'r4', name: 'חומר גלם', description: 'לבנות, לייצר או לעצב דברים פיזיים מחומרים מוחשיים', category: 'R', emoji: '🧱', color: 'bg-amber-100' },
  // I
  { id: 'i1', name: 'סרום אנליטי', description: 'לנתח דאטה, גרפים, מספרים ומגמות מורכבות', category: 'I', emoji: '📊', color: 'bg-blue-100' },
  { id: 'i2', name: 'אבקת סקרנות', description: 'לחקור לעומק, לקרוא ולגלות איך דברים עובדים', category: 'I', emoji: '🔍', color: 'bg-blue-100' },
  { id: 'i3', name: 'תמצית פיצוח', description: 'לפתור בעיות לוגיות, חידות קשות או קוד תכנות', category: 'I', emoji: '🧩', color: 'bg-blue-100' },
  { id: 'i4', name: 'נוזל מעבדה', description: 'לערוך ניסויים, לבדוק היפותזות ולפתח תיאוריות', category: 'I', emoji: '🧪', color: 'bg-blue-100' },
  // A
  { id: 'a1', name: 'צבע יצירתי', description: 'לעצב ויזואלית — בגדים, אתרים, מבנים, גרפיקה', category: 'A', emoji: '🎨', color: 'bg-pink-100' },
  { id: 'a2', name: 'תמצית ביטוי', description: 'לכתוב סיפורים, תסריטים, שירים או תוכן מקורי', category: 'A', emoji: '✍️', color: 'bg-pink-100' },
  { id: 'a3', name: 'שיקוי במה', description: 'להופיע, לנגן, לשחק או להציג מול קהל', category: 'A', emoji: '🎭', color: 'bg-pink-100' },
  { id: 'a4', name: 'תמיל אלתור', description: 'להמציא רעיונות מטורפים מחוץ לקופסה', category: 'A', emoji: '💡', color: 'bg-pink-100' },
  // S
  { id: 's1', name: 'נוזל השראה', description: 'ללמד, להדריך, לאמן ולהצמיח אנשים', category: 'S', emoji: '🌱', color: 'bg-green-100' },
  { id: 's2', name: 'שיקוי אמפתיה', description: 'להקשיב, לטפל, לייעץ ולעזור לאנשים בקושי', category: 'S', emoji: '🤲', color: 'bg-green-100' },
  { id: 's3', name: 'תרכיז קהילה', description: 'לעבוד בצוות, לשתף פעולה ולעשות משימות יחד', category: 'S', emoji: '🤝', color: 'bg-green-100' },
  { id: 's4', name: 'תמצית גישור', description: 'לפתור סכסוכים, לחבר בין אנשים ולייצר אווירה טובה', category: 'S', emoji: '☮️', color: 'bg-green-100' },
  // E
  { id: 'e1', name: 'שיקוי כריזמה', description: 'לשכנע אנשים, למכור מוצרים, שירותים או רעיונות', category: 'E', emoji: '🎤', color: 'bg-orange-100' },
  { id: 'e2', name: 'תמצית מנהיגות', description: 'לנהל צוותים, להוביל פרויקטים, לקבל החלטות גדולות', category: 'E', emoji: '👑', color: 'bg-orange-100' },
  { id: 'e3', name: 'תרכיז סיכון', description: 'ליזום מאפס, להקים סטארטאפ או עסק עצמאי', category: 'E', emoji: '🚀', color: 'bg-orange-100' },
  { id: 'e4', name: 'נוזל אמביציה', description: 'לנהל משא ומתן, להתחרות ולסגור עסקאות', category: 'E', emoji: '🏆', color: 'bg-orange-100' },
  // C
  { id: 'c1', name: 'תמיל דיוק', description: 'לארגן מידע, קבצים, נתונים וטבלאות בסדר מופתי', category: 'C', emoji: '📋', color: 'bg-purple-100' },
  { id: 'c2', name: 'סרום בקרה', description: 'לנהל תקציבים, לעקוב אחר הוצאות ולחשב במדויק', category: 'C', emoji: '💰', color: 'bg-purple-100' },
  { id: 'c3', name: 'שיקוי סדר', description: 'לעבוד לפי נהלים ברורים, חוקים ושלבים מוגדרים', category: 'C', emoji: '📐', color: 'bg-purple-100' },
  { id: 'c4', name: 'תמצית ארגון', description: 'לתכנן לוחות זמנים, לוגיסטיקה, אירועים ופרטים', category: 'C', emoji: '🗂️', color: 'bg-purple-100' },
];

export const TRACKS = [
  { id: 'electricity', name: 'חשמל' },
  { id: 'software', name: 'תוכנה' },
  { id: 'construction', name: 'בניין' },
  { id: 'machinery', name: 'מכונות' },
  { id: 'medical_devices', name: 'מכשור רפואי' },
  { id: 'health_management', name: 'תעשייה וניהול במערכות בריאות' },
] as const;
