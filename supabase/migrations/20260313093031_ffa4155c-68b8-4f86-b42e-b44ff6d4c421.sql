
CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL,
  interaction_type text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  target_title text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert interactions"
ON public.user_interactions FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read interactions"
ON public.user_interactions FOR SELECT TO public
USING (true);
