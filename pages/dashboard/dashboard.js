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

  let activeCategoryId = null;

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
        
        // Add "All Categories" option
        const allLi = document.createElement('li');
        allLi.className = 'nav-item mb-1';
        allLi.innerHTML = `
          <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === null ? 'active-category' : ''}" href="#" data-id="">
            📁 All Categories
          </a>
        `;
        categoriesList.appendChild(allLi);

        categories.forEach(category => {
          const li = document.createElement('li');
          li.className = 'nav-item mb-1';
          li.innerHTML = `
            <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === category.id ? 'active-category' : ''}" href="#" data-id="${category.id}">
              📁 ${category.name}
            </a>
          `;
          categoriesList.appendChild(li);
        });

        // Add click listeners to category links
        document.querySelectorAll('.category-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active-category'));
            e.currentTarget.classList.add('active-category');
            
            const id = e.currentTarget.getAttribute('data-id');
            activeCategoryId = id ? id : null;
            fetchPrompts();
          });
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

      let query = supabase
        .from('prompts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (activeCategoryId) {
        query = query.eq('category_id', activeCategoryId);
      }

      const { data: prompts, error } = await query;

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
              <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary view-prompt-btn" data-id="${prompt.id}">View Details</button>
                <button class="btn btn-sm btn-outline-danger delete-prompt-btn" data-id="${prompt.id}">Delete</button>
              </div>
            </div>
          `;
          promptsContainer.appendChild(col);
        });

        // Add view details listeners
        document.querySelectorAll('.view-prompt-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const promptId = e.currentTarget.getAttribute('data-id');
            const prompt = prompts.find(p => p.id === promptId);
            if (prompt) {
              openViewPromptModal(prompt);
            }
          });
        });

        // Add delete listeners
        document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this prompt?')) {
              const promptId = e.currentTarget.getAttribute('data-id');
              try {
                const { error } = await supabase.from('prompts').delete().eq('id', promptId);
                if (error) throw error;
                fetchPrompts(); // Refresh list
              } catch (err) {
                console.error('Error deleting prompt:', err.message);
                alert('Failed to delete prompt.');
              }
            }
          });
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

  const addPromptModal = new window.bootstrap.Modal(document.getElementById('addPromptModal'));
  const savePromptBtn = document.getElementById('savePromptBtn');
  const promptTitleInput = document.getElementById('promptTitle');
  const promptTextInput = document.getElementById('promptText');
  const promptResultInput = document.getElementById('promptResult');

  addPromptBtn.addEventListener('click', () => {
    if (!activeCategoryId) {
      alert('Please select a category first to add a prompt.');
      return;
    }
    
    // Clear form
    promptTitleInput.value = '';
    promptTextInput.value = '';
    promptResultInput.value = '';
    
    addPromptModal.show();
  });

  savePromptBtn.addEventListener('click', async () => {
    const title = promptTitleInput.value.trim();
    const text = promptTextInput.value.trim();
    const result = promptResultInput.value.trim();

    if (!title || !text) {
      alert('Please fill in the required fields (Title and Prompt Text).');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('prompts')
        .insert([{ 
          title: title, 
          prompt_text: text, 
          result_text: result,
          category_id: activeCategoryId,
          user_id: user.id 
        }]);

      if (error) throw error;

      addPromptModal.hide();
      fetchPrompts(); // Refresh the list
      
      // Show success message (simple alert for now, could be a toast)
      alert('Prompt saved successfully!');
    } catch (error) {
      console.error('Error creating prompt:', error.message);
      alert('Failed to create prompt: ' + error.message);
    }
  });

  // View/Edit Prompt Functionality
  const viewPromptModal = new window.bootstrap.Modal(document.getElementById('viewPromptModal'));
  const updatePromptBtn = document.getElementById('updatePromptBtn');
  const editPromptIdInput = document.getElementById('editPromptId');
  const editPromptTitleInput = document.getElementById('editPromptTitle');
  const editPromptTextInput = document.getElementById('editPromptText');
  const editPromptResultInput = document.getElementById('editPromptResult');

  function openViewPromptModal(prompt) {
    editPromptIdInput.value = prompt.id;
    editPromptTitleInput.value = prompt.title;
    editPromptTextInput.value = prompt.prompt_text;
    editPromptResultInput.value = prompt.result_text || '';
    
    viewPromptModal.show();
  }

  updatePromptBtn.addEventListener('click', async () => {
    const id = editPromptIdInput.value;
    const title = editPromptTitleInput.value.trim();
    const text = editPromptTextInput.value.trim();
    const result = editPromptResultInput.value.trim();

    if (!title || !text) {
      alert('Please fill in the required fields (Title and Prompt Text).');
      return;
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ 
          title: title, 
          prompt_text: text, 
          result_text: result 
        })
        .eq('id', id);

      if (error) throw error;

      viewPromptModal.hide();
      fetchPrompts(); // Refresh the list
      
      alert('Prompt updated successfully!');
    } catch (error) {
      console.error('Error updating prompt:', error.message);
      alert('Failed to update prompt: ' + error.message);
    }
  });
});
