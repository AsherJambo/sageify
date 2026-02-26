
-- Create questionnaire tokens table
CREATE TABLE public.questionnaire_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  username TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create questionnaire responses table
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.questionnaire_tokens(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(token_id)
);

-- Enable RLS
ALTER TABLE public.questionnaire_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Tokens: anyone can read (to validate their token)
CREATE POLICY "Anyone can validate tokens"
  ON public.questionnaire_tokens FOR SELECT
  USING (true);

-- Tokens: anyone can update used status (mark as used)
CREATE POLICY "Anyone can mark token as used"
  ON public.questionnaire_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Responses: anyone can insert (questionnaire taker saves answers)
CREATE POLICY "Anyone can insert responses"
  ON public.questionnaire_responses FOR INSERT
  WITH CHECK (true);

-- Responses: anyone can update their own response (save progress)
CREATE POLICY "Anyone can update responses"
  ON public.questionnaire_responses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Responses: anyone can read (needed for resuming)
CREATE POLICY "Anyone can read responses"
  ON public.questionnaire_responses FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
