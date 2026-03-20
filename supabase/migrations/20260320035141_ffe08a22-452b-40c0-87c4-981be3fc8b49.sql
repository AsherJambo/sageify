
-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public) VALUES ('org-logos', 'org-logos', true);

-- Allow anyone to view org logos (public bucket)
CREATE POLICY "Public read access for org logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-logos');

-- Allow anyone to upload org logos (admin-only in practice via UI)
CREATE POLICY "Allow upload org logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'org-logos');

-- Allow deletion of org logos
CREATE POLICY "Allow delete org logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'org-logos');
