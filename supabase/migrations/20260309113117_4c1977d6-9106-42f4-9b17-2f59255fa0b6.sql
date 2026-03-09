
ALTER TABLE public.global_retiree_insights
ADD COLUMN IF NOT EXISTS profession_category text DEFAULT '';
