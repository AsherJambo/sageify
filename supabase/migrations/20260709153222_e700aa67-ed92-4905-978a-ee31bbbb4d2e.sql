-- Secure questionnaire_tokens: remove all public access so token data is no longer readable or modifiable by anonymous users
DROP POLICY IF EXISTS "Anyone can validate tokens" ON public.questionnaire_tokens;
DROP POLICY IF EXISTS "Anyone can mark token as used" ON public.questionnaire_tokens;
DROP POLICY IF EXISTS "Anyone can insert tokens" ON public.questionnaire_tokens;