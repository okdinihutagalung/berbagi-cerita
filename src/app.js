import routes from './routes.js';
import { parseRequestURL } from './url-parser.js';
import { Auth } from './scripts/utils/auth.js';

const root = document.getElementById('main');
const authLinks = document.getElementById('auth-links');

function updateNav(){
  if(Auth.isLoggedIn()){
    const user = Auth.getUser();
    authLinks.innerHTML = `
      <span class="small">Hi, ${user?.name || 'User'}</span>
      <button id="logout-btn" aria-label="logout">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', ()=>{
      Auth.clear();
      navigateTo('/');
    });
  }else{
    authLinks.innerHTML = `<a href="#/login">Login</a> | <a href="#/register">Register</a>`;
  }
}

export async function navigateTo(path){
  location.hash = path;
}

async function router(){
  updateNav();
  const request = parseRequestURL();
  const parsedURL = (request.resource ? `/${request.resource}` : '/') || '/';
  const page = routes[parsedURL] || routes['/'];
  const updateDOM = async () => {
    root.innerHTML = await page.render();
    if(page.afterRender) await page.afterRender();
    root.focus();
  };

  if (!document.startViewTransition) {
    await updateDOM();
    return;
  }

  await document.startViewTransition(updateDOM).finished;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
