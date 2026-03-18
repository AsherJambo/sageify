
CREATE POLICY "Anyone can delete organizations" ON public.organizations FOR DELETE USING (true);
CREATE POLICY "Anyone can delete employer feedback" ON public.employer_feedback FOR DELETE USING (true);
