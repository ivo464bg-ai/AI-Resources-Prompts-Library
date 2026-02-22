-- Add file_url column to prompts table
ALTER TABLE public.prompts ADD COLUMN file_url TEXT;

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('prompt-attachments', 'prompt-attachments', false);

-- Set up RLS for the storage bucket
-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'prompt-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'prompt-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'prompt-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'prompt-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
