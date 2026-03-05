// Personalized job & volunteering recommendations based on VIA + Schein profile

export interface Recommendation {
  title: string;
  description: string;
  reason: string;
  type: 'job' | 'volunteer' | 'freelance';
  platform: string;
  platformUrl: string;
  icon: string;
}

type CategoryKey = string;

// Mapping of VIA+Schein combinations to tailored recommendations
const recommendationPool: Record<string, Recommendation[]> = {
  // אנושיות + שליחות
  'אנושיות|שליחות': [
    { title: 'מנטור לבני נוער בסיכון', description: 'שתפו את החוכמה והניסיון שלכם עם צעירים שזקוקים להכוונה', reason: 'מתאים לך כי יש לך חוזקה באנושיות ותחושת שליחות עמוקה', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🤝' },
    { title: 'יועץ קהילתי לגמלאים', description: 'סייעו לאנשים בגיל הזהב למצוא פעילות משמעותית', reason: 'משלב את הרגישות האנושית שלך עם הרצון לתרום לקהילה', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '💛' },
    { title: 'מרצה בנושא מנהיגות אנושית', description: 'העבירו סדנאות בנושאי אמפתיה, הקשבה ומנהיגות', reason: 'מאפשר לך להעביר את הערכים האנושיים שלך לאחרים', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🎤' },
    { title: 'מתנדב בקו חירום רגשי', description: 'הקשיבו ותמכו באנשים ברגעים קשים דרך קווי סיוע', reason: 'מנצל את החמלה הטבעית שלך ואת הצורך שלך לעשות שינוי', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '📞' },
    { title: 'מנחה קבוצות תמיכה', description: 'הובילו קבוצות תמיכה לאנשים שעוברים שינויים בחיים', reason: 'משלב הקשבה אמפתית עם תחושת משמעות ותרומה', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌱' },
  ],
  // חכמה וידע + מומחיות
  'חכמה וידע|מומחיות': [
    { title: 'יועץ אסטרטגי בתעשייה', description: 'נצלו את הידע המקצועי העמוק שלכם לייעוץ לחברות', reason: 'מתאים לך כי אתה אוהב להעמיק בידע ולהיות מומחה בתחומך', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🧠' },
    { title: 'כותב תוכן מקצועי', description: 'כתבו מאמרים, ספרי הדרכה או בלוגים בתחום המומחיות', reason: 'מאפשר לך לשלב את אהבת הידע עם יצירת תוכן איכותי', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '✍️' },
    { title: 'מתנדב בתוכנית חינוך למבוגרים', description: 'העבירו ידע מקצועי לקהילה דרך תוכניות השכלה', reason: 'משלב את הסקרנות הטבעית שלך עם העברת ידע מעמיקה', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '📚' },
    { title: 'בודק/ת מקצועי למחקרים', description: 'סקירה וביקורת של מחקרים ומסמכים בתחום המומחיות', reason: 'מנצל את היכולת שלך לנתח מידע ברמה גבוהה', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🔬' },
  ],
  // אומץ לב + אתגר
  'אומץ לב|אתגר': [
    { title: 'מנטור ליזמים מתחילים', description: 'עזרו ליזמים צעירים להתמודד עם אתגרי הצמיחה', reason: 'מתאים לך כי אתה לא מפחד מאתגרים ואוהב להוביל קדימה', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '🚀' },
    { title: 'מנהל פרויקטים פרילנסר', description: 'נהלו פרויקטים מורכבים עבור חברות שמחפשות ניסיון', reason: 'מאפשר לך להתמודד עם אתגרים חדשים בכל פרויקט', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '⚡' },
    { title: 'מאמן אישי לפיתוח חוסן', description: 'לוו אנשים בתהליכי שינוי והתמודדות', reason: 'משלב את האומץ שלך עם הרצון לאתגר אחרים לצמוח', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '💪' },
    { title: 'מדריך הרפתקאות ופעילויות גיבוש', description: 'הובילו קבוצות בפעילויות מאתגרות ומעצימות', reason: 'מנצל את רוח ההרפתקה והאומץ הטבעי שלך', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🏔️' },
    { title: 'יועץ לניהול משברים', description: 'סייעו לארגונים להתמודד עם מצבי חירום ומשברים', reason: 'מתאים ליכולת שלך לפעול תחת לחץ ולקחת החלטות אמיצות', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🛡️' },
  ],
  // חוש צדק + ניהול
  'חוש צדק|ניהול': [
    { title: 'חבר דירקטוריון בעמותה', description: 'השפיעו על קבלת החלטות בארגונים חברתיים', reason: 'משלב את חוש הצדק שלך עם היכולת לנהל ולהשפיע', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '⚖️' },
    { title: 'יועץ ממשל תאגידי', description: 'סייעו לחברות לבנות מבנה ניהולי הוגן ושקוף', reason: 'מאפשר לך להוביל שינוי ארגוני מבוסס ערכי הגינות', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🏛️' },
    { title: 'מנחה קבוצות דיאלוג קהילתי', description: 'הובילו שיח בין קבוצות מגוונות בקהילה', reason: 'מנצל את הרגישות שלך לצדק ואת כישורי ההובלה', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌍' },
    { title: 'גישור ופתרון סכסוכים', description: 'עזרו לאנשים וארגונים להגיע להסכמות הוגנות', reason: 'מתאים לחוש הצדק שלך ולרצון שלך ליצור סדר', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🤝' },
  ],
  // מיקוד בטוב/נשגבות + סגנון חיים
  'מיקוד בטוב/נשגבות|סגנון חיים': [
    { title: 'מנחה סדנאות מיינדפולנס', description: 'שתפו את החוכמה הרוחנית שלכם דרך הנחיית קבוצות', reason: 'משלב את החיפוש שלך אחר משמעות עם שמירה על איזון', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🧘' },
    { title: 'מתנדב בבית אבות', description: 'הביאו שמחה ותחושת משמעות לקשישים', reason: 'מאפשר לך לראות את הטוב שבכל אדם ולתרום בקצב שלך', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌸' },
    { title: 'בלוגר/יוצר תוכן על חיים מספקים', description: 'שתפו את הפילוסופיה שלכם על חיים טובים ואיזון', reason: 'מנצל את הראייה האופטימית שלך עם חופש יצירתי', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '✨' },
    { title: 'מנחה קבוצות צמיחה אישית', description: 'הובילו מפגשים קבועים לפיתוח אישי ורוחני', reason: 'משלב את המיקוד שלך בטוב עם איזון בין עבודה לחיים', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🌟' },
  ],
  // מתינות וריסון + בטחון ויציבות
  'מתינות וריסון|בטחון ויציבות': [
    { title: 'יועץ פיננסי לגמלאים', description: 'עזרו לאנשים לתכנן נכון את הפנסיה והשלב הבא', reason: 'מתאים ליכולת שלך לשמור על שיקול דעת ולהעניק ביטחון', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '📊' },
    { title: 'מתנדב בקו סיוע רגשי', description: 'הקשיבו ותמכו באנשים שמתמודדים עם שינויים', reason: 'מנצל את האיפוק והרוגע שלך כדי לייצב אנשים ברגעי משבר', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '📞' },
    { title: 'מפקח איכות פרילנסר', description: 'בדקו ושפרו תהליכים בארגונים שמחפשים יציבות', reason: 'משלב את הדייקנות שלך עם הצורך ביציבות ומסגרת', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🔍' },
    { title: 'מנהל סיכונים ותאימות', description: 'סייעו לארגונים לזהות ולנהל סיכונים בצורה מובנית', reason: 'מתאים לאופי השקול שלך ולצורך שלך בסדר ויציבות', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '🛡️' },
  ],
  // חכמה וידע + יצירתיות יזמית
  'חכמה וידע|יצירתיות יזמית': [
    { title: 'יועץ לסטארטאפים בשלב מוקדם', description: 'שלבו חשיבה אסטרטגית עם רוח יזמית', reason: 'מתאים לך כי אתה משלב ידע עמוק עם חשיבה יצירתית', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '💡' },
    { title: 'שופט/מנטור בתחרות יזמות', description: 'תנו פידבק מקצועי ליזמים צעירים', reason: 'מאפשר לך לשלב ניסיון מקצועי עם הערכת רעיונות חדשניים', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🏆' },
    { title: 'מרצה על חדשנות וחשיבה יצירתית', description: 'העבירו ידע על יצירתיות ויזמות בפלטפורמות מקוונות', reason: 'משלב את אהבת הידע שלך עם היכולת ליזום ולחדש', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🎯' },
    { title: 'פיתוח קורסים דיגיטליים', description: 'צרו תוכן לימודי מקוון בתחום המומחיות שלכם', reason: 'מנצל את הידע העמוק שלך ביצירת מוצר יזמי דיגיטלי', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '💻' },
    { title: 'יועץ חדשנות לארגונים', description: 'סייעו לחברות לפתח תרבות של חדשנות ולמידה', reason: 'משלב את הסקרנות שלך עם הרוח היזמית ליצירת שינוי', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🚀' },
  ],
  // אנושיות + אוטונומיה
  'אנושיות|אוטונומיה': [
    { title: 'קואצ׳ר אישי עצמאי', description: 'ליוו אנשים בתהליכי צמיחה אישית – בקצב שלכם', reason: 'משלב את האמפתיה שלך עם הצורך בעצמאות וחופש', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🌱' },
    { title: 'מתנדב בתוכנית Big Brother/Sister', description: 'צרו קשר אישי עם צעיר שזקוק לדמות מבוגרת', reason: 'מאפשר חיבור אנושי עמוק בגמישות ובתנאים שלך', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '👥' },
    { title: 'כותב ביוגרפיות ותולדות חיים', description: 'עזרו לאנשים לספר את סיפורם האישי בכתב', reason: 'מנצל את הרגישות האנושית שלך בעבודה עצמאית ויצירתית', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '📖' },
    { title: 'מטפל/ת בעזרת בעלי חיים', description: 'שלבו טיפול רגשי עם עבודה עם בעלי חיים', reason: 'משלב את האנושיות שלך עם עבודה עצמאית בסביבה טבעית', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '🐕' },
  ],
};

// Default/fallback recommendations
const defaultRecommendations: Recommendation[] = [
  { title: 'מנטור מקצועי מנוסה', description: 'שתפו את שנות הניסיון עם הדור הבא', reason: 'מתאים לך כי יש לך ניסיון חיים עשיר שאפשר להעביר הלאה', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🌿' },
  { title: 'יועץ פרילנסר בתחום המומחיות', description: 'הפכו את הידע שצברתם לפעילות מניבה', reason: 'מנצל את הידע המקצועי שצברת לאורך השנים', type: 'freelance', platform: 'Upwork', platformUrl: 'https://www.upwork.com', icon: '💼' },
  { title: 'מתנדב בארגון חברתי', description: 'תרמו מזמנכם ומניסיונכם לקהילה', reason: 'מאפשר לך למצוא משמעות דרך נתינה וקשרים חברתיים', type: 'volunteer', platform: 'Idealist', platformUrl: 'https://www.idealist.org', icon: '❤️' },
  { title: 'מנחה סדנאות קהילתיות', description: 'העבירו ידע וניסיון בפורמט קבוצתי מעשיר', reason: 'משלב בין אינטראקציה אנושית לשיתוף ידע מעשי', type: 'volunteer', platform: 'Points of Light', platformUrl: 'https://engage.pointsoflight.org', icon: '🎓' },
  { title: 'כותב/ת תוכן ובלוגר/ית', description: 'שתפו את התובנות והניסיון שלכם בכתב', reason: 'מאפשר לך לבטא את עצמך בגמישות ובחופש', type: 'freelance', platform: 'Fiverr', platformUrl: 'https://www.fiverr.com', icon: '✍️' },
];

export function getRecommendations(
  viaScores: Record<string, number>,
  scheinScores: Record<string, number>
): Recommendation[] {
  // Get top VIA and Schein
  const topVIA = Object.entries(viaScores).sort(([, a], [, b]) => b - a)[0]?.[0];
  const topSchein = Object.entries(scheinScores).sort(([, a], [, b]) => b - a)[0]?.[0];

  if (!topVIA || !topSchein) return defaultRecommendations;

  const key = `${topVIA}|${topSchein}`;
  const recommendations = recommendationPool[key];

  if (recommendations) return recommendations;

  // Try partial matches - same VIA with any Schein
  for (const [k, recs] of Object.entries(recommendationPool)) {
    if (k.startsWith(topVIA + '|')) return recs;
  }
  // Try same Schein with any VIA
  for (const [k, recs] of Object.entries(recommendationPool)) {
    if (k.endsWith('|' + topSchein)) return recs;
  }

  return defaultRecommendations;
}
