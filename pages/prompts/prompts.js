import { supabase } from '../../utils/supabaseClient.js';

// Prompts Page Specific Logic
document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createPromptBtn = document.getElementById('createPromptBtn');
  const searchInput = document.getElementById('searchPrompts');
  
  const promptsLoading = document.getElementById('promptsLoading');
  const promptsContainer = document.getElementById('promptsContainer');
  const promptsEmpty = document.getElementById('promptsEmpty');
  const categoryTitle = document.getElementById('categoryTitle');

  // 1. Check if user is logged in
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    // Redirect to login if not authenticated
    window.location.href = '../login/login.html';
    return;
  }

  // Display user email
  const userEmailSpan = document.getElementById('user-email');
  let currentUser = null;
  if (userEmailSpan) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      window.location.href = '../login/login.html';
      return;
    }
    currentUser = user;
    if (user.email) {
      userEmailSpan.textContent = user.email;
    }
  }

  // Parse URL parameters to get category if any
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');
  const searchQuery = urlParams.get('search');
  
  let allPrompts = [];

  // Fetch Categories for the select dropdown
  async function fetchCategoriesForSelect() {
    const select = document.getElementById('promptCategorySelect');
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        if (categoryId && cat.id === categoryId) {
          option.selected = true;
          categoryTitle.textContent = `Prompts: ${cat.name}`;
        }
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  }

  // Fetch Prompts
  async function fetchPrompts() {
    try {
      promptsLoading.style.display = 'block';
      promptsContainer.style.display = 'none';
      promptsEmpty.style.display = 'none';

      let query = supabase
        .from('prompts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: prompts, error } = await query;

      if (error) throw error;

      allPrompts = prompts;
      
      if (searchQuery) {
        searchInput.value = searchQuery;
        const searchTerm = searchQuery.toLowerCase();
        const filteredPrompts = allPrompts.filter(prompt => 
          prompt.title.toLowerCase().includes(searchTerm) || 
          prompt.prompt_text.toLowerCase().includes(searchTerm) ||
          (prompt.result_text && prompt.result_text.toLowerCase().includes(searchTerm))
        );
        renderPrompts(filteredPrompts);
      } else {
        renderPrompts(allPrompts);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error.message);
      promptsLoading.style.display = 'none';
      promptsEmpty.style.display = 'block';
      promptsEmpty.innerHTML = '<h5 class="text-danger">Failed to load prompts.</h5>';
    }
  }

  function renderPrompts(promptsToRender) {
    promptsLoading.style.display = 'none';

    if (promptsToRender.length === 0) {
      promptsContainer.style.display = 'none';
      promptsEmpty.style.display = 'block';
    } else {
      promptsEmpty.style.display = 'none';
      promptsContainer.style.display = 'flex';
      promptsContainer.innerHTML = '';
      
      promptsToRender.forEach(prompt => {
        const categoryName = prompt.categories?.name || 'Uncategorized';
        const col = document.createElement('div');
        col.className = 'col-12 mb-4';
        col.innerHTML = `
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">${prompt.title}</h5>
              </div>
              <p class="card-text text-muted small">Category: ${categoryName}</p>
              <div class="mb-3">
                <strong>Prompt:</strong>
                <p class="bg-light p-2 rounded border" style="white-space: pre-wrap;">${prompt.prompt_text}</p>
              </div>
              ${prompt.result_text ? `
              <div class="mb-3">
                <strong>Result:</strong>
                <div class="bg-light p-2 rounded border" style="white-space: pre-wrap;">${prompt.result_text}</div>
              </div>
              ` : ''}
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm view-prompt-btn" data-id="${prompt.id}">View Details</button>
                <button class="btn btn-outline-danger btn-sm delete-prompt-btn" data-id="${prompt.id}">Delete</button>
              </div>
            </div>
          </div>
        `;
        promptsContainer.appendChild(col);
      });

      // Add view details listeners
      document.querySelectorAll('.view-prompt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const promptId = e.currentTarget.getAttribute('data-id');
          const prompt = promptsToRender.find(p => p.id === promptId);
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
  }

  // Initialize
  fetchCategoriesForSelect();
  fetchPrompts();

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

  // Add Prompt Modal Logic
  const addPromptModal = new window.bootstrap.Modal(document.getElementById('addPromptModal'));
  const savePromptBtn = document.getElementById('savePromptBtn');
  const promptCategorySelect = document.getElementById('promptCategorySelect');
  const promptTitleInput = document.getElementById('promptTitle');
  const promptTextInput = document.getElementById('promptText');
  const promptResultInput = document.getElementById('promptResult');

  createPromptBtn.addEventListener('click', () => {
    // Clear form
    promptTitleInput.value = '';
    promptTextInput.value = '';
    promptResultInput.value = '';
    
    if (categoryId) {
      promptCategorySelect.value = categoryId;
    }
    
    addPromptModal.show();
  });

  savePromptBtn.addEventListener('click', async () => {
    const title = promptTitleInput.value.trim();
    const text = promptTextInput.value.trim();
    const result = promptResultInput.value.trim();
    const selectedCategoryId = promptCategorySelect.value;

    if (!title || !text || !selectedCategoryId) {
      alert('Please fill in the required fields (Category, Title, and Prompt Text).');
      return;
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .insert([{ 
          title: title, 
          prompt_text: text, 
          result_text: result,
          category_id: selectedCategoryId,
          user_id: currentUser.id 
        }]);

      if (error) throw error;

      addPromptModal.hide();
      fetchPrompts(); // Refresh the list
      
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

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      renderPrompts(allPrompts);
      return;
    }
    
    const filteredPrompts = allPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) || 
      prompt.prompt_text.toLowerCase().includes(searchTerm) ||
      (prompt.result_text && prompt.result_text.toLowerCase().includes(searchTerm))
    );
    
    renderPrompts(filteredPrompts);
  });
});
