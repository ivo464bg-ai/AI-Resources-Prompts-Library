import { supabase } from './supabaseClient.js';

export async function getUserRole(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.role || null;
}

export async function isAdminUser(userId) {
  const role = await getUserRole(userId);
  return role === 'admin';
}
