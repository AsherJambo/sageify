DROP POLICY IF EXISTS "Anyone can read interactions" ON public.user_interactions;
REVOKE SELECT ON public.user_interactions FROM anon, authenticated;
GRANT INSERT ON public.user_interactions TO anon, authenticated;
GRANT ALL ON public.user_interactions TO service_role;

CREATE TABLE public.health_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  note text,
  source text NOT NULL DEFAULT 'health-landing',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.health_leads TO anon, authenticated;
GRANT ALL ON public.health_leads TO service_role;

ALTER TABLE public.health_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit health leads"
ON public.health_leads FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 100
  AND length(trim(phone)) BETWEEN 6 AND 25
  AND length(trim(email)) BETWEEN 5 AND 255
  AND (note IS NULL OR length(note) <= 1000)
);