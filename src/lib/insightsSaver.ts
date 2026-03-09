import { cloudClient } from '@/lib/cloudClient';
import { getTopCategories } from '@/lib/scoring';
import { skills, type SkillColumn } from '@/data/skillsData';

interface InsightsInput {
  tokenId: string;
  viaScores: Record<string, number>;
  scheinScores: Record<string, number>;
  hollandScores?: Record<string, number>;
  considerationsData?: { selected: string[]; points: Record<string, number> };
  skillsAssignments?: Record<number, SkillColumn>;
  preferencesData?: { preferences: Record<string, string[]>; dream: string };
  chatMessages?: { role: string; content: string }[];
}

function derivePersona(topVIA: string, topSchein: string): string {
  const map: Record<string, string> = {
    'אנושיות|שליחות': 'המנטור',
    'אנושיות|שירות': 'המנטור',
    'צדק|שליחות': 'המנטור',
    'חוכמה|יזמות': 'החוקר היזמי',
    'חוכמה|טכני': 'החוקר היזמי',
    'חוכמה|ניהולי': 'המומחה האסטרטגי',
    'אומץ|אתגר': 'החלוצ/ה',
    'אומץ|יזמות': 'החלוצ/ה',
    'אומץ|עצמאות': 'החלוצ/ה',
    'מתינות|ביטחון': 'היציב/ה',
    'מתינות|איזון': 'היציב/ה',
    'רוחניות|שליחות': 'בעל/ת המשמעות',
    'רוחניות|אורח חיים': 'בעל/ת המשמעות',
    'צדק|ניהולי': 'המנהיג/ה',
  };
  const key = `${topVIA}|${topSchein}`;
  return map[key] || 'הסייר/ת הפעיל/ה';
}

function extractActivityFromChat(messages?: { role: string; content: string }[]): string {
  if (!messages?.length) return '';
  const assistantMessages = messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n');
  
  const roadmapMatch = assistantMessages.match(/Sage Action Roadmap|תכנית פעולה/);
  if (roadmapMatch) {
    const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistant) {
      const lines = lastAssistant.content.split('\n').filter(l => l.match(/^\d+\.|^[-•]/)).slice(0, 3);
      if (lines.length > 0) return lines.join('; ');
    }
  }
  
  const activityMatch = assistantMessages.match(/\[ACTIVITY_CHOICE\]([\s\S]*?)\[\/ACTIVITY_CHOICE\]/);
  if (activityMatch) return activityMatch[1].trim().substring(0, 300);
  
  return '';
}

function extractConstraints(
  considerationsData?: { selected: string[]; points: Record<string, number> },
  preferencesData?: { preferences: Record<string, string[]>; dream: string }
): string {
  const parts: string[] = [];
  if (considerationsData?.selected) {
    parts.push(...considerationsData.selected.slice(0, 4));
  }
  if (preferencesData?.preferences) {
    Object.entries(preferencesData.preferences).forEach(([, vals]) => {
      parts.push(...vals.slice(0, 2));
    });
  }
  return parts.slice(0, 6).join(', ');
}

function deriveMotivationTag(topVIA: string, topSchein: string): string {
  const map: Record<string, string> = {
    'אנושיות': 'Social_Connection',
    'צדק': 'Legacy',
    'חוכמה': 'Cognitive_Sharpness',
    'אומץ': 'Vitality',
    'מתינות': 'Financial_Yield',
    'רוחניות': 'Legacy',
  };
  const scheinMap: Record<string, string> = {
    'יזמות': 'Financial_Yield',
    'ניהולי': 'Status',
    'שליחות': 'Legacy',
    'שירות': 'Social_Connection',
    'טכני': 'Cognitive_Sharpness',
    'אתגר': 'Vitality',
    'עצמאות': 'Financial_Yield',
    'ביטחון': 'Financial_Yield',
    'איזון': 'Social_Connection',
    'אורח חיים': 'Vitality',
  };
  return scheinMap[topSchein] || map[topVIA] || 'Social_Connection';
}

/** Derive a broad profession category from winner skills */
export function deriveProfessionCategory(winnerSkills: string[]): string {
  const skillText = winnerSkills.join(' ').toLowerCase();

  const categories: { category: string; keywords: string[] }[] = [
    { category: 'הייטק', keywords: ['טכנולוגי', 'תוכנה', 'מחשב', 'דיגיטל', 'נתונים', 'אלגוריתם', 'פיתוח'] },
    { category: 'ניהול', keywords: ['ניהול', 'מנהיג', 'אסטרטג', 'תכנון', 'ארגון', 'צוות'] },
    { category: 'חינוך', keywords: ['הדרכה', 'הוראה', 'חינוך', 'הנחיה', 'למידה', 'הרצאה'] },
    { category: 'בריאות', keywords: ['רפוא', 'בריאות', 'טיפול', 'שיקום', 'סיעוד'] },
    { category: 'פיננסים', keywords: ['כספי', 'פיננס', 'חשבונ', 'כלכל', 'תקציב'] },
    { category: 'משפט', keywords: ['משפט', 'חוק', 'רגולצי'] },
    { category: 'יצירה', keywords: ['יצירתי', 'עיצוב', 'כתיב', 'אמנות', 'תקשורת'] },
    { category: 'שירות חברתי', keywords: ['שירות', 'קהילה', 'חברת', 'סוציאל', 'רווחה'] },
    { category: 'מכירות ושיווק', keywords: ['מכיר', 'שיווק', 'פרסום', 'לקוח'] },
    { category: 'הנדסה', keywords: ['הנדס', 'תשתית', 'בנייה', 'ייצור'] },
  ];

  for (const { category, keywords } of categories) {
    if (keywords.some(kw => skillText.includes(kw))) return category;
  }
  return 'כללי';
}

export async function silentSaveInsights(input: InsightsInput): Promise<void> {
  try {
    const topVIA = getTopCategories(input.viaScores, 3);
    const topSchein = getTopCategories(input.scheinScores, 3);
    const topHolland = input.hollandScores
      ? Object.entries(input.hollandScores).sort(([, a], [, b]) => b - a).slice(0, 3).map(([c]) => c)
      : [];

    const winnerSkills = input.skillsAssignments
      ? Object.entries(input.skillsAssignments)
          .filter(([, col]) => col === 'winner')
          .map(([id]) => skills.find(s => s.id === Number(id))?.text)
          .filter(Boolean) as string[]
      : [];

    const persona = derivePersona(topVIA[0]?.category || '', topSchein[0]?.category || '');
    const activity = extractActivityFromChat(input.chatMessages);
    const motivationParts = [
      ...topVIA.map(t => t.category),
      ...topSchein.map(t => t.category),
    ];
    const motivationLogic = `המשתמש מונע ע"י: ${motivationParts.join(', ')}. חלום: ${input.preferencesData?.dream || 'לא צוין'}.`;
    const constraints = extractConstraints(input.considerationsData, input.preferencesData);
    const motivationTag = deriveMotivationTag(topVIA[0]?.category || '', topSchein[0]?.category || '');
    const professionCategory = deriveProfessionCategory(winnerSkills);

    await cloudClient.from('global_retiree_insights').upsert({
      token_id: input.tokenId,
      activity_suggested: activity || 'ממתין לנתוני יועץ',
      motivation_logic: motivationLogic,
      user_persona: persona,
      constraints: constraints || 'ללא מגבלות מיוחדות',
      via_top: topVIA.map(t => ({ category: t.category, score: t.score })),
      schein_top: topSchein.map(t => ({ category: t.category, score: t.score })),
      holland_top: topHolland,
      preferences: input.preferencesData?.preferences || {},
      skills_winner: winnerSkills,
      dream: input.preferencesData?.dream || '',
      motivation_tag: motivationTag,
      scarcity_score: 0,
      gap_detected: false,
      market_unmet_need: '',
      profession_category: professionCategory,
    }, { onConflict: 'token_id' });
  } catch (e) {
    console.warn('[Insights] Silent save failed:', e);
  }
}
