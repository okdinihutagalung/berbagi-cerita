import { getStories } from '../apis/story-api.js';
import { Auth } from '../utils/auth.js';
import { saveStories, getAllStories } from '../utils/db.js';

const HomePage = {
  async render(){
    return `
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
    `;
  },
  async afterRender(){
    const token = Auth.getToken();
    const mapEl = document.getElementById('map');
    // init map
    const map = L.map(mapEl).setView([0,0], 2);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
    L.control.layers({OSM:osm, Topo:topo}).addTo(map);

    let list = [];
    try{
      const res = await getStories({token, location:1});
      list = res?.listStory || [];
      if(list.length){
        await saveStories(list);
      }
    }catch(e){
      list = await getAllStories();
    }
    const listEl = document.getElementById('stories');
    if(list.length === 0){
      listEl.innerHTML = '<p class="small">Belum ada story dengan lokasi. Coba login dan tambah story.</p>';
      return;
    }
    listEl.innerHTML = '';
    const searchInput = document.getElementById('search-stories');
    const sortSelect = document.getElementById('sort-stories');

    const renderList = (items) => {
      listEl.innerHTML = '';
      const group = L.featureGroup().addTo(map);
      items.forEach(st => {
        const item = document.createElement('article');
        item.className = 'card story-item';
        item.tabIndex = 0;
        item.innerHTML = `
          <img src="${st.photoUrl}" alt="Foto cerita oleh ${st.name}" />
          <div>
            <h2>${st.name}</h2>
            <p class="small">${new Date(st.createdAt).toLocaleString()}</p>
            <p>${st.description.slice(0,140)}</p>
            <button data-id="${st.id}" class="view-btn">Detail</button>
          </div>
        `;
        listEl.appendChild(item);

        if(st.lat !== undefined && st.lon !== undefined){
          const marker = L.marker([st.lat, st.lon]).addTo(group);
          marker.bindPopup(`<strong>${st.name}</strong><br/>${st.description}`);
          item.querySelector('.view-btn').addEventListener('click', ()=>{
            marker.openPopup();
            map.setView([st.lat, st.lon], 8, {animate:true});
          });
          item.addEventListener('keydown', (e)=>{
            if(e.key === 'Enter') { marker.openPopup(); map.setView([st.lat, st.lon], 8); }
          });
        }
      });
      if(items.length){
        map.fitBounds(group.getBounds(), {padding:[40,40]});
      }
    };

    const applyFilter = () => {
      const q = (searchInput.value || '').toLowerCase();
      const sort = sortSelect.value;
      let filtered = list.filter((st)=>{
        const text = `${st.name || ''} ${st.description || ''}`.toLowerCase();
        return text.includes(q);
      });
      filtered.sort((a,b)=>{
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        return sort === 'oldest' ? at - bt : bt - at;
      });
      renderList(filtered);
    };

    if(searchInput && sortSelect){
      searchInput.addEventListener('input', applyFilter);
      sortSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
};

export default HomePage;
