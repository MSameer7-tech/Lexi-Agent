-- Create the pronunciations storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pronunciations', 'pronunciations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pronunciations');

-- Allow service role to manage the bucket
CREATE POLICY "Service Role Access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'pronunciations')
WITH CHECK (bucket_id = 'pronunciations');
