import HomePage from './scripts/pages/home-page.js';
import AddPage from './scripts/pages/add-page.js';
import AboutPage from './scripts/pages/about-page.js';
import LoginPage from './scripts/pages/login-page.js';
import RegisterPage from './scripts/pages/register-page.js';

const routes = {
  '/': HomePage,
  '/add': AddPage,
  '/about': AboutPage,
  '/login': LoginPage,
  '/register': RegisterPage
};

export default routes;
