import { loginUser } from '../apis/story-api.js';
import { Auth } from '../utils/auth.js';

const LoginPage = {
  async render(){
    return `
      <section class="card" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>
        <form id="login-form">
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password</label><input id="password" type="password" required /></div>
          <div><button type="submit">Login</button></div>
        </form>
        <p class="small">Belum punya akun? <a href="#/register">Daftar</a></p>
      </section>
    `;
  },
  async afterRender(){
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try{
        const res = await loginUser({email,password});
        if(res.error === false && res.loginResult?.token){
          Auth.setToken(res.loginResult.token);
          Auth.setUser({name:res.loginResult.name, userId: res.loginResult.userId});
          location.hash = '#/';
        } else {
          alert('Login gagal: ' + (res.message || 'Cek kredensial'));
        }
      }catch(err){
        alert('Error: ' + err.message);
      }
    });
  }
};

export default LoginPage;
