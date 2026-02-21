-- database/03_dashboard_stats_view.sql

-- Create a function to get dashboard stats for the authenticated user
CREATE OR REPLACE FUNCTION get_user_dashboard_stats()
RETURNS TABLE (
    total_categories BIGINT,
    total_prompts BIGINT,
    recently_added BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the authenticated user's ID
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM categories WHERE user_id = v_user_id) AS total_categories,
        (SELECT COUNT(*) FROM prompts WHERE user_id = v_user_id) AS total_prompts,
        (SELECT COUNT(*) FROM prompts WHERE user_id = v_user_id AND created_at >= NOW() - INTERVAL '7 days') AS recently_added;
END;
$$;
