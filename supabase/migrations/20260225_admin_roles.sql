-- Admin roles and moderation access
-- Safe/idempotent migration: can be re-run without destructive side effects.

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles
    ALTER COLUMN role TYPE TEXT,
    ALTER COLUMN role SET DEFAULT 'user';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_roles_role_check'
          AND conrelid = 'public.user_roles'::regclass
    ) THEN
        ALTER TABLE public.user_roles
            ADD CONSTRAINT user_roles_role_check
            CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

DROP POLICY IF EXISTS "Users can select own role" ON public.user_roles;
CREATE POLICY "Users can select own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
CREATE POLICY "Users can update own role"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own role" ON public.user_roles;
CREATE POLICY "Users can delete own role"
ON public.user_roles
FOR DELETE
USING (auth.uid() = user_id);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE LOWER(email) = LOWER('test1@abv.bg')
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = COALESCE(check_user_id, auth.uid())
          AND ur.role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can delete own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users or admins can delete prompts" ON public.prompts;
CREATE POLICY "Users or admins can delete prompts"
ON public.prompts
FOR DELETE
USING (
    auth.uid() = user_id
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Users or admins can delete categories" ON public.categories;
CREATE POLICY "Users or admins can delete categories"
ON public.categories
FOR DELETE
USING (
    auth.uid() = user_id
    OR public.is_admin()
);

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_prompts BIGINT,
    total_categories BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users),
        (SELECT COUNT(*) FROM public.prompts),
        (SELECT COUNT(*) FROM public.categories);
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_prompts()
RETURNS TABLE (
    id UUID,
    title TEXT,
    prompt_text TEXT,
    category_id UUID,
    category_name TEXT,
    user_id UUID,
    author_email TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.prompt_text,
        p.category_id,
        c.name AS category_name,
        p.user_id,
        u.email::TEXT AS author_email,
        p.file_url,
        p.created_at
    FROM public.prompts p
    LEFT JOIN public.categories c ON c.id = p.category_id
    LEFT JOIN auth.users u ON u.id = p.user_id
    ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_prompts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_prompts() TO authenticated;
