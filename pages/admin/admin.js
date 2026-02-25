import { supabase } from '../../utils/supabaseClient.js';
import { isAdminUser } from '../../utils/roles.js';

document.addEventListener('DOMContentLoaded', async () => {
  const navDashboard = document.getElementById('nav-dashboard');
  const navAdmin = document.getElementById('nav-admin');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navUserEmail = document.getElementById('nav-user-email');
  const navDivider = document.getElementById('nav-divider');
  const userEmail = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logoutBtn');

  const statTotalUsers = document.getElementById('stat-total-users');
  const statTotalPrompts = document.getElementById('stat-total-prompts');
  const statTotalCategories = document.getElementById('stat-total-categories');
  const moderationLoading = document.getElementById('moderationLoading');
  const moderationTableWrapper = document.getElementById('moderationTableWrapper');
  const moderationRows = document.getElementById('moderationRows');
  const moderationEmpty = document.getElementById('moderationEmpty');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const isAuthenticated = !sessionError && !!session;
  const currentUser = session?.user || null;

  if (!isAuthenticated || !currentUser?.id) {
    window.location.href = '../home/home.html';
    return;
  }

  const isAdmin = await isAdminUser(currentUser.id);
  if (!isAdmin) {
    window.location.href = '../home/home.html';
    return;
  }

  navDashboard.style.display = 'block';
  navAdmin.style.display = 'block';
  navLogin.style.display = 'none';
  navRegister.style.display = 'none';
  navLogout.style.display = 'block';
  navUserEmail.style.display = 'block';
  userEmail.textContent = currentUser.email || '';
  if (navDivider) {
    navDivider.style.setProperty('display', 'flex', 'important');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Failed to log out.');
      } else {
        window.location.href = '../../index.html';
      }
    });
  }

  function formatDate(value) {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString();
  }

  async function loadStats() {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

    if (error || !data || data.length === 0) {
      statTotalUsers.textContent = '0';
      statTotalPrompts.textContent = '0';
      statTotalCategories.textContent = '0';
      return;
    }

    const stats = data[0];
    statTotalUsers.textContent = stats.total_users ?? 0;
    statTotalPrompts.textContent = stats.total_prompts ?? 0;
    statTotalCategories.textContent = stats.total_categories ?? 0;
  }

  async function loadPrompts() {
    moderationLoading.style.display = 'block';
    moderationTableWrapper.style.display = 'none';
    moderationEmpty.style.display = 'none';

    const { data, error } = await supabase.rpc('get_admin_prompts');

    moderationLoading.style.display = 'none';

    if (error) {
      moderationEmpty.textContent = 'Failed to load prompts.';
      moderationEmpty.style.display = 'block';
      return;
    }

    if (!data || data.length === 0) {
      moderationEmpty.textContent = 'No prompts found.';
      moderationEmpty.style.display = 'block';
      return;
    }

    moderationRows.innerHTML = '';

    data.forEach((prompt) => {
      const row = document.createElement('tr');

      const titleCell = document.createElement('td');
      titleCell.textContent = prompt.title || '-';

      const categoryCell = document.createElement('td');
      categoryCell.textContent = prompt.category_name || 'Uncategorized';

      const emailCell = document.createElement('td');
      emailCell.textContent = prompt.author_email || '-';

      const userIdCell = document.createElement('td');
      userIdCell.textContent = prompt.user_id || '-';

      const createdCell = document.createElement('td');
      createdCell.textContent = formatDate(prompt.created_at);

      const actionCell = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-outline-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        const confirmed = window.confirm('Delete this prompt?');
        if (!confirmed) {
          return;
        }

        try {
          if (prompt.file_url && !/^https?:\/\//i.test(prompt.file_url)) {
            await supabase.storage.from('prompt-attachments').remove([prompt.file_url]);
          }

          const { error: deleteError } = await supabase
            .from('prompts')
            .delete()
            .eq('id', prompt.id);

          if (deleteError) {
            throw deleteError;
          }

          await loadStats();
          await loadPrompts();
        } catch (_) {
          alert('Failed to delete prompt.');
        }
      });
      actionCell.appendChild(deleteBtn);

      row.appendChild(titleCell);
      row.appendChild(categoryCell);
      row.appendChild(emailCell);
      row.appendChild(userIdCell);
      row.appendChild(createdCell);
      row.appendChild(actionCell);

      moderationRows.appendChild(row);
    });

    moderationTableWrapper.style.display = 'block';
  }

  await loadStats();
  await loadPrompts();
});
