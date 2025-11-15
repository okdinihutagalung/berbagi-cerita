(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function o(t){if(t.ep)return;t.ep=!0;const e=n(t);fetch(t.href,e)}})();const w="https://story-api.dicoding.dev/v1";async function O({name:a,email:r,password:n}){return(await fetch(`${w}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a,email:r,password:n})})).json()}async function D({email:a,password:r}){return(await fetch(`${w}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:r})})).json()}async function A({token:a,page:r=1,size:n=20,location:o=1}){const t=a?{Authorization:`Bearer ${a}`}:{},e=`?page=${r}&size=${n}&location=${o}`;return(await fetch(`${w}/stories${e}`,{headers:t})).json()}async function $({token:a,description:r,file:n,lat:o,lon:t}){const e=new FormData;e.append("description",r),n&&e.append("photo",n),o!==void 0&&e.append("lat",String(o)),t!==void 0&&e.append("lon",String(t));const s=a?{Authorization:`Bearer ${a}`}:{};return(await fetch(`${w}/stories`,{method:"POST",headers:s,body:e})).json()}const b={getToken(){return localStorage.getItem("story_token")||null},setToken(a){localStorage.setItem("story_token",a)},clear(){localStorage.removeItem("story_token"),localStorage.removeItem("story_user")},setUser(a){localStorage.setItem("story_user",JSON.stringify(a))},getUser(){const a=localStorage.getItem("story_user");return a?JSON.parse(a):null},isLoggedIn(){return!!this.getToken()}},R="storyshare-db",N=1,h="stories",v="pendingStories";function E(){return new Promise((a,r)=>{const n=indexedDB.open(R,N);n.onupgradeneeded=o=>{const t=o.target.result;t.objectStoreNames.contains(h)||t.createObjectStore(h,{keyPath:"id"}),t.objectStoreNames.contains(v)||t.createObjectStore(v,{keyPath:"tempId",autoIncrement:!0})},n.onsuccess=()=>a(n.result),n.onerror=()=>r(n.error)})}async function q(a){const n=(await E()).transaction(h,"readwrite"),o=n.objectStore(h);return await Promise.all(a.map(t=>new Promise((e,s)=>{const c=o.put(t);c.onsuccess=()=>e(),c.onerror=()=>s(c.error)}))),n.complete}async function C(){const a=await E();return new Promise((r,n)=>{const e=a.transaction(h,"readonly").objectStore(h).getAll();e.onsuccess=()=>r(e.result||[]),e.onerror=()=>n(e.error)})}async function S(a){const r=await E();return new Promise((n,o)=>{const s=r.transaction(v,"readwrite").objectStore(v).add(a);s.onsuccess=()=>n(s.result),s.onerror=()=>o(s.error)})}const j={async render(){return`
      <section class="card" aria-labelledby="home-title">
        <h1 id="home-title">Cerita Terbaru</h1>
        <div class="toolbar">
          <label>
            <span class="small">Cari</span>
            <input id="search-stories" type="search" placeholder="Cari deskripsi atau nama" />
          </label>
          <label>
            <span class="small">Urutkan</span>
            <select id="sort-stories">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </label>
        </div>
        <div id="map" class="map" role="region" aria-label="Peta cerita"></div>
        <div id="stories" class="grid"></div>
      </section>
    `},async afterRender(){const a=b.getToken(),r=document.getElementById("map"),n=L.map(r).setView([0,0],2),o=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(n),t=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png");L.control.layers({OSM:o,Topo:t}).addTo(n);let e=[];try{const l=await A({token:a,location:1});e=(l==null?void 0:l.listStory)||[],e.length&&await q(e)}catch{e=await C()}const s=document.getElementById("stories");if(e.length===0){s.innerHTML='<p class="small">Belum ada story dengan lokasi. Coba login dan tambah story.</p>';return}s.innerHTML="";const c=document.getElementById("search-stories"),u=document.getElementById("sort-stories"),k=l=>{s.innerHTML="";const g=L.featureGroup().addTo(n);l.forEach(i=>{const d=document.createElement("article");if(d.className="card story-item",d.tabIndex=0,d.innerHTML=`
          <img src="${i.photoUrl}" alt="Foto cerita oleh ${i.name}" />
          <div>
            <h2>${i.name}</h2>
            <p class="small">${new Date(i.createdAt).toLocaleString()}</p>
            <p>${i.description.slice(0,140)}</p>
            <button data-id="${i.id}" class="view-btn">Detail</button>
          </div>
        `,s.appendChild(d),i.lat!==void 0&&i.lon!==void 0){const f=L.marker([i.lat,i.lon]).addTo(g);f.bindPopup(`<strong>${i.name}</strong><br/>${i.description}`),d.querySelector(".view-btn").addEventListener("click",()=>{f.openPopup(),n.setView([i.lat,i.lon],8,{animate:!0})}),d.addEventListener("keydown",y=>{y.key==="Enter"&&(f.openPopup(),n.setView([i.lat,i.lon],8))})}}),l.length&&n.fitBounds(g.getBounds(),{padding:[40,40]})},m=()=>{const l=(c.value||"").toLowerCase(),g=u.value;let i=e.filter(d=>`${d.name||""} ${d.description||""}`.toLowerCase().includes(l));i.sort((d,f)=>{const y=new Date(d.createdAt).getTime(),p=new Date(f.createdAt).getTime();return g==="oldest"?y-p:p-y}),k(i)};c&&u&&(c.addEventListener("input",m),u.addEventListener("change",m)),m()}},M={async render(){return`
      <section class="card" aria-labelledby="add-title">
        <h1 id="add-title">Tambah Story</h1>
        <form id="add-form" class="grid" novalidate>
          <div class="form-row">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="4" required></textarea>
          </div>
          <div class="form-row">
            <label for="photo">Foto (maks 1MB)</label>
            <input id="photo" name="photo" type="file" accept="image/*" />
            <div class="small"><button type="button" id="camera-btn">Gunakan Kamera</button></div>
            <video id="camera-stream" autoplay playsinline style="display:none;width:100%;max-height:240px;"></video>
            <canvas id="camera-canvas" style="display:none"></canvas>
          </div>
          <div class="form-row">
            <label>Pilih lokasi di Peta (opsional)</label>
            <div id="map-add" class="map"></div>
            <div class="small">Lat: <span id="lat">-</span> Lon: <span id="lon">-</span></div>
          </div>
          <div>
            <button id="submit-btn" type="submit">Kirim</button>
          </div>
        </form>
      </section>
    `},async afterRender(){const a=b.getToken(),r=L.map("map-add").setView([0,0],2);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(r);let n=null;const o=document.getElementById("lat"),t=document.getElementById("lon");r.on("click",m=>{const{lat:l,lng:g}=m.latlng;n?n.setLatLng([l,g]):n=L.marker([l,g]).addTo(r),o.textContent=l.toFixed(6),t.textContent=g.toFixed(6),o.dataset.value=l,t.dataset.value=g});const e=document.getElementById("camera-btn"),s=document.getElementById("camera-stream"),c=document.getElementById("camera-canvas");let u=null;e.addEventListener("click",async()=>{if(u){u.getTracks().forEach(m=>m.stop()),u=null,s.style.display="none",e.textContent="Gunakan Kamera";return}try{u=await navigator.mediaDevices.getUserMedia({video:!0}),s.srcObject=u,s.style.display="block",e.textContent="Tutup Kamera"}catch(m){alert("Tidak dapat mengakses kamera: "+m.message)}}),document.getElementById("add-form").addEventListener("submit",async m=>{m.preventDefault();const l=document.getElementById("description").value.trim();let i=document.getElementById("photo").files[0]||null;if(u&&s){c.width=s.videoWidth,c.height=s.videoHeight,c.getContext("2d").drawImage(s,0,0);const x=c.toDataURL("image/png");i=await(await fetch(x)).blob(),i=new File([i],"camera-capture.png",{type:"image/png"})}const d=o.dataset.value?Number(o.dataset.value):void 0,f=t.dataset.value?Number(t.dataset.value):void 0;if(!l){alert("Deskripsi wajib diisi");return}const y=document.getElementById("submit-btn");y.disabled=!0;try{if(!navigator.onLine)await S({description:l,lat:d,lon:f,createdAt:new Date().toISOString()}),alert("Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online."),location.hash="#/";else{const p=await $({token:a,description:l,file:i,lat:d,lon:f});p.error===!1?(alert("Story berhasil dibuat!"),location.hash="#/"):alert("Gagal: "+(p.message||JSON.stringify(p)))}}catch(p){navigator.onLine?alert("Error saat mengirim: "+p.message):(await S({description:l,lat:d,lon:f,createdAt:new Date().toISOString()}),alert("Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online."),location.hash="#/")}finally{y.disabled=!1,u&&(u.getTracks().forEach(p=>p.stop()),u=null)}})}},U={async render(){return`
      <section class="card">
        <h1>About</h1>
        <p>Demo aplikasi berbagi cerita - memenuhi kriteria Dicoding: SPA, Map, Add Data, Accessibility.</p>
        <p class="small">Author: Student</p>
      </section>
    `}},H={async render(){return`
      <section class="card" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>
        <form id="login-form">
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password</label><input id="password" type="password" required /></div>
          <div><button type="submit">Login</button></div>
        </form>
        <p class="small">Belum punya akun? <a href="#/register">Daftar</a></p>
      </section>
    `},async afterRender(){document.getElementById("login-form").addEventListener("submit",async r=>{var t;r.preventDefault();const n=document.getElementById("email").value,o=document.getElementById("password").value;try{const e=await D({email:n,password:o});e.error===!1&&((t=e.loginResult)!=null&&t.token)?(b.setToken(e.loginResult.token),b.setUser({name:e.loginResult.name,userId:e.loginResult.userId}),location.hash="#/"):alert("Login gagal: "+(e.message||"Cek kredensial"))}catch(e){alert("Error: "+e.message)}})}},_={async render(){return`
      <section class="card" aria-labelledby="reg-title">
        <h1 id="reg-title">Register</h1>
        <form id="reg-form">
          <div class="form-row"><label for="name">Nama</label><input id="name" type="text" required /></div>
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password (min 8)</label><input id="password" type="password" minlength="8" required /></div>
          <div><button type="submit">Daftar</button></div>
        </form>
      </section>
    `},async afterRender(){document.getElementById("reg-form").addEventListener("submit",async a=>{a.preventDefault();const r=document.getElementById("name").value.trim(),n=document.getElementById("email").value.trim(),o=document.getElementById("password").value;if(o.length<8){alert("Password minimal 8 karakter");return}try{const t=await O({name:r,email:n,password:o});t.error===!1?(alert("Akun berhasil dibuat. Silakan login."),location.hash="#/login"):alert("Gagal: "+t.message)}catch(t){alert("Error: "+t.message)}})}},I={"/":j,"/add":M,"/about":U,"/login":H,"/register":_},F=()=>{const r=(location.hash.slice(1).toLowerCase()||"/").split("/");return{resource:r[1]||null,id:r[2]||null,verb:r[3]||null}},T=document.getElementById("main"),B=document.getElementById("auth-links");function V(){if(b.isLoggedIn()){const a=b.getUser();B.innerHTML=`
      <span class="small">Hi, ${(a==null?void 0:a.name)||"User"}</span>
      <button id="logout-btn" aria-label="logout">Logout</button>
    `,document.getElementById("logout-btn").addEventListener("click",()=>{b.clear(),z("/")})}else B.innerHTML='<a href="#/login">Login</a> | <a href="#/register">Register</a>'}async function z(a){location.hash=a}async function P(){V();const a=F(),r=(a.resource?`/${a.resource}`:"/")||"/",n=I[r]||I["/"],o=async()=>{T.innerHTML=await n.render(),n.afterRender&&await n.afterRender(),T.focus()};if(!document.startViewTransition){await o();return}await document.startViewTransition(o).finished}window.addEventListener("hashchange",P);window.addEventListener("load",P);
