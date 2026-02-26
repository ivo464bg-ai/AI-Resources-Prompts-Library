import { supabase } from './utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error checking session:', error.message);
    window.location.href = './pages/home/home.html';
    return;
  }

  if (session) {
    window.location.href = './pages/dashboard/dashboard.html';
  } else {
    window.location.href = './pages/home/home.html';
  }
});