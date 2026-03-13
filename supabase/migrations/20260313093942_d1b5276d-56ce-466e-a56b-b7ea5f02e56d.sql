
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL UNIQUE,
  psychometric_scores jsonb DEFAULT '{}'::jsonb,
  career_history text DEFAULT '',
  primary_interests jsonb DEFAULT '[]'::jsonb,
  personality_sliders jsonb DEFAULT '{}'::jsonb,
  value_alignment jsonb DEFAULT '[]'::jsonb,
  archetype text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert profiles"
ON public.user_profiles FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read profiles"
ON public.user_profiles FOR SELECT TO public
USING (true);

CREATE POLICY "Anyone can update profiles"
ON public.user_profiles FOR UPDATE TO public
USING (true)
WITH CHECK (true);
