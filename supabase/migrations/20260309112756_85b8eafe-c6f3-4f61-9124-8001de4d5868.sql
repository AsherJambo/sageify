
ALTER TABLE public.global_retiree_insights
ADD COLUMN IF NOT EXISTS scarcity_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS motivation_tag text DEFAULT '',
ADD COLUMN IF NOT EXISTS gap_detected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS market_unmet_need text DEFAULT '';
