import { supabase } from '../../utils/supabaseClient.js';
import { isAdminUser } from '../../utils/roles.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logout-btn');
  const navDashboard = document.getElementById('nav-dashboard');
  const navAdmin = document.getElementById('nav-admin');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navUserEmail = document.getElementById('nav-user-email');
  const navDivider = document.getElementById('nav-divider');
  const userEmailDisplay = document.getElementById('user-email-display');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const isAuthenticated = !sessionError && !!session;
  const currentUserId = session?.user?.id || null;
  const currentUserEmail = session?.user?.email || null;

  if (isAuthenticated) {
    const isAdmin = await isAdminUser(currentUserId);
    navDashboard.style.display = 'block';
    navAdmin.style.display = isAdmin ? 'block' : 'none';
    navLogin.style.display = 'none';
    navRegister.style.display = 'none';
    navLogout.style.display = 'block';
    navUserEmail.style.display = 'block';
    userEmailDisplay.textContent = currentUserEmail || '';
    if (navDivider) {
      navDivider.style.setProperty('display', 'flex', 'important');
    }
  } else {
    navDashboard.style.display = 'none';
    navAdmin.style.display = 'none';
    navLogin.style.display = 'block';
    navRegister.style.display = 'block';
    navLogout.style.display = 'none';
    navUserEmail.style.display = 'none';
    if (navDivider) {
      navDivider.style.setProperty('display', 'none', 'important');
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Failed to log out.');
        return;
      }

      window.location.href = './home.html';
    });
  }
});
