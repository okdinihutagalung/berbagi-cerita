import { addStory } from '../apis/story-api.js';
import { Auth } from '../utils/auth.js';
import { addPendingStory } from '../utils/db.js';

const AddPage = {
  async render(){
    return `
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
    `;
  },
  async afterRender(){
    const token = Auth.getToken();
    const map = L.map('map-add').setView([0,0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    let marker = null;
    const latEl = document.getElementById('lat');
    const lonEl = document.getElementById('lon');

    map.on('click', (e)=>{
      const {lat,lng} = e.latlng;
      if(marker) marker.setLatLng([lat,lng]);
      else marker = L.marker([lat,lng]).addTo(map);
      latEl.textContent = lat.toFixed(6);
      lonEl.textContent = lng.toFixed(6);
      latEl.dataset.value = lat;
      lonEl.dataset.value = lng;
    });

    // camera
    const cameraBtn = document.getElementById('camera-btn');
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    let stream = null;
    cameraBtn.addEventListener('click', async ()=>{
      if(stream){
        // stop
        stream.getTracks().forEach(t=>t.stop());
        stream = null; video.style.display='none'; cameraBtn.textContent='Gunakan Kamera';
        return;
      }
      try{
        stream = await navigator.mediaDevices.getUserMedia({video:true});
        video.srcObject = stream; video.style.display='block'; cameraBtn.textContent='Tutup Kamera';
      }catch(err){
        alert('Tidak dapat mengakses kamera: '+err.message);
      }
    });

    // submit
    const form = document.getElementById('add-form');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const desc = document.getElementById('description').value.trim();
      const fileInput = document.getElementById('photo');
      let file = fileInput.files[0] || null;

      // if camera active, capture to blob
      if(stream && video){
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        // convert to blob
        const res = await fetch(dataUrl);
        file = await res.blob();
        // name the file
        file = new File([file], 'camera-capture.png', {type:'image/png'});
      }

      const lat = latEl.dataset.value ? Number(latEl.dataset.value) : undefined;
      const lon = lonEl.dataset.value ? Number(lonEl.dataset.value) : undefined;

      if(!desc){
        alert('Deskripsi wajib diisi');
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      try{
        if(!navigator.onLine){
          await addPendingStory({ description: desc, lat, lon, createdAt: new Date().toISOString() });
          alert('Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online.');
          location.hash = '#/';
        } else {
          const result = await addStory({
            token,
            description: desc,
            file,
            lat, lon
          });
          if(result.error === false){
            alert('Story berhasil dibuat!');
            location.hash = '#/';
          } else {
            alert('Gagal: ' + (result.message || JSON.stringify(result)));
          }
        }
      }catch(err){
        if(!navigator.onLine){
          await addPendingStory({ description: desc, lat, lon, createdAt: new Date().toISOString() });
          alert('Anda sedang offline. Story disimpan dan akan dikirim saat koneksi kembali online.');
          location.hash = '#/';
        } else {
          alert('Error saat mengirim: ' + err.message);
        }
      }finally{
        submitBtn.disabled = false;
        if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
      }
    });
  }
};

export default AddPage;
