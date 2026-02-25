-- Performance and RLS policy optimizations
-- Mirror of: supabase/migrations/20260225170000_performance_rls_optimizations.sql

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);

-- profiles
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
CREATE POLICY "Users can select own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING ((select auth.uid()) = id);

-- user_roles
DROP POLICY IF EXISTS "Users can select own role" ON public.user_roles;
CREATE POLICY "Users can select own role"
ON public.user_roles
FOR SELECT
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
CREATE POLICY "Users can update own role"
ON public.user_roles
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own role" ON public.user_roles;
CREATE POLICY "Users can delete own role"
ON public.user_roles
FOR DELETE
USING ((select auth.uid()) = user_id);

-- categories
DROP POLICY IF EXISTS "Users can select own categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
ON public.categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories"
ON public.categories
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories"
ON public.categories
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users or admins can delete categories" ON public.categories;
CREATE POLICY "Users or admins can delete categories"
ON public.categories
FOR DELETE
USING (
  (select auth.uid()) = user_id
  OR public.is_admin((select auth.uid()))
);

-- prompts
DROP POLICY IF EXISTS "Users can select own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Public read prompts" ON public.prompts;
CREATE POLICY "Public read prompts"
ON public.prompts
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert own prompts" ON public.prompts;
CREATE POLICY "Users can insert own prompts"
ON public.prompts
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own prompts" ON public.prompts;
CREATE POLICY "Users can update own prompts"
ON public.prompts
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users or admins can delete prompts" ON public.prompts;
CREATE POLICY "Users or admins can delete prompts"
ON public.prompts
FOR DELETE
USING (
  (select auth.uid()) = user_id
  OR public.is_admin((select auth.uid()))
);
