import { initPublicNavbarAuth } from '../../utils/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initPublicNavbarAuth({ logoutRedirectTo: './home.html' });
});
