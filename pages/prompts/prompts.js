import { supabase } from '../../utils/supabaseClient.js';

// Prompts Page Specific Logic
document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createPromptBtn = document.getElementById('createPromptBtn');
  const searchInput = document.getElementById('searchPrompts');

  // 1. Check if user is logged in
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    // Redirect to login if not authenticated
    window.location.href = '../login/login.html';
    return;
  }

  // Display user email
  const userEmailSpan = document.getElementById('user-email');
  if (userEmailSpan) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      window.location.href = '../login/login.html';
      return;
    }
    if (user.email) {
      userEmailSpan.textContent = user.email;
    }
  }

  // Parse URL parameters to get category if any
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category) {
    document.getElementById('categoryTitle').textContent = `Prompts: ${category}`;
  }

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      alert('Failed to log out.');
    } else {
      window.location.href = '../../index.html';
    }
  });

  createPromptBtn.addEventListener('click', () => {
    console.log('Create Prompt clicked');
    // TODO: Implement create prompt modal/logic
    alert('Create Prompt functionality to be implemented.');
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    // TODO: Implement search filtering logic
  });

  // TODO: Fetch prompts from Supabase and render them dynamically
});
