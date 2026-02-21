import { supabase } from './utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Landing page loaded successfully.');
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is logged in
    document.getElementById('logged-out-view').style.display = 'none';
    document.getElementById('logged-in-view').style.display = 'block';
    
    // Update Navbar
    document.getElementById('nav-dashboard').style.display = 'block';
    document.getElementById('nav-prompts').style.display = 'block';
    document.getElementById('nav-login').style.display = 'none';
    document.getElementById('nav-logout').style.display = 'block';
    
    const userEmailDisplay = document.getElementById('user-email-display');
    userEmailDisplay.textContent = session.user.email;
    document.getElementById('nav-user-email').style.display = 'block';
    
    const navDivider = document.getElementById('nav-divider');
    if (navDivider) {
      navDivider.style.setProperty('display', 'flex', 'important');
    }
    
    // Fetch Stats
    await fetchDashboardStats();
    
    // Setup Search
    setupGlobalSearch();
  } else {
    // User is not logged in
    document.getElementById('logged-out-view').style.display = 'flex';
    document.getElementById('logged-in-view').style.display = 'none';
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.reload();
    });
  }
});

async function fetchDashboardStats() {
  try {
    const { data, error } = await supabase.rpc('get_user_dashboard_stats');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const stats = data[0];
      document.getElementById('stat-categories').textContent = stats.total_categories || 0;
      document.getElementById('stat-prompts').textContent = stats.total_prompts || 0;
      document.getElementById('stat-recent').textContent = stats.recently_added || 0;
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
  }
}

function setupGlobalSearch() {
  const searchForm = document.getElementById('global-search-form');
  const searchInput = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('search-results-container');
  const resultsList = document.getElementById('search-results-list');
  
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (!query) {
      resultsContainer.style.display = 'none';
      return;
    }
    
    try {
      // Escape commas in query to prevent breaking the .or() syntax
      const safeQuery = query.replace(/,/g, ' ');
      
      // Search in title, prompt_text, or result_text
      const { data, error } = await supabase
        .from('prompts')
        .select('id, title, prompt_text, category_id, categories(name)')
        .or(`title.ilike.%${safeQuery}%,prompt_text.ilike.%${safeQuery}%,result_text.ilike.%${safeQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      resultsList.innerHTML = '';
      
      if (data.length === 0) {
        resultsList.innerHTML = '<div class="list-group-item text-muted">No prompts found matching your search.</div>';
      } else {
        data.forEach(prompt => {
          const categoryName = prompt.categories ? prompt.categories.name : 'Uncategorized';
          const item = document.createElement('a');
          item.href = `./pages/prompts/prompts.html?id=${prompt.id}&category=${prompt.category_id}`;
          item.className = 'list-group-item list-group-item-action flex-column align-items-start';
          item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 text-primary">${escapeHTML(prompt.title)}</h5>
              <small class="text-muted"><span class="badge bg-secondary">${escapeHTML(categoryName)}</span></small>
            </div>
            <p class="mb-1 text-truncate">${escapeHTML(prompt.prompt_text || '')}</p>
          `;
          resultsList.appendChild(item);
        });
      }
      
      resultsContainer.style.display = 'block';
    } catch (error) {
      console.error('Error searching prompts:', error.message);
      resultsList.innerHTML = '<div class="list-group-item text-danger">An error occurred while searching.</div>';
      resultsContainer.style.display = 'block';
    }
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
