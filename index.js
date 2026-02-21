import { supabase } from './utils/supabaseClient.js';

// Landing Page Specific Logic
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Landing page loaded successfully.');
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = './pages/dashboard/dashboard.html';
  }
});
