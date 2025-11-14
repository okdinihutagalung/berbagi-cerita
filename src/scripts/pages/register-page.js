import { registerUser } from '../apis/story-api.js';

const RegisterPage = {
  async render(){
    return `
      <section class="card" aria-labelledby="reg-title">
        <h1 id="reg-title">Register</h1>
        <form id="reg-form">
          <div class="form-row"><label for="name">Nama</label><input id="name" type="text" required /></div>
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password (min 8)</label><input id="password" type="password" minlength="8" required /></div>
          <div><button type="submit">Daftar</button></div>
        </form>
      </section>
    `;
  },
  async afterRender(){
    document.getElementById('reg-form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      if(password.length < 8){ alert('Password minimal 8 karakter'); return; }
      try{
        const res = await registerUser({name,email,password});
        if(res.error === false){
          alert('Akun berhasil dibuat. Silakan login.');
          location.hash = '#/login';
        } else {
          alert('Gagal: ' + res.message);
        }
      }catch(err){
        alert('Error: ' + err.message);
      }
    });
  }
};

export default RegisterPage;
