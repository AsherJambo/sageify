-- Secure contact_submissions: remove public read access while keeping public submission insertion
DROP POLICY IF EXISTS "Anyone can read contact submissions" ON public.contact_submissions;