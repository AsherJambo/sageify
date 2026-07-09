-- Secure questionnaire_responses: remove all public access so response data is no longer readable or modifiable by anonymous users
DROP POLICY IF EXISTS "Anyone can read responses" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Anyone can update responses" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Anyone can insert responses" ON public.questionnaire_responses;