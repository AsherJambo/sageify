
CREATE TABLE public.cocktail_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  bottles_chosen jsonb NOT NULL DEFAULT '[]'::jsonb,
  riasec_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_code text NOT NULL DEFAULT '',
  character_title text NOT NULL DEFAULT '',
  recommended_track text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.cocktail_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cocktail_sessions TO authenticated;
GRANT ALL ON public.cocktail_sessions TO service_role;

ALTER TABLE public.cocktail_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert cocktail sessions" ON public.cocktail_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read cocktail sessions" ON public.cocktail_sessions FOR SELECT TO anon, authenticated USING (true);
