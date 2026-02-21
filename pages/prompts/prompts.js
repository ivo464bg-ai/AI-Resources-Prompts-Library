// Prompts Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createPromptBtn = document.getElementById('createPromptBtn');
  const searchInput = document.getElementById('searchPrompts');

  // Parse URL parameters to get category if any
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category) {
    document.getElementById('categoryTitle').textContent = `Prompts: ${category}`;
  }

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Logout clicked');
    // TODO: Implement Supabase Auth logout
    window.location.href = '../../index.html';
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
