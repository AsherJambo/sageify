-- Secure cocktail_sessions: remove public read access while keeping anonymous submission insertion
DROP POLICY IF EXISTS "Anyone can read cocktail sessions" ON public.cocktail_sessions;

-- Secure employer_feedback: remove public read/delete access while keeping anonymous submission insertion
DROP POLICY IF EXISTS "Anyone can read employer feedback" ON public.employer_feedback;
DROP POLICY IF EXISTS "Anyone can delete employer feedback" ON public.employer_feedback;