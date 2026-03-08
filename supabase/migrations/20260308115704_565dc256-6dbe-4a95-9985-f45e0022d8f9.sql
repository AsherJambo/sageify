
-- Opportunities table: master list of activities for matching
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('work', 'volunteer', 'course', 'freelance')),
  link text NOT NULL DEFAULT '',
  logo_url text,
  location text,
  target_traits jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read opportunities" ON public.opportunities
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role can manage opportunities" ON public.opportunities
  FOR ALL USING (true) WITH CHECK (true);

-- User feedback table: track recommendation accuracy
CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES public.questionnaire_tokens(id) ON DELETE CASCADE NOT NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  feedback text NOT NULL CHECK (feedback IN ('accurate', 'interesting', 'not_relevant')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token_id, opportunity_id)
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read feedback" ON public.user_feedback
  FOR SELECT USING (true);

-- Trigger for opportunities updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 10 diverse Israeli opportunities
INSERT INTO public.opportunities (title, organization_name, description, category, link, location, target_traits) VALUES
  ('מנטור כלכלי למשפחות', 'פעמונים', 'ליווי משפחות בתהליך שיקום כלכלי – ייעוץ תקציבי, הכוונה פיננסית וחיזוק כלכלי', 'volunteer', 'https://www.paamonim.org', 'ארצי', '{"via_top": "אנושיות", "schein_top": "שליחות", "holland": ["S","E"], "social": 0.9, "analytical": 0.5}'::jsonb),
  
  ('מדריך/ה בסה"ר – תוכנית לנוער', 'סה"ר – סיוע והכוונה לריפוי', 'הדרכה וליווי בני נוער המתמודדים עם בעיות נפשיות, בניית חוסן וכלים להתמודדות', 'volunteer', 'https://www.sahar.org.il', 'מקוון', '{"via_top": "אנושיות", "schein_top": "שליחות", "holland": ["S","A"], "social": 1.0, "analytical": 0.2}'::jsonb),
  
  ('יועץ/ת ניהולי לעמותות', 'שכל - מובילים שינוי', 'ייעוץ אסטרטגי וניהולי לעמותות קטנות ובינוניות, שיפור תהליכים ובניית תוכניות עבודה', 'freelance', 'https://www.sehel.org.il', 'ארצי', '{"via_top": "חכמה וידע", "schein_top": "ניהול", "holland": ["E","C"], "social": 0.5, "analytical": 0.8}'::jsonb),
  
  ('חבר/ת דירקטוריון', 'מנהיגות אזרחית', 'חברות בדירקטוריון עמותות – השפעה אסטרטגית, פיקוח ובקרה, קבלת החלטות', 'volunteer', 'https://www.leadersil.org', 'ארצי', '{"via_top": "חוש צדק", "schein_top": "ניהול", "holland": ["E","S"], "social": 0.6, "analytical": 0.7}'::jsonb),
  
  ('מורה/מרצה באוניברסיטה הפתוחה', 'האוניברסיטה הפתוחה', 'הוראה אקדמית במגוון תחומים – הנגשת ידע לסטודנטים מכל הארץ', 'work', 'https://www.openu.ac.il/dean-students/job', 'מקוון + פיזי', '{"via_top": "חכמה וידע", "schein_top": "מומחיות", "holland": ["I","S"], "social": 0.6, "analytical": 0.9}'::jsonb),
  
  ('מנחה קבוצות גמלאים', 'עמותת אשל', 'הנחיית מפגשים קבוצתיים לגמלאים – העצמה, פעילות חברתית ושימור קוגניטיבי', 'volunteer', 'https://www.eshelnet.org.il', 'ארצי', '{"via_top": "מיקוד בטוב/נשגבות", "schein_top": "סגנון חיים", "holland": ["S","A"], "social": 0.9, "analytical": 0.3}'::jsonb),
  
  ('מגשר/ת קהילתי', 'מרכז הגישור והדיאלוג', 'גישור בין שכנים, משפחות וארגונים – פתרון סכסוכים בדרכי שלום', 'freelance', 'https://www.gishur.org.il', 'ארצי', '{"via_top": "חוש צדק", "schein_top": "אוטונומיה", "holland": ["S","E"], "social": 0.8, "analytical": 0.6}'::jsonb),
  
  ('מתנדב/ת בקו הקשר של ער"ן', 'ער"ן – עזרה ראשונה נפשית', 'מענה טלפוני ומקוון לאנשים במצוקה נפשית, הקשבה ותמיכה רגשית', 'volunteer', 'https://www.eran.org.il', 'מקוון', '{"via_top": "אנושיות", "schein_top": "שליחות", "holland": ["S"], "social": 1.0, "analytical": 0.1}'::jsonb),
  
  ('יועץ/ת עסקי לעסקים קטנים', 'MATI – מרכז תמיכה עסקי', 'ייעוץ עסקי ליזמים ובעלי עסקים קטנים – תוכנית עסקית, שיווק ומימון', 'freelance', 'https://www.mati.org.il', 'ארצי', '{"via_top": "חכמה וידע", "schein_top": "יצירתיות יזמית", "holland": ["E","I"], "social": 0.4, "analytical": 0.8}'::jsonb),
  
  ('מתכנת/ת קורס דיגיטלי', 'Campus IL', 'פיתוח קורסים מקוונים חינמיים בנושאי טכנולוגיה, עסקים ומיומנויות רכות', 'freelance', 'https://campus.gov.il', 'מקוון', '{"via_top": "חכמה וידע", "schein_top": "מומחיות", "holland": ["I","A"], "social": 0.3, "analytical": 0.9}'::jsonb);
