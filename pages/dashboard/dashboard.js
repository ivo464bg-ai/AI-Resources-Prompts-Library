// Dashboard Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createCategoryBtn = document.getElementById('createCategoryBtn');

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Logout clicked');
    // TODO: Implement Supabase Auth logout
    window.location.href = '../../index.html';
  });

  createCategoryBtn.addEventListener('click', () => {
    console.log('Create Category clicked');
    // TODO: Implement create category modal/logic
    alert('Create Category functionality to be implemented.');
  });

  // TODO: Fetch categories from Supabase and render them dynamically
});
