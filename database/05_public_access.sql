-- Public Showcase access
-- Allow everyone (including anon users) to read categories and prompts.
-- INSERT/UPDATE/DELETE policies remain unchanged and still rely on user ownership checks.

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
ON public.categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public read prompts" ON public.prompts;
CREATE POLICY "Public read prompts"
ON public.prompts
FOR SELECT
USING (true);
