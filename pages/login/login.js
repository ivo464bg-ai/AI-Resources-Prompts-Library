import { supabase } from '../../utils/supabaseClient.js';

// Login Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const toggleModeBtn = document.getElementById('toggleModeBtn');
  const toggleText = document.getElementById('toggleText');
  const alertArea = document.getElementById('alertArea');

  let isLoginMode = true;

  function applyMode() {
    if (isLoginMode) {
      formTitle.textContent = 'Login';
      submitBtn.textContent = 'Login';
      toggleText.textContent = "Don't have an account?";
      toggleModeBtn.textContent = 'Register here';
    } else {
      formTitle.textContent = 'Register';
      submitBtn.textContent = 'Register';
      toggleText.textContent = 'Already have an account?';
      toggleModeBtn.textContent = 'Login here';
    }
  }

  const modeParam = new URLSearchParams(window.location.search).get('mode');
  if (modeParam === 'register') {
    isLoginMode = false;
  }
  applyMode();

  // Helper function to show alerts
  function showAlert(message, type) {
    alertArea.textContent = message;
    alertArea.className = `alert alert-${type} mt-3`;
    alertArea.classList.remove('d-none');
  }

  // Helper function to hide alerts
  function hideAlert() {
    alertArea.classList.add('d-none');
    alertArea.textContent = '';
  }

  // Toggle between Login and Register modes
  toggleModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    applyMode();
    
    // Clear any existing alerts and inputs
    hideAlert();
    authForm.reset();
  });

  // Handle form submission
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable button and show loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    hideAlert();

    try {
      if (isLoginMode) {
        // Handle Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '../../index.html';
        }, 1000);

      } else {
        // Handle Registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        showAlert('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '../../index.html';
        }, 1000);
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      // Re-enable button on error
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});
