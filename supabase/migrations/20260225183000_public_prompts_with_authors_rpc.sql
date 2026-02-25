-- Public prompt listing with author email for Home page cards.
-- Exposes only prompt fields needed by UI plus author email from auth.users.

create or replace function public.get_public_prompts_with_authors(p_category_id uuid default null)
returns table (
  id uuid,
  title text,
  prompt_text text,
  result_text text,
  file_url text,
  user_id uuid,
  created_at timestamptz,
  category_id uuid,
  category_name text,
  author_email text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    p.id,
    p.title,
    p.prompt_text,
    p.result_text,
    p.file_url,
    p.user_id,
    p.created_at,
    p.category_id,
    c.name as category_name,
    u.email as author_email
  from public.prompts p
  left join public.categories c on c.id = p.category_id
  left join auth.users u on u.id = p.user_id
  where p_category_id is null or p.category_id = p_category_id
  order by p.created_at desc;
$$;

revoke all on function public.get_public_prompts_with_authors(uuid) from public;
grant execute on function public.get_public_prompts_with_authors(uuid) to anon, authenticated;
