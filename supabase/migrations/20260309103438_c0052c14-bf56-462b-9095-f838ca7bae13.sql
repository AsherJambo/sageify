
CREATE TABLE public.global_retiree_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES public.questionnaire_tokens(id) ON DELETE CASCADE,
  activity_suggested text NOT NULL DEFAULT '',
  motivation_logic text NOT NULL DEFAULT '',
  user_persona text NOT NULL DEFAULT '',
  constraints text NOT NULL DEFAULT '',
  via_top jsonb NOT NULL DEFAULT '[]'::jsonb,
  schein_top jsonb NOT NULL DEFAULT '[]'::jsonb,
  holland_top jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  skills_winner jsonb NOT NULL DEFAULT '[]'::jsonb,
  dream text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token_id)
);

ALTER TABLE public.global_retiree_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert insights" ON public.global_retiree_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read insights" ON public.global_retiree_insights
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update insights" ON public.global_retiree_insights
  FOR UPDATE USING (true) WITH CHECK (true);
