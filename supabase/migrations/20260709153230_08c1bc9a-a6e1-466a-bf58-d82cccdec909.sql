-- Secure user_profiles: remove all public access so psychometric and personal profile data is no longer readable or modifiable by anonymous users
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.user_profiles;