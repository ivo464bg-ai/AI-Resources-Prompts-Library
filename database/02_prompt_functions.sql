-- Add indexes to improve query performance for prompts
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);
