import { supabase } from '../../utils/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesLoading = document.getElementById('categoriesLoading');
  const categoriesGrid = document.getElementById('categoriesGrid');
  const categoriesEmpty = document.getElementById('categoriesEmpty');
  const pastelCardBackgroundClasses = [
    'bg-light',
    'bg-secondary-subtle',
    'bg-primary-subtle',
    'bg-success-subtle',
    'bg-info-subtle',
    'bg-warning-subtle',
    'bg-danger-subtle'
  ];

  function getCategoryIcon(categoryName) {
    const normalized = (categoryName || '').toLowerCase();

    if (normalized.includes('code') || normalized.includes('program') || normalized.includes('dev')) {
      return 'bi-code-slash';
    }

    if (normalized.includes('image') || normalized.includes('photo') || normalized.includes('design')) {
      return 'bi-image';
    }

    if (normalized.includes('write') || normalized.includes('content') || normalized.includes('story')) {
      return 'bi-pencil-square';
    }

    if (normalized.includes('analysis') || normalized.includes('research')) {
      return 'bi-graph-up';
    }

    return 'bi-folder2-open';
  }

  function createCategoryCard(category, index) {
    const col = document.createElement('div');
    col.className = 'col';

    const encodedCategory = encodeURIComponent(category.name);
    const iconClass = getCategoryIcon(category.name);
    const cardBackgroundClass = pastelCardBackgroundClasses[index % pastelCardBackgroundClasses.length];

    col.innerHTML = `
      <a href="../explore/explore.html?category=${encodedCategory}" class="text-decoration-none">
        <div class="card category-card h-100 shadow-sm border-0 ${cardBackgroundClass} text-dark">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="fs-3 text-dark"><i class="bi ${iconClass}"></i></span>
              <span class="badge text-bg-secondary">${category.count} prompts</span>
            </div>
            <h2 class="h5 mb-0 text-dark">${category.name}</h2>
          </div>
        </div>
      </a>
    `;

    return col;
  }

  async function fetchAndRenderCategories() {
    try {
      categoriesLoading.style.display = 'block';
      categoriesGrid.style.display = 'none';
      categoriesEmpty.style.display = 'none';

      const { data: prompts, error } = await supabase
        .rpc('get_public_prompts_with_authors', { p_category_id: null });

      if (error) {
        throw error;
      }

      const categoryCountMap = {};

      (prompts || []).forEach((prompt) => {
        const categoryName = (prompt.category_name || 'Uncategorized').trim() || 'Uncategorized';
        categoryCountMap[categoryName] = (categoryCountMap[categoryName] || 0) + 1;
      });

      const categoryItems = Object.entries(categoryCountMap)
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => {
          if (right.count !== left.count) {
            return right.count - left.count;
          }

          return left.name.localeCompare(right.name);
        });

      categoriesLoading.style.display = 'none';

      if (categoryItems.length === 0) {
        categoriesEmpty.style.display = 'block';
        return;
      }

      categoriesGrid.innerHTML = '';
      categoryItems.forEach((category, index) => {
        categoriesGrid.appendChild(createCategoryCard(category, index));
      });
      categoriesGrid.style.display = 'flex';
    } catch (error) {
      console.error('Error loading categories:', error.message);
      categoriesLoading.style.display = 'none';
      categoriesEmpty.style.display = 'block';
      categoriesEmpty.innerHTML = `
        <div class="card-body py-5 text-center text-muted">
          <p class="mb-0 text-danger">Failed to load categories.</p>
        </div>
      `;
    }
  }

  await fetchAndRenderCategories();
});
