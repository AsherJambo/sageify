-- Secure global_retiree_insights: remove public read/update access while keeping public insertion
DROP POLICY IF EXISTS "Anyone can read insights" ON public.global_retiree_insights;
DROP POLICY IF EXISTS "Anyone can update insights" ON public.global_retiree_insights;