import { supabase } from './supabaseClient.js';
import { isAdminUser } from './roles.js';

function setVisible(element, isVisible, visibleDisplay = 'block') {
  if (!element) {
    return;
  }

  element.style.display = isVisible ? visibleDisplay : 'none';
}

async function applyPublicNavbarAuthState(session) {
  const navDashboard = document.getElementById('nav-dashboard');
  const navAdmin = document.getElementById('nav-admin');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navUserEmail = document.getElementById('nav-user-email');
  const navDivider = document.getElementById('nav-divider');
  const userEmailDisplay = document.getElementById('user-email-display');

  const isAuthenticated = !!session;
  const currentUserId = session?.user?.id || null;
  const currentUserEmail = session?.user?.email || '';

  setVisible(navDashboard, isAuthenticated);
  setVisible(navLogin, !isAuthenticated);
  setVisible(navRegister, !isAuthenticated);
  setVisible(navLogout, isAuthenticated);
  setVisible(navUserEmail, isAuthenticated);

  if (userEmailDisplay) {
    userEmailDisplay.textContent = isAuthenticated ? currentUserEmail : '';
  }

  if (navDivider) {
    navDivider.style.setProperty('display', isAuthenticated ? 'flex' : 'none', 'important');
  }

  if (navAdmin) {
    let isAdmin = false;
    if (isAuthenticated && currentUserId) {
      isAdmin = await isAdminUser(currentUserId);
    }

    setVisible(navAdmin, isAdmin);
  }
}

export async function initPublicNavbarAuth({ logoutRedirectTo = '../home/home.html' } = {}) {
  const logoutBtn = document.getElementById('logout-btn');

  const { data: { session }, error } = await supabase.auth.getSession();
  await applyPublicNavbarAuthState(error ? null : session);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (event) => {
      event.preventDefault();

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        alert('Failed to log out.');
        return;
      }

      window.location.href = logoutRedirectTo;
    });
  }

  const { data: authStateListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
    await applyPublicNavbarAuthState(nextSession);
  });

  return () => {
    authStateListener?.subscription?.unsubscribe();
  };
}
