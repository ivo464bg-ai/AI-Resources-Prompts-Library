import { supabase } from './utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error checking session:', error.message);
    window.location.href = './pages/login/login.html';
    return;
  }

  if (session) {
    // User is logged in
    window.location.href = './pages/home/home.html';
  } else {
    // User is not logged in
    window.location.href = './pages/login/login.html';
  }
});