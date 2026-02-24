import { supabase } from '../../utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logout-btn');
  const createCategoryBtn = document.getElementById('createCategoryBtn');
  const addPromptBtn = document.getElementById('addPromptBtn');
  const navDashboard = document.getElementById('nav-dashboard');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navUserEmail = document.getElementById('nav-user-email');
  const navDivider = document.getElementById('nav-divider');
  const userEmailDisplay = document.getElementById('user-email-display');

  const categoriesLoading = document.getElementById('categoriesLoading');
  const categoriesList = document.getElementById('categoriesList');
  const categoriesEmpty = document.getElementById('categoriesEmpty');
  const promptsLoading = document.getElementById('promptsLoading');
  const promptsContainer = document.getElementById('promptsContainer');
  const promptsEmpty = document.getElementById('promptsEmpty');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const isAuthenticated = !sessionError && !!session;
  const currentUserId = session?.user?.id || null;

  if (isAuthenticated) {
    navDashboard.style.display = 'block';
    navLogin.style.display = 'none';
    navRegister.style.display = 'none';
    navLogout.style.display = 'block';
    navUserEmail.style.display = 'block';
    userEmailDisplay.textContent = session.user.email;
    if (navDivider) {
      navDivider.style.setProperty('display', 'flex', 'important');
    }
  } else {
    navDashboard.style.display = 'none';
    navLogin.style.display = 'block';
    navRegister.style.display = 'block';
    navLogout.style.display = 'none';
    navUserEmail.style.display = 'none';
    createCategoryBtn.style.display = 'none';
    addPromptBtn.style.display = 'none';
    if (navDivider) {
      navDivider.style.setProperty('display', 'none', 'important');
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        alert('Failed to log out.');
      } else {
        window.location.reload();
      }
    });
  }

  let activeCategoryId = null;

  async function fetchCategories() {
    try {
      categoriesLoading.style.display = 'block';
      categoriesList.style.display = 'none';
      categoriesEmpty.style.display = 'none';

      let categoriesQuery = supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (isAuthenticated && currentUserId) {
        categoriesQuery = categoriesQuery.eq('user_id', currentUserId);
      }

      const { data: categories, error } = await categoriesQuery;
      if (error) throw error;

      categoriesLoading.style.display = 'none';

      if (!categories || categories.length === 0) {
        categoriesEmpty.style.display = 'block';
        return;
      }

      categoriesList.style.display = 'block';
      categoriesList.innerHTML = '';

      const allLi = document.createElement('li');
      allLi.className = 'nav-item mb-1';
      allLi.innerHTML = `
        <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === null ? 'active-category' : ''}" href="#" data-id="">
          📁 All Categories
        </a>
      `;
      categoriesList.appendChild(allLi);

      categories.forEach((category) => {
        const li = document.createElement('li');
        li.className = 'nav-item mb-1';
        li.innerHTML = `
          <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === category.id ? 'active-category' : ''}" href="#" data-id="${category.id}">
            📁 ${category.name}
          </a>
        `;
        categoriesList.appendChild(li);
      });

      document.querySelectorAll('.category-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('.category-link').forEach((l) => l.classList.remove('active-category'));
          e.currentTarget.classList.add('active-category');

          const id = e.currentTarget.getAttribute('data-id');
          activeCategoryId = id ? id : null;
          fetchPrompts();
        });
      });
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      categoriesLoading.style.display = 'none';
      categoriesEmpty.style.display = 'block';
      categoriesEmpty.innerHTML = '<small class="text-danger">Failed to load categories.</small>';
    }
  }

  async function fetchPrompts() {
    try {
      promptsLoading.style.display = 'block';
      promptsContainer.style.display = 'none';
      promptsEmpty.style.display = 'none';

      let query = supabase
        .from('prompts')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (isAuthenticated && currentUserId) {
        query = query.eq('user_id', currentUserId);
      }

      if (activeCategoryId) {
        query = query.eq('category_id', activeCategoryId);
      }

      const { data: prompts, error } = await query;
      if (error) throw error;

      promptsLoading.style.display = 'none';

      if (!prompts || prompts.length === 0) {
        promptsEmpty.style.display = 'block';
        return;
      }

      promptsContainer.style.display = 'flex';
      promptsContainer.innerHTML = '';

      const imagePaths = [];
      prompts.forEach((prompt) => {
        if (prompt.file_url && prompt.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
          imagePaths.push(prompt.file_url);
        }
      });

      const signedUrlsMap = {};
      if (imagePaths.length > 0) {
        const { data: signedUrlsData, error: signedUrlsError } = await supabase.storage
          .from('prompt-attachments')
          .createSignedUrls(imagePaths, 3600);

        if (!signedUrlsError && signedUrlsData) {
          signedUrlsData.forEach((item) => {
            if (!item.error) {
              signedUrlsMap[item.path] = item.signedUrl;
            }
          });
        }
      }

      prompts.forEach((prompt) => {
        const categoryName = prompt.categories?.name || 'Uncategorized';
        const col = document.createElement('div');
        col.className = 'col';

        let attachmentBtnHtml = '';
        let imagePreviewHtml = '';

        if (prompt.file_url) {
          const isImage = prompt.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          if (isImage && signedUrlsMap[prompt.file_url]) {
            imagePreviewHtml = `<img src="${signedUrlsMap[prompt.file_url]}" class="card-img-top mb-2" alt="Attachment Preview" style="max-height: 150px; object-fit: cover;">`;
          } else {
            attachmentBtnHtml = `<button class="btn btn-sm btn-outline-secondary view-attachment-btn mt-2 me-2" data-url="${prompt.file_url}">📎 View Attachment</button>`;
          }
        }

        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            ${imagePreviewHtml ? `<div class="p-2 d-flex flex-wrap gap-2">${imagePreviewHtml}</div>` : ''}
            <div class="card-body">
              <h5 class="card-title">${prompt.title}</h5>
              <h6 class="card-subtitle mb-2 text-muted">📁 ${categoryName}</h6>
              <p class="card-text text-truncate">${prompt.prompt_text}</p>
              <div class="d-flex flex-wrap">${attachmentBtnHtml}</div>
            </div>
            <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-primary view-prompt-btn" data-id="${prompt.id}">View Details</button>
              ${isAuthenticated ? `<button class="btn btn-sm btn-outline-secondary edit-prompt-btn" data-id="${prompt.id}">Edit</button>` : ''}
              ${isAuthenticated ? `<button class="btn btn-sm btn-outline-danger delete-prompt-btn" data-id="${prompt.id}">Delete</button>` : ''}
            </div>
          </div>
        `;
        promptsContainer.appendChild(col);
      });

      document.querySelectorAll('.view-attachment-btn').forEach((btn) => {
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

      document.querySelectorAll('.view-prompt-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const promptId = e.currentTarget.getAttribute('data-id');
          const prompt = prompts.find((p) => p.id === promptId);
          if (prompt) {
            openPromptModal(prompt, false);
          }
        });
      });

      if (isAuthenticated) {
        document.querySelectorAll('.edit-prompt-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const promptId = e.currentTarget.getAttribute('data-id');
            const prompt = prompts.find((p) => p.id === promptId);
            if (prompt) {
              openPromptModal(prompt, true);
            }
          });
        });

        document.querySelectorAll('.delete-prompt-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this prompt?')) {
              const promptId = e.currentTarget.getAttribute('data-id');
              try {
                const prompt = prompts.find((p) => p.id === promptId);
                if (prompt && prompt.file_url) {
                  await supabase.storage.from('prompt-attachments').remove([prompt.file_url]);
                }
                const { error } = await supabase.from('prompts').delete().eq('id', promptId);
                if (error) throw error;
                fetchPrompts();
              } catch (deleteError) {
                console.error('Error deleting prompt:', deleteError.message);
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

  fetchCategories();
  fetchPrompts();

  const createCategoryModal = new window.bootstrap.Modal(document.getElementById('createCategoryModal'));
  const saveCategoryBtn = document.getElementById('saveCategoryBtn');
  const categoryNameInput = document.getElementById('categoryName');

  if (isAuthenticated) {
    createCategoryBtn.addEventListener('click', () => {
      categoryNameInput.value = '';
      createCategoryModal.show();
    });
  }

  saveCategoryBtn.addEventListener('click', async () => {
    if (!isAuthenticated) {
      return;
    }

    const name = categoryNameInput.value.trim();
    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    try {
      const { error } = await supabase.from('categories').insert([{ name: name, user_id: currentUserId }]);
      if (error) throw error;

      createCategoryModal.hide();
      fetchCategories();
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
  const promptFileInput = document.getElementById('promptFile');

  if (isAuthenticated) {
    addPromptBtn.addEventListener('click', () => {
      if (!activeCategoryId) {
        alert('Please select a category first to add a prompt.');
        return;
      }

      promptTitleInput.value = '';
      promptTextInput.value = '';
      promptResultInput.value = '';
      promptFileInput.value = '';
      addPromptModal.show();
    });
  }

  savePromptBtn.addEventListener('click', async () => {
    if (!isAuthenticated) {
      return;
    }

    const title = promptTitleInput.value.trim();
    const text = promptTextInput.value.trim();
    const result = promptResultInput.value.trim();
    const files = promptFileInput.files;

    if (!title || !text) {
      alert('Please fill in the required fields (Title and Prompt Text).');
      return;
    }

    try {
      let fileUrl = null;

      if (files && files.length > 0) {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${currentUserId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('prompt-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        fileUrl = filePath;
      }

      const { error: promptError } = await supabase.from('prompts').insert([{
        title: title,
        prompt_text: text,
        result_text: result,
        category_id: activeCategoryId,
        user_id: currentUserId,
        file_url: fileUrl,
      }]);

      if (promptError) throw promptError;

      addPromptModal.hide();
      fetchPrompts();
      alert('Prompt saved successfully!');
    } catch (error) {
      console.error('Error creating prompt:', error.message);
      alert('Failed to create prompt: ' + error.message);
    }
  });

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

  async function openPromptModal(prompt, isEditMode) {
    const isReadOnlyMode = !isEditMode;

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
    if (prompt.file_url) {
      const { data } = await supabase.storage.from('prompt-attachments').createSignedUrl(prompt.file_url, 3600);
      const url = data ? data.signedUrl : '#';

      const li = document.createElement('li');
      li.className = 'mb-2 d-flex align-items-center';
      li.innerHTML = `
        <a href="${url}" target="_blank" class="me-2 text-truncate" style="max-width: 200px;">Attachment</a>
        ${isReadOnlyMode ? '' : `<button type="button" class="btn btn-sm btn-outline-danger remove-attachment-btn" data-id="${prompt.id}" data-url="${prompt.file_url}">Remove</button>`}
      `;
      currentAttachmentsList.appendChild(li);
      currentAttachmentContainer.style.display = 'block';

      if (!isReadOnlyMode) {
        document.querySelectorAll('.remove-attachment-btn').forEach((btn) => {
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
        const { error: storageError } = await supabase.storage.from('prompt-attachments').remove([fileUrl]);
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('prompts').update({ file_url: null }).eq('id', id);
        if (dbError) throw dbError;

        e.currentTarget.closest('li').remove();
        if (currentAttachmentsList.children.length === 0) {
          currentAttachmentContainer.style.display = 'none';
        }

        editPromptOldFileUrlInput.value = '';
        alert('Attachment removed successfully!');
        fetchPrompts();
      } catch (error) {
        console.error('Error removing attachment:', error.message);
        alert('Failed to remove attachment: ' + error.message);
      }
    }
  }

  updatePromptBtn.addEventListener('click', async () => {
    if (!isAuthenticated) {
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
      const updateData = {
        title: title,
        prompt_text: text,
        result_text: result,
      };

      if (files && files.length > 0) {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${currentUserId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('prompt-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        if (oldFileUrl) {
          await supabase.storage.from('prompt-attachments').remove([oldFileUrl]);
        }

        updateData.file_url = filePath;
      }

      const { error } = await supabase.from('prompts').update(updateData).eq('id', id);
      if (error) throw error;

      viewPromptModal.hide();
      fetchPrompts();
      alert('Prompt updated successfully!');
    } catch (error) {
      console.error('Error updating prompt:', error.message);
      alert('Failed to update prompt: ' + error.message);
    }
  });
});
