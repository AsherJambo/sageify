CREATE POLICY "Anyone can insert tokens"
ON public.questionnaire_tokens FOR INSERT
TO public
WITH CHECK (true);