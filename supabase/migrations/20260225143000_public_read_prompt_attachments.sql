-- Allow anon/public users to read prompt attachments used in public Home showcase
-- Keep upload/update/delete owner-restricted policies unchanged.

DROP POLICY IF EXISTS "Public read prompt attachments" ON storage.objects;
CREATE POLICY "Public read prompt attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prompt-attachments');
