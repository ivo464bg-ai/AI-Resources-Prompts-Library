import { supabase } from '../../utils/supabaseClient.js';
import { initPublicNavbarAuth } from '../../utils/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initPublicNavbarAuth();

  const categoriesLoading = document.getElementById('categoriesLoading');
  const categoriesList = document.getElementById('categoriesList');
  const categoriesEmpty = document.getElementById('categoriesEmpty');
  const promptsLoading = document.getElementById('promptsLoading');
  const promptsContainer = document.getElementById('promptsContainer');
  const promptsEmpty = document.getElementById('promptsEmpty');
  const exploreTitle = document.getElementById('exploreTitle');
  const clearFilterContainer = document.getElementById('clearFilterContainer');

  const queryParams = new URLSearchParams(window.location.search);
  const initialCategoryFilterName = (queryParams.get('category') || '').trim();

  function createModalIfAvailable(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement || !window.bootstrap?.Modal) {
      return null;
    }

    return new window.bootstrap.Modal(modalElement);
  }

  let activeCategoryId = null;
  let hasUnmatchedUrlFilter = false;

  function updateExploreHeader(categoryName) {
    const normalizedCategoryName = (categoryName || '').trim();

    if (exploreTitle) {
      exploreTitle.textContent = normalizedCategoryName ? `Explore: ${normalizedCategoryName}` : 'Explore Prompts';
    }

    if (clearFilterContainer) {
      clearFilterContainer.style.display = normalizedCategoryName ? 'block' : 'none';
    }
  }

  function syncCategoryFilterInUrl(categoryName) {
    const normalizedCategoryName = (categoryName || '').trim();
    const nextUrl = new URL(window.location.href);

    if (normalizedCategoryName) {
      nextUrl.searchParams.set('category', normalizedCategoryName);
    } else {
      nextUrl.searchParams.delete('category');
    }

    window.history.pushState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }

  updateExploreHeader(initialCategoryFilterName);

  function isAbsoluteUrl(value) {
    return /^https?:\/\//i.test(value || '');
  }

  function getFilePathWithoutQuery(fileRef) {
    if (!fileRef) {
      return '';
    }

    if (isAbsoluteUrl(fileRef)) {
      try {
        return new URL(fileRef).pathname || '';
      } catch (_) {
        return fileRef.split('?')[0];
      }
    }

    return fileRef.split('?')[0];
  }

  function isImageFile(fileRef) {
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(getFilePathWithoutQuery(fileRef));
  }

  function getAuthorLabel(authorEmail, userId) {
    if (authorEmail) {
      const atIndex = authorEmail.indexOf('@');
      if (atIndex > 0) {
        return authorEmail.slice(0, atIndex);
      }

      return authorEmail;
    }

    if (!userId) {
      return 'Unknown author';
    }

    return `User ${userId.slice(0, 8)}`;
  }

  async function fetchCategories() {
    try {
      categoriesLoading.style.display = 'block';
      categoriesList.style.display = 'none';
      categoriesEmpty.style.display = 'none';

      const { data: prompts, error } = await supabase
        .rpc('get_public_prompts_with_authors', { p_category_id: null });

      if (error) throw error;

      const categoryMap = {};
      (prompts || []).forEach((prompt) => {
        const categoryName = (prompt.category_name || 'Uncategorized').trim() || 'Uncategorized';
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            id: prompt.category_id || null,
            name: categoryName,
            count: 0,
          };
        }

        categoryMap[categoryName].count += 1;

        if (!categoryMap[categoryName].id && prompt.category_id) {
          categoryMap[categoryName].id = prompt.category_id;
        }
      });

      const categories = Object.values(categoryMap).sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        return left.name.localeCompare(right.name);
      });

      if (initialCategoryFilterName) {
        const matchedCategory = categories.find(
          (category) => category.name.toLowerCase() === initialCategoryFilterName.toLowerCase(),
        );

        if (matchedCategory?.id) {
          activeCategoryId = matchedCategory.id;
          hasUnmatchedUrlFilter = false;
          updateExploreHeader(matchedCategory.name);
        } else {
          hasUnmatchedUrlFilter = true;
          updateExploreHeader(initialCategoryFilterName);
        }
      }

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
        <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === null ? 'active-category' : ''}" href="#" data-id="" data-name="">
          📁 All Categories
        </a>
      `;
      categoriesList.appendChild(allLi);

      categories.forEach((category) => {
        const li = document.createElement('li');
        li.className = 'nav-item mb-1';
        li.innerHTML = `
          <a class="nav-link text-dark bg-white border rounded py-2 px-3 category-link ${activeCategoryId === category.id ? 'active-category' : ''}" href="#" data-id="${category.id}" data-name="${category.name}">
            <div class="d-flex justify-content-between align-items-center gap-2">
              <span>📁 ${category.name}</span>
              <span class="badge text-bg-secondary">${category.count}</span>
            </div>
          </a>
        `;
        categoriesList.appendChild(li);
      });

      document.querySelectorAll('.category-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          document.querySelectorAll('.category-link').forEach((entry) => entry.classList.remove('active-category'));
          e.currentTarget.classList.add('active-category');

          const id = e.currentTarget.getAttribute('data-id');
          const categoryName = e.currentTarget.getAttribute('data-name') || '';
          activeCategoryId = id ? id : null;
          hasUnmatchedUrlFilter = false;
          updateExploreHeader(categoryName);
          syncCategoryFilterInUrl(categoryName);
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

      if (hasUnmatchedUrlFilter) {
        promptsLoading.style.display = 'none';
        promptsEmpty.style.display = 'block';
        return;
      }

      const { data: prompts, error } = await supabase
        .rpc('get_public_prompts_with_authors', {
          p_category_id: activeCategoryId,
        })
        .order('created_at', { ascending: true });
      if (error) throw error;

      promptsLoading.style.display = 'none';

      if (!prompts || prompts.length === 0) {
        promptsEmpty.style.display = 'block';
        return;
      }

      promptsContainer.style.display = 'flex';
      promptsContainer.innerHTML = '';

      const imagePaths = [];
      const attachmentPaths = [];
      const directAttachmentUrlsMap = {};
      prompts.forEach((prompt) => {
        if (!prompt.file_url) {
          return;
        }

        if (isAbsoluteUrl(prompt.file_url)) {
          directAttachmentUrlsMap[prompt.file_url] = prompt.file_url;
        } else {
          attachmentPaths.push(prompt.file_url);
          if (isImageFile(prompt.file_url)) {
            imagePaths.push(prompt.file_url);
          }
        }

        if (isAbsoluteUrl(prompt.file_url) && isImageFile(prompt.file_url)) {
          imagePaths.push(prompt.file_url);
        }
      });

      const signedUrlsMap = {};
      const resolvedAttachmentUrlsMap = {};

      if (attachmentPaths.length > 0) {
        const uniqueAttachmentPaths = [...new Set(attachmentPaths)];
        const { data: signedAttachmentUrlsData, error: signedAttachmentUrlsError } = await supabase.storage
          .from('prompt-attachments')
          .createSignedUrls(uniqueAttachmentPaths, 3600);

        if (!signedAttachmentUrlsError && signedAttachmentUrlsData) {
          signedAttachmentUrlsData.forEach((item) => {
            if (!item.error && item.path && item.signedUrl) {
              resolvedAttachmentUrlsMap[item.path] = item.signedUrl;
            }
          });
        }

        uniqueAttachmentPaths.forEach((path) => {
          if (!resolvedAttachmentUrlsMap[path]) {
            const { data: publicUrlData } = supabase.storage
              .from('prompt-attachments')
              .getPublicUrl(path);

            if (publicUrlData?.publicUrl) {
              resolvedAttachmentUrlsMap[path] = publicUrlData.publicUrl;
            }
          }
        });
      }

      Object.entries(directAttachmentUrlsMap).forEach(([key, value]) => {
        resolvedAttachmentUrlsMap[key] = value;
      });

      if (imagePaths.length > 0) {
        const storageImagePaths = imagePaths.filter((path) => !isAbsoluteUrl(path));

        if (storageImagePaths.length > 0) {
          const { data: signedUrlsData, error: signedUrlsError } = await supabase.storage
            .from('prompt-attachments')
            .createSignedUrls(storageImagePaths, 3600);

          if (!signedUrlsError && signedUrlsData) {
            signedUrlsData.forEach((item) => {
              if (!item.error) {
                signedUrlsMap[item.path] = item.signedUrl;
              }
            });
          }
        }

        imagePaths
          .filter((path) => isAbsoluteUrl(path))
          .forEach((absoluteImageUrl) => {
            signedUrlsMap[absoluteImageUrl] = absoluteImageUrl;
          });
      }

      prompts.forEach((prompt) => {
        const categoryName = prompt.category_name || 'Uncategorized';
        const authorName = getAuthorLabel(prompt.author_email, prompt.user_id);
        const col = document.createElement('div');
        col.className = 'col';

        let attachmentBtnHtml = '';
        let imagePreviewHtml = '';

        if (prompt.file_url) {
          const resolvedAttachmentUrl = resolvedAttachmentUrlsMap[prompt.file_url] || '';
          const isImage = isImageFile(prompt.file_url);

          if (isImage && signedUrlsMap[prompt.file_url]) {
            imagePreviewHtml = `<img src="${signedUrlsMap[prompt.file_url]}" alt="Attachment Preview" style="max-height: 150px; object-fit: cover; width: 100%; border-radius: 8px; margin-bottom: 10px;">`;
          } else if (isImage && resolvedAttachmentUrl) {
            imagePreviewHtml = `<img src="${resolvedAttachmentUrl}" alt="Attachment Preview" style="max-height: 150px; object-fit: cover; width: 100%; border-radius: 8px; margin-bottom: 10px;">`;
          }

          attachmentBtnHtml = `<button class="btn btn-sm btn-outline-secondary view-attachment-btn mt-2 me-2" data-url="${prompt.file_url}" data-resolved-url="${resolvedAttachmentUrl}">📎 View Attachment</button>`;
        }

        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            ${imagePreviewHtml ? `<div class="p-2 d-flex flex-wrap gap-2">${imagePreviewHtml}</div>` : ''}
            <div class="card-body">
              <h5 class="card-title">${prompt.title}</h5>
              <h6 class="card-subtitle mb-2 text-muted">📁 ${categoryName}</h6>
              <p class="card-text text-muted small mb-2">By: ${authorName}</p>
              <p class="card-text text-truncate">${prompt.prompt_text}</p>
              <div class="d-flex flex-wrap">${attachmentBtnHtml}</div>
            </div>
            <div class="card-footer bg-transparent border-top-0 d-flex justify-content-start flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-primary view-prompt-btn" data-id="${prompt.id}">View Details</button>
            </div>
          </div>
        `;
        promptsContainer.appendChild(col);
      });

      document.querySelectorAll('.view-attachment-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const fileUrl = e.currentTarget.getAttribute('data-url');
          const resolvedUrl = e.currentTarget.getAttribute('data-resolved-url');

          if (resolvedUrl) {
            window.open(resolvedUrl, '_blank');
            return;
          }

          if (isAbsoluteUrl(fileUrl)) {
            window.open(fileUrl, '_blank');
            return;
          }

          const { data, error } = await supabase.storage.from('prompt-attachments').createSignedUrl(fileUrl, 3600);

          if (data) {
            window.open(data.signedUrl, '_blank');
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('prompt-attachments')
              .getPublicUrl(fileUrl);

            if (publicUrlData?.publicUrl) {
              window.open(publicUrlData.publicUrl, '_blank');
            } else {
              console.error('Error getting signed URL:', error);
              alert('Failed to load attachment.');
            }
          }
        });
      });

      document.querySelectorAll('.view-prompt-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const promptId = e.currentTarget.getAttribute('data-id');
          const prompt = prompts.find((entry) => entry.id === promptId);
          if (prompt) {
            openReadOnlyPromptModal(prompt);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching prompts:', error.message);
      promptsLoading.style.display = 'none';
      promptsEmpty.style.display = 'block';
      promptsEmpty.innerHTML = '<h5 class="text-danger">Failed to load prompts.</h5>';
    }
  }

  const viewPromptModal = createModalIfAvailable('viewPromptModal');
  const editPromptTitleInput = document.getElementById('editPromptTitle');
  const editPromptTextInput = document.getElementById('editPromptText');
  const editPromptResultInput = document.getElementById('editPromptResult');
  const editPromptFileInput = document.getElementById('editPromptFile');
  const currentAttachmentContainer = document.getElementById('currentAttachmentContainer');
  const currentAttachmentsList = document.getElementById('currentAttachmentsList');

  async function openReadOnlyPromptModal(prompt) {
    if (
      !viewPromptModal
      || !editPromptTitleInput
      || !editPromptTextInput
      || !editPromptResultInput
      || !editPromptFileInput
      || !currentAttachmentContainer
      || !currentAttachmentsList
    ) {
      return;
    }

    editPromptTitleInput.value = prompt.title;
    editPromptTextInput.value = prompt.prompt_text;
    editPromptResultInput.value = prompt.result_text || '';
    editPromptFileInput.value = '';

    editPromptTitleInput.readOnly = true;
    editPromptTextInput.readOnly = true;
    editPromptResultInput.readOnly = true;
    editPromptFileInput.disabled = true;

    currentAttachmentsList.innerHTML = '';

    if (prompt.file_url) {
      let url = prompt.file_url;

      if (!isAbsoluteUrl(prompt.file_url)) {
        const { data } = await supabase.storage.from('prompt-attachments').createSignedUrl(prompt.file_url, 3600);

        if (data?.signedUrl) {
          url = data.signedUrl;
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('prompt-attachments')
            .getPublicUrl(prompt.file_url);

          url = publicUrlData?.publicUrl || '#';
        }
      }

      const li = document.createElement('li');
      li.className = 'mb-2 d-flex align-items-center';
      li.innerHTML = `<a href="${url}" target="_blank" class="me-2 text-truncate" style="max-width: 200px;">Attachment</a>`;
      currentAttachmentsList.appendChild(li);
      currentAttachmentContainer.style.display = 'block';
    } else {
      currentAttachmentContainer.style.display = 'none';
    }

    viewPromptModal.show();
  }

  await fetchCategories();
  fetchPrompts();
});
