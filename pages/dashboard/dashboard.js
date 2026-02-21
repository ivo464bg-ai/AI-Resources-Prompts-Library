import { supabase } from '../../utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createCategoryBtn = document.getElementById('createCategoryBtn');
  const addPromptBtn = document.getElementById('addPromptBtn');
  
  const categoriesLoading = document.getElementById('categoriesLoading');
  const categoriesList = document.getElementById('categoriesList');
  const categoriesEmpty = document.getElementById('categoriesEmpty');
  
  const promptsLoading = document.getElementById('promptsLoading');
  const promptsContainer = document.getElementById('promptsContainer');
  const promptsEmpty = document.getElementById('promptsEmpty');

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

  // 2. Logout functionality
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

  // 3. Fetch Categories
  async function fetchCategories() {
    try {
      categoriesLoading.style.display = 'block';
      categoriesList.style.display = 'none';
      categoriesEmpty.style.display = 'none';

      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      categoriesLoading.style.display = 'none';

      if (categories.length === 0) {
        categoriesEmpty.style.display = 'block';
      } else {
        categoriesList.style.display = 'block';
        categoriesList.innerHTML = '';
        categories.forEach(category => {
          const li = document.createElement('li');
          li.className = 'nav-item mb-1';
          li.innerHTML = `
            <a class="nav-link text-dark bg-white border rounded py-2 px-3" href="../prompts/prompts.html?category=${category.id}">
              📁 ${category.name}
            </a>
          `;
          categoriesList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      categoriesLoading.style.display = 'none';
      categoriesEmpty.style.display = 'block';
      categoriesEmpty.innerHTML = '<small class="text-danger">Failed to load categories.</small>';
    }
  }

  // 4. Fetch Prompts
  async function fetchPrompts() {
    try {
      promptsLoading.style.display = 'block';
      promptsContainer.style.display = 'none';
      promptsEmpty.style.display = 'none';

      const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      promptsLoading.style.display = 'none';

      if (prompts.length === 0) {
        promptsEmpty.style.display = 'block';
      } else {
        promptsContainer.style.display = 'flex';
        promptsContainer.innerHTML = '';
        prompts.forEach(prompt => {
          const categoryName = prompt.categories?.name || 'Uncategorized';
          const col = document.createElement('div');
          col.className = 'col';
          col.innerHTML = `
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">${prompt.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">📁 ${categoryName}</h6>
                <p class="card-text text-truncate">${prompt.prompt_text}</p>
              </div>
              <div class="card-footer bg-transparent border-top-0">
                <button class="btn btn-sm btn-outline-primary">View Details</button>
              </div>
            </div>
          `;
          promptsContainer.appendChild(col);
        });
      }
    } catch (error) {
      console.error('Error fetching prompts:', error.message);
      promptsLoading.style.display = 'none';
      promptsEmpty.style.display = 'block';
      promptsEmpty.innerHTML = '<h5 class="text-danger">Failed to load prompts.</h5>';
    }
  }

  // Initialize fetches
  fetchCategories();
  fetchPrompts();

  // Create Category Functionality
  const createCategoryModal = new window.bootstrap.Modal(document.getElementById('createCategoryModal'));
  const saveCategoryBtn = document.getElementById('saveCategoryBtn');
  const categoryNameInput = document.getElementById('categoryName');

  createCategoryBtn.addEventListener('click', () => {
    categoryNameInput.value = '';
    createCategoryModal.show();
  });

  saveCategoryBtn.addEventListener('click', async () => {
    const name = categoryNameInput.value.trim();
    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('categories')
        .insert([{ name: name, user_id: user.id }]);

      if (error) throw error;

      createCategoryModal.hide();
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error creating category:', error.message);
      alert('Failed to create category: ' + error.message);
    }
  });

  addPromptBtn.addEventListener('click', () => {
    alert('Add New Prompt functionality to be implemented.');
  });
});
