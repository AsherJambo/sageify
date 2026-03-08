CREATE TABLE public.activity_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES public.questionnaire_tokens(id) ON DELETE CASCADE,
  activity_type text NOT NULL DEFAULT 'other',
  activity_name text NOT NULL,
  organization text,
  category text,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  psychological_drivers jsonb DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'ai-advisor',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity choices" ON public.activity_choices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read activity choices" ON public.activity_choices FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_choices;