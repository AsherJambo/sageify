-- Secure organizations: remove all public access to organization rows and credentials
DROP POLICY IF EXISTS "Anyone can read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can delete organizations" ON public.organizations;