
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  logo_url TEXT,
  admin_email TEXT NOT NULL,
  admin_password TEXT NOT NULL DEFAULT 'changeme',
  custom_welcome_message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to questionnaire_tokens
ALTER TABLE public.questionnaire_tokens
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create employer feedback table
CREATE TABLE public.employer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'ui_suggestion',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_feedback ENABLE ROW LEVEL SECURITY;

-- Organizations: read by anyone (for partner branding), managed via admin edge function
CREATE POLICY "Anyone can read organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update organizations" ON public.organizations FOR UPDATE USING (true) WITH CHECK (true);

-- Employer feedback: insert and read
CREATE POLICY "Anyone can insert employer feedback" ON public.employer_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read employer feedback" ON public.employer_feedback FOR SELECT USING (true);

-- Trigger for updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
