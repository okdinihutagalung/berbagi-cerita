(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const t of r)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(r){const t={};return r.integrity&&(t.integrity=r.integrity),r.referrerPolicy&&(t.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?t.credentials="include":r.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(r){if(r.ep)return;r.ep=!0;const t=a(r);fetch(r.href,t)}})();const B="https://story-api.dicoding.dev/v1";async function q({name:e,email:n,password:a}){return(await fetch(`${B}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,email:n,password:a})})).json()}async function _({email:e,password:n}){return(await fetch(`${B}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:n})})).json()}async function M({token:e,page:n=1,size:a=20,location:o=1}){const r=e?{Authorization:`Bearer ${e}`}:{},t=`?page=${n}&size=${a}&location=${o}`;return(await fetch(`${B}/stories${t}`,{headers:r})).json()}async function N({token:e,description:n,file:a,lat:o,lon:r}){const t=new FormData;t.append("description",n),a&&t.append("photo",a),o!==void 0&&t.append("lat",String(o)),r!==void 0&&t.append("lon",String(r));const s=e?{Authorization:`Bearer ${e}`}:{};return(await fetch(`${B}/stories`,{method:"POST",headers:s,body:t})).json()}const y={getToken(){return localStorage.getItem("story_token")||null},setToken(e){localStorage.setItem("story_token",e)},clear(){localStorage.removeItem("story_token"),localStorage.removeItem("story_user")},setUser(e){localStorage.setItem("story_user",JSON.stringify(e))},getUser(){const e=localStorage.getItem("story_user");return e?JSON.parse(e):null},isLoggedIn(){return!!this.getToken()}},H="storyshare-db",U=2,E="stories",S="pendingStories",b="favorites";function w(){return new Promise((e,n)=>{const a=indexedDB.open(H,U);a.onupgradeneeded=o=>{const r=o.target.result;r.objectStoreNames.contains(E)||r.createObjectStore(E,{keyPath:"id"}),r.objectStoreNames.contains(S)||r.createObjectStore(S,{keyPath:"tempId",autoIncrement:!0}),r.objectStoreNames.contains(b)||r.createObjectStore(b,{keyPath:"id"})},a.onsuccess=()=>e(a.result),a.onerror=()=>n(a.error)})}async function F(e){const a=(await w()).transaction(E,"readwrite"),o=a.objectStore(E);return await Promise.all(e.map(r=>new Promise((t,s)=>{const c=o.put(r);c.onsuccess=()=>t(),c.onerror=()=>s(c.error)}))),a.complete}async function J(){const e=await w();return new Promise((n,a)=>{const t=e.transaction(E,"readonly").objectStore(E).getAll();t.onsuccess=()=>n(t.result||[]),t.onerror=()=>a(t.error)})}async function P(e){const n=await w();return new Promise((a,o)=>{const s=n.transaction(S,"readwrite").objectStore(S).add(e);s.onsuccess=()=>a(s.result),s.onerror=()=>o(s.error)})}async function V(){const e=await w();return new Promise((n,a)=>{const t=e.transaction(S,"readonly").objectStore(S).getAll();t.onsuccess=()=>n(t.result||[]),t.onerror=()=>a(t.error)})}async function z(e){const n=await w();return new Promise((a,o)=>{const s=n.transaction(S,"readwrite").objectStore(S).delete(e);s.onsuccess=()=>a(),s.onerror=()=>o(s.error)})}async function W(e){const n=await w();return new Promise((a,o)=>{const s=n.transaction(b,"readwrite").objectStore(b).put(e);s.onsuccess=()=>a(),s.onerror=()=>o(s.error)})}async function $(){const e=await w();return new Promise((n,a)=>{const t=e.transaction(b,"readonly").objectStore(b).getAll();t.onsuccess=()=>n(t.result||[]),t.onerror=()=>a(t.error)})}async function C(e){const n=await w();return new Promise((a,o)=>{const s=n.transaction(b,"readwrite").objectStore(b).delete(e);s.onsuccess=()=>a(),s.onerror=()=>o(s.error)})}async function G(){const e=await w();return new Promise((n,a)=>{const t=e.transaction(b,"readwrite").objectStore(b).clear();t.onsuccess=()=>n(),t.onerror=()=>a(t.error)})}const K={async render(){return`
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
    `},async afterRender(){const e=y.getToken(),n=document.getElementById("map"),a=L.map(n).setView([0,0],2),o=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(a),r=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png");L.control.layers({OSM:o,Topo:r}).addTo(a);let t=[];try{const l=await M({token:e,location:1});t=(l==null?void 0:l.listStory)||[],t.length&&await F(t)}catch{t=await J()}const s=await $(),c=new Set(s.map(l=>l.id)),u=document.getElementById("stories");if(t.length===0){u.innerHTML='<p class="small">Belum ada story dengan lokasi. Coba login dan tambah story.</p>';return}u.innerHTML="";const I=document.getElementById("search-stories"),g=document.getElementById("sort-stories"),f=l=>{u.innerHTML="";const k=L.featureGroup().addTo(a);l.forEach(i=>{const d=document.createElement("article");d.className="card story-item",d.tabIndex=0;const m=c.has(i.id);if(d.innerHTML=`
          <img src="${i.photoUrl}" alt="Foto cerita oleh ${i.name}" />
          <div>
            <h2>${i.name}</h2>
            <p class="small">${new Date(i.createdAt).toLocaleString()}</p>
            <p>${i.description.slice(0,140)}</p>
            <div class="actions">
              <button data-id="${i.id}" class="view-btn">Detail</button>
              <button data-id="${i.id}" class="bookmark-btn">${m?"Hapus Simpan":"Simpan"}</button>
            </div>
          </div>
        `,u.appendChild(d),i.lat!==void 0&&i.lon!==void 0){const p=L.marker([i.lat,i.lon]).addTo(k);p.bindPopup(`<strong>${i.name}</strong><br/>${i.description}`),d.querySelector(".view-btn").addEventListener("click",()=>{p.openPopup(),a.setView([i.lat,i.lon],8,{animate:!0})}),d.addEventListener("keydown",R=>{R.key==="Enter"&&(p.openPopup(),a.setView([i.lat,i.lon],8))})}const v=d.querySelector(".bookmark-btn");v&&v.addEventListener("click",async()=>{const p=i.id;c.has(p)?(await C(p),c.delete(p),v.textContent="Simpan"):(await W(i),c.add(p),v.textContent="Hapus Simpan")})}),l.length&&a.fitBounds(k.getBounds(),{padding:[40,40]})},h=()=>{const l=(I.value||"").toLowerCase(),k=g.value;let i=t.filter(d=>`${d.name||""} ${d.description||""}`.toLowerCase().includes(l));i.sort((d,m)=>{const v=new Date(d.createdAt).getTime(),p=new Date(m.createdAt).getTime();return k==="oldest"?v-p:p-v}),f(i)};I&&g&&(I.addEventListener("input",h),g.addEventListener("change",h)),h()}},Y={async render(){return`
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
    `},async afterRender(){const e=y.getToken(),n=L.map("map-add").setView([0,0],2);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(n);let a=null;const o=document.getElementById("lat"),r=document.getElementById("lon");n.on("click",g=>{const{lat:f,lng:h}=g.latlng;a?a.setLatLng([f,h]):a=L.marker([f,h]).addTo(n),o.textContent=f.toFixed(6),r.textContent=h.toFixed(6),o.dataset.value=f,r.dataset.value=h});const t=document.getElementById("camera-btn"),s=document.getElementById("camera-stream"),c=document.getElementById("camera-canvas");let u=null;t.addEventListener("click",async()=>{if(u){u.getTracks().forEach(g=>g.stop()),u=null,s.style.display="none",t.textContent="Gunakan Kamera";return}try{u=await navigator.mediaDevices.getUserMedia({video:!0}),s.srcObject=u,s.style.display="block",t.textContent="Tutup Kamera"}catch(g){alert("Tidak dapat mengakses kamera: "+g.message)}}),document.getElementById("add-form").addEventListener("submit",async g=>{g.preventDefault();const f=document.getElementById("description").value.trim();let l=document.getElementById("photo").files[0]||null;if(u&&s){c.width=s.videoWidth,c.height=s.videoHeight,c.getContext("2d").drawImage(s,0,0);const v=c.toDataURL("image/png");l=await(await fetch(v)).blob(),l=new File([l],"camera-capture.png",{type:"image/png"})}const k=o.dataset.value?Number(o.dataset.value):void 0,i=r.dataset.value?Number(r.dataset.value):void 0;if(!f){alert("Deskripsi wajib diisi");return}const d=document.getElementById("submit-btn");d.disabled=!0;try{if(!navigator.onLine)await P({description:f,lat:k,lon:i,createdAt:new Date().toISOString()}),alert("Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online."),location.hash="#/";else{const m=await N({token:e,description:f,file:l,lat:k,lon:i});m.error===!1?(alert("Story berhasil dibuat!"),location.hash="#/"):alert("Gagal: "+(m.message||JSON.stringify(m)))}}catch(m){navigator.onLine?alert("Error saat mengirim: "+m.message):(await P({description:f,lat:k,lon:i,createdAt:new Date().toISOString()}),alert("Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online."),location.hash="#/")}finally{d.disabled=!1,u&&(u.getTracks().forEach(m=>m.stop()),u=null)}})}},Q={async render(){return`
      <section class="card">
        <h1>About</h1>
        <p>Demo aplikasi berbagi cerita - memenuhi kriteria Dicoding: SPA, Map, Add Data, Accessibility.</p>
        <p class="small">Author: Student</p>
      </section>
    `}},X={async render(){return`
      <section class="card" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>
        <form id="login-form">
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password</label><input id="password" type="password" required /></div>
          <div><button type="submit">Login</button></div>
        </form>
        <p class="small">Belum punya akun? <a href="#/register">Daftar</a></p>
      </section>
    `},async afterRender(){document.getElementById("login-form").addEventListener("submit",async n=>{var r;n.preventDefault();const a=document.getElementById("email").value,o=document.getElementById("password").value;try{const t=await _({email:a,password:o});t.error===!1&&((r=t.loginResult)!=null&&r.token)?(y.setToken(t.loginResult.token),y.setUser({name:t.loginResult.name,userId:t.loginResult.userId}),location.hash="#/"):alert("Login gagal: "+(t.message||"Cek kredensial"))}catch(t){alert("Error: "+t.message)}})}},Z={async render(){return`
      <section class="card" aria-labelledby="reg-title">
        <h1 id="reg-title">Register</h1>
        <form id="reg-form">
          <div class="form-row"><label for="name">Nama</label><input id="name" type="text" required /></div>
          <div class="form-row"><label for="email">Email</label><input id="email" type="email" required /></div>
          <div class="form-row"><label for="password">Password (min 8)</label><input id="password" type="password" minlength="8" required /></div>
          <div><button type="submit">Daftar</button></div>
        </form>
      </section>
    `},async afterRender(){document.getElementById("reg-form").addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("name").value.trim(),a=document.getElementById("email").value.trim(),o=document.getElementById("password").value;if(o.length<8){alert("Password minimal 8 karakter");return}try{const r=await q({name:n,email:a,password:o});r.error===!1?(alert("Akun berhasil dibuat. Silakan login."),location.hash="#/login"):alert("Gagal: "+r.message)}catch(r){alert("Error: "+r.message)}})}},ee={async render(){return`
      <section class="card" aria-labelledby="saved-title">
        <h1 id="saved-title">Story Tersimpan (Bookmark)</h1>
        <p class="small">Halaman ini menampilkan daftar story yang kamu simpan secara manual ke IndexedDB.</p>
        <div class="toolbar">
          <button type="button" id="clear-saved">Hapus Semua</button>
        </div>
        <div id="saved-list" class="grid"></div>
      </section>
    `},async afterRender(){const e=document.getElementById("saved-list"),n=document.getElementById("clear-saved"),a=async()=>{const o=await $();if(!o.length){e.innerHTML='<p class="small">Belum ada story tersimpan. Buka halaman Home lalu gunakan tombol Simpan pada story yang ingin kamu bookmark.</p>';return}e.innerHTML="",o.forEach(r=>{const t=document.createElement("article");t.className="card story-item",t.innerHTML=`
          <div>
            <h2>${r.name||"Tanpa nama"}</h2>
            <p class="small">${new Date(r.createdAt).toLocaleString()}</p>
            <p>${(r.description||"").slice(0,160)}</p>
            <button type="button" data-id="${r.id}" class="delete-saved">Hapus</button>
          </div>
        `,e.appendChild(t)}),e.querySelectorAll(".delete-saved").forEach(r=>{r.addEventListener("click",async()=>{const t=r.getAttribute("data-id");await C(t),await a()})})};n&&n.addEventListener("click",async()=>{confirm("Hapus semua story tersimpan dari IndexedDB?")&&(await G(),await a())}),await a()}},x={"/":K,"/add":Y,"/about":Q,"/login":X,"/register":Z,"/saved":ee},te=()=>{const n=(location.hash.slice(1).toLowerCase()||"/").split("/");return{resource:n[1]||null,id:n[2]||null,verb:n[3]||null}},A=document.getElementById("main"),O=document.getElementById("auth-links");function ne(){if(y.isLoggedIn()){const e=y.getUser();O.innerHTML=`
      <span class="small">Hi, ${(e==null?void 0:e.name)||"User"}</span>
      <button id="logout-btn" aria-label="logout">Logout</button>
    `,document.getElementById("logout-btn").addEventListener("click",()=>{y.clear(),ae("/")})}else O.innerHTML='<a href="#/login">Login</a> | <a href="#/register">Register</a>'}async function ae(e){location.hash=e}async function j(){ne();const e=te(),n=(e.resource?`/${e.resource}`:"/")||"/",a=x[n]||x["/"],o=async()=>{A.innerHTML=await a.render(),a.afterRender&&await a.afterRender(),A.focus()};if(!document.startViewTransition){await o();return}await document.startViewTransition(o).finished}window.addEventListener("hashchange",j);window.addEventListener("load",j);const re="BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";function oe(e){const n="=".repeat((4-e.length%4)%4),a=(e+n).replace(/-/g,"+").replace(/_/g,"/"),o=window.atob(a),r=new Uint8Array(o.length);for(let t=0;t<o.length;t++)r[t]=o.charCodeAt(t);return r}async function se(){return"Notification"in window?await Notification.requestPermission()==="granted":!1}async function T(){return"serviceWorker"in navigator?await navigator.serviceWorker.getRegistration():null}async function ie(){var s,c;if(!await se())return null;const n=await T();if(!n)return null;const a=await n.pushManager.getSubscription();if(a)return a;const o=y.getToken();if(!o)return null;const r=await n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:oe(re)}),t=r.toJSON();return await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({endpoint:t.endpoint,keys:{p256dh:(s=t.keys)==null?void 0:s.p256dh,auth:(c=t.keys)==null?void 0:c.auth}})}),r}async function ce(){const e=await T();if(!e)return!1;const n=await e.pushManager.getSubscription();if(!n)return!1;const a=n.toJSON();return await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${y.getToken()}`},body:JSON.stringify({endpoint:a.endpoint})}),await n.unsubscribe(),!0}async function D(){const e=await T();return e?!!await e.pushManager.getSubscription():!1}"serviceWorker"in navigator&&(window.addEventListener("load",()=>{navigator.serviceWorker.register("./service-worker.js").catch(()=>{})}),navigator.serviceWorker.addEventListener("message",e=>{const n=e.data||{};n.type==="OPEN_URL"&&n.url&&(n.url.startsWith("#")?location.hash=n.url:location.href=n.url)}));window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),window.__deferredPrompt=e;const n=document.getElementById("install-btn");n&&(n.hidden=!1)});window.addEventListener("DOMContentLoaded",async()=>{const e=document.getElementById("install-btn"),n=document.getElementById("push-toggle");if(e&&e.addEventListener("click",async()=>{const a=window.__deferredPrompt;a&&(a.prompt(),await a.userChoice,window.__deferredPrompt=null,e.hidden=!0)}),n){const a=async()=>{const o=await D();n.textContent=o?"Matikan Notifikasi":"Aktifkan Notifikasi",n.hidden=!1};await a(),n.addEventListener("click",async()=>{await D()?await ce():await ie(),await a()})}window.addEventListener("online",async()=>{const a=await V();if(!a.length)return;const o=y.getToken();for(const r of a)try{await N({token:o,description:r.description,file:null,lat:r.lat,lon:r.lon}),await z(r.tempId)}catch{}})});
