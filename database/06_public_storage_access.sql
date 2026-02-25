-- Public Showcase storage access
-- Allow everyone (including anon users) to read prompt attachments in Home page cards.
-- Write/update/delete access remains owner-scoped from previous storage policies.

DROP POLICY IF EXISTS "Public read prompt attachments" ON storage.objects;
CREATE POLICY "Public read prompt attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prompt-attachments');
