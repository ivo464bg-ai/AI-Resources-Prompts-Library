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
