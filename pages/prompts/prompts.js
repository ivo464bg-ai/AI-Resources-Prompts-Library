import { supabase } from '../../utils/supabaseClient.js';

// Prompts Page Specific Logic
document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const createPromptBtn = document.getElementById('createPromptBtn');
  const searchInput = document.getElementById('searchPrompts');
  const navDashboard = document.getElementById('nav-dashboard');
  const navPrompts = document.getElementById('nav-prompts');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navUserEmail = document.getElementById('nav-user-email');
  const navDivider = document.getElementById('nav-divider');
  
  const promptsLoading = document.getElementById('promptsLoading');
  const promptsContainer = document.getElementById('promptsContainer');
  const promptsEmpty = document.getElementById('promptsEmpty');
  const categoryTitle = document.getElementById('categoryTitle');

  // 1. Check if user is logged in
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const isAuthenticated = !sessionError && !!session;

  // Display user email
  const userEmailSpan = document.getElementById('user-email');
  let currentUser = null;
  if (isAuthenticated && userEmailSpan) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!userError && user) {
      currentUser = user;
    }
    if (user?.email) {
      userEmailSpan.textContent = user.email;
    }
  }

  if (isAuthenticated) {
    navDashboard.style.display = 'block';
    navPrompts.style.display = 'block';
    navLogin.style.display = 'none';
    navRegister.style.display = 'none';
    navLogout.style.display = 'block';
    navUserEmail.style.display = 'block';
    if (navDivider) {
      navDivider.style.setProperty('display', 'flex', 'important');
    }
  } else {
    navDashboard.style.display = 'none';
    navPrompts.style.display = 'none';
    navLogin.style.display = 'block';
    navRegister.style.display = 'block';
    navLogout.style.display = 'none';
    navUserEmail.style.display = 'none';
    if (navDivider) {
      navDivider.style.setProperty('display', 'none', 'important');
    }
    createPromptBtn.style.display = 'none';
  }

  // Parse URL parameters to get category if any
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');
  const searchQuery = urlParams.get('search');
  
  let allPrompts = [];
  let signedUrlsMap = {};

  // Fetch Categories for the select dropdown
  async function fetchCategoriesForSelect() {
    const select = document.getElementById('promptCategorySelect');
    try {
      let categoriesQuery = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (isAuthenticated && currentUser?.id) {
        categoriesQuery = categoriesQuery.eq('user_id', currentUser.id);
      }

      const { data: categories, error } = await categoriesQuery;

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

      if (isAuthenticated && currentUser?.id) {
        query = query.eq('user_id', currentUser.id);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: prompts, error } = await query;

      if (error) throw error;

      allPrompts = prompts;
      
      // Generate signed URLs for images
      const imagePaths = [];
      prompts.forEach(p => {
        if (p.file_url && p.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
          imagePaths.push(p.file_url);
        }
      });
        
      signedUrlsMap = {};
      if (imagePaths.length > 0) {
        const { data: signedUrlsData, error: signedUrlsError } = await supabase.storage
          .from('prompt-attachments')
          .createSignedUrls(imagePaths, 3600);
          
        if (!signedUrlsError && signedUrlsData) {
          signedUrlsData.forEach(item => {
            if (!item.error) {
              signedUrlsMap[item.path] = item.signedUrl;
            }
          });
        }
      }
      
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
        
        let attachmentBtnHtml = '';
        let imagePreviewHtml = '';
        
        if (prompt.file_url) {
          const isImage = prompt.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          if (isImage && signedUrlsMap[prompt.file_url]) {
            imagePreviewHtml += `<img src="${signedUrlsMap[prompt.file_url]}" class="card-img-top mb-2" alt="Attachment Preview" style="max-height: 150px; object-fit: cover;">`;
          } else {
            attachmentBtnHtml += `<button class="btn btn-sm btn-outline-secondary view-attachment-btn mt-2 me-2" data-url="${prompt.file_url}">📎 View Attachment</button>`;
          }
        }

        col.innerHTML = `
          <div class="card shadow-sm">
            ${imagePreviewHtml ? `<div class="p-2 d-flex flex-wrap gap-2">${imagePreviewHtml}</div>` : ''}
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
              <div class="d-flex flex-wrap mb-3">
                ${attachmentBtnHtml}
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm view-prompt-btn" data-id="${prompt.id}">View Details</button>
                ${isAuthenticated ? `<button class="btn btn-outline-danger btn-sm delete-prompt-btn" data-id="${prompt.id}">Delete</button>` : ''}
              </div>
            </div>
          </div>
        `;
        promptsContainer.appendChild(col);
      });

      // Add attachment listeners
      document.querySelectorAll('.view-attachment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const fileUrl = e.currentTarget.getAttribute('data-url');
          const { data, error } = await supabase.storage.from('prompt-attachments').createSignedUrl(fileUrl, 3600);
          if (data) {
            window.open(data.signedUrl, '_blank');
          } else {
            console.error('Error getting signed URL:', error);
            alert('Failed to load attachment.');
          }
        });
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

      if (isAuthenticated) {
        // Add delete listeners
        document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this prompt?')) {
              const promptId = e.currentTarget.getAttribute('data-id');
              try {
                const prompt = promptsToRender.find(p => p.id === promptId);
                if (prompt && prompt.file_url) {
                  await supabase.storage.from('prompt-attachments').remove([prompt.file_url]);
                }
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
  }

  // Initialize
  fetchCategoriesForSelect();
  fetchPrompts();

  if (logoutBtn) {
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
  }

  // Add Prompt Modal Logic
  const addPromptModal = new window.bootstrap.Modal(document.getElementById('addPromptModal'));
  const savePromptBtn = document.getElementById('savePromptBtn');
  const promptCategorySelect = document.getElementById('promptCategorySelect');
  const promptTitleInput = document.getElementById('promptTitle');
  const promptTextInput = document.getElementById('promptText');
  const promptResultInput = document.getElementById('promptResult');
  const promptFileInput = document.getElementById('promptFile');

  if (isAuthenticated) {
    createPromptBtn.addEventListener('click', () => {
      // Clear form
      promptTitleInput.value = '';
      promptTextInput.value = '';
      promptResultInput.value = '';
      promptFileInput.value = '';
      
      if (categoryId) {
        promptCategorySelect.value = categoryId;
      }
      
      addPromptModal.show();
    });
  }

  savePromptBtn.addEventListener('click', async () => {
    if (!isAuthenticated || !currentUser?.id) {
      return;
    }

    const title = promptTitleInput.value.trim();
    const text = promptTextInput.value.trim();
    const result = promptResultInput.value.trim();
    const selectedCategoryId = promptCategorySelect.value;
    const files = promptFileInput.files;

    if (!title || !text || !selectedCategoryId) {
      alert('Please fill in the required fields (Category, Title, and Prompt Text).');
      return;
    }

    try {
      let fileUrl = null;

      // Upload file if exists
      if (files && files.length > 0) {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('prompt-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        fileUrl = filePath;
      }

      // Insert prompt
      const { error: promptError } = await supabase
        .from('prompts')
        .insert([{ 
          title: title, 
          prompt_text: text, 
          result_text: result,
          category_id: selectedCategoryId,
          user_id: currentUser.id,
          file_url: fileUrl
        }]);

      if (promptError) throw promptError;

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
  const editPromptOldFileUrlInput = document.getElementById('editPromptOldFileUrl');
  const editPromptTitleInput = document.getElementById('editPromptTitle');
  const editPromptTextInput = document.getElementById('editPromptText');
  const editPromptResultInput = document.getElementById('editPromptResult');
  const editPromptFileInput = document.getElementById('editPromptFile');
  const currentAttachmentContainer = document.getElementById('currentAttachmentContainer');
  const currentAttachmentsList = document.getElementById('currentAttachmentsList');

  async function openViewPromptModal(prompt) {
    const isReadOnlyMode = !isAuthenticated;

    editPromptIdInput.value = prompt.id;
    editPromptOldFileUrlInput.value = prompt.file_url || '';
    editPromptTitleInput.value = prompt.title;
    editPromptTextInput.value = prompt.prompt_text;
    editPromptResultInput.value = prompt.result_text || '';
    editPromptFileInput.value = '';

    editPromptTitleInput.readOnly = isReadOnlyMode;
    editPromptTextInput.readOnly = isReadOnlyMode;
    editPromptResultInput.readOnly = isReadOnlyMode;
    editPromptFileInput.disabled = isReadOnlyMode;
    updatePromptBtn.style.display = isReadOnlyMode ? 'none' : 'inline-block';
    
    currentAttachmentsList.innerHTML = '';
    let hasAttachments = false;
    
    if (prompt.file_url) {
      hasAttachments = true;
      const { data, error } = await supabase.storage.from('prompt-attachments').createSignedUrl(prompt.file_url, 3600);
      const url = data ? data.signedUrl : '#';
      
      const li = document.createElement('li');
      li.className = 'mb-2 d-flex align-items-center';
      li.innerHTML = `
        <a href="${url}" target="_blank" class="me-2 text-truncate" style="max-width: 200px;">Attachment</a>
        ${isReadOnlyMode ? '' : `<button type="button" class="btn btn-sm btn-outline-danger remove-attachment-btn" data-id="${prompt.id}" data-url="${prompt.file_url}">Remove</button>`}
      `;
      currentAttachmentsList.appendChild(li);
    }
    
    if (hasAttachments) {
      currentAttachmentContainer.style.display = 'block';
      
      if (!isReadOnlyMode) {
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-attachment-btn').forEach(btn => {
          btn.addEventListener('click', handleRemoveAttachment);
        });
      }
    } else {
      currentAttachmentContainer.style.display = 'none';
    }
    
    viewPromptModal.show();
  }

  async function handleRemoveAttachment(e) {
    if (confirm('Are you sure you want to remove this attachment?')) {
      const id = e.currentTarget.getAttribute('data-id');
      const fileUrl = e.currentTarget.getAttribute('data-url');
      
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage.from('prompt-attachments').remove([fileUrl]);
        if (storageError) throw storageError;
        
        // Update database
        const { error: dbError } = await supabase.from('prompts').update({ file_url: null }).eq('id', id);
        if (dbError) throw dbError;
        
        // Remove from UI
        e.currentTarget.closest('li').remove();
        if (currentAttachmentsList.children.length === 0) {
          currentAttachmentContainer.style.display = 'none';
        }
        
        editPromptOldFileUrlInput.value = '';
        
        alert('Attachment removed successfully!');
        fetchPrompts(); // Refresh the list in background
      } catch (error) {
        console.error('Error removing attachment:', error.message);
        alert('Failed to remove attachment: ' + error.message);
      }
    }
  }

  updatePromptBtn.addEventListener('click', async () => {
    if (!isAuthenticated || !currentUser?.id) {
      return;
    }

    const id = editPromptIdInput.value;
    const oldFileUrl = editPromptOldFileUrlInput.value;
    const title = editPromptTitleInput.value.trim();
    const text = editPromptTextInput.value.trim();
    const result = editPromptResultInput.value.trim();
    const files = editPromptFileInput.files;

    if (!title || !text) {
      alert('Please fill in the required fields (Title and Prompt Text).');
      return;
    }

    try {
      let updateData = {
        title: title, 
        prompt_text: text, 
        result_text: result 
      };

      // Upload new file if exists
      if (files && files.length > 0) {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('prompt-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Delete old file if it exists and new upload was successful
        if (oldFileUrl) {
          await supabase.storage.from('prompt-attachments').remove([oldFileUrl]);
        }
        
        updateData.file_url = filePath;
      }

      const { error } = await supabase
        .from('prompts')
        .update(updateData)
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
