import { supabase } from '../../utils/supabaseClient.js';

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    // Fetch total categories
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (categoriesError) throw categoriesError;

    // Fetch total prompts
    const { count: promptsCount, error: promptsError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (promptsError) throw promptsError;

    // Fetch recently added prompts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentCount, error: recentError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());
      
    if (recentError) throw recentError;

    document.getElementById('stat-categories').textContent = categoriesCount || 0;
    document.getElementById('stat-prompts').textContent = promptsCount || 0;
    document.getElementById('stat-recent').textContent = recentCount || 0;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
  }
}

function setupGlobalSearch() {
  const searchForm = document.getElementById('global-search-form');
  const searchInput = document.getElementById('global-search-input');
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
      window.location.href = `../prompts/prompts.html?search=${encodeURIComponent(query)}`;
    }
  });
}
