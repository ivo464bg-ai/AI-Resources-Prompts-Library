// Login Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerBtn = document.getElementById('registerBtn');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', { email, password });
    // TODO: Implement Supabase Auth login
    
    // Simulate successful login and redirect
    window.location.href = '../dashboard/dashboard.html';
  });

  registerBtn.addEventListener('click', () => {
    console.log('Register button clicked');
    // TODO: Implement Supabase Auth registration or toggle to register form
  });
});
