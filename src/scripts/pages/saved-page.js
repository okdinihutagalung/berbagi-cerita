import { getAllStories, deleteStory, clearStories } from '../utils/db.js';

const SavedPage = {
  async render(){
    return `
      <section class="card" aria-labelledby="saved-title">
        <h1 id="saved-title">Story Tersimpan (Offline)</h1>
        <p class="small">Halaman ini menampilkan data story yang tersimpan di IndexedDB untuk penggunaan offline.</p>
        <div class="toolbar">
          <button type="button" id="clear-saved">Hapus Semua</button>
        </div>
        <div id="saved-list" class="grid"></div>
      </section>
    `;
  },
  async afterRender(){
    const listEl = document.getElementById('saved-list');
    const clearBtn = document.getElementById('clear-saved');

    const renderList = async () => {
      const list = await getAllStories();
      if (!list.length) {
        listEl.innerHTML = '<p class="small">Belum ada story tersimpan. Buka halaman Home saat online untuk menyimpan data ke IndexedDB.</p>';
        return;
      }
      listEl.innerHTML = '';
      list.forEach((st) => {
        const item = document.createElement('article');
        item.className = 'card story-item';
        item.innerHTML = `
          <div>
            <h2>${st.name || 'Tanpa nama'}</h2>
            <p class="small">${new Date(st.createdAt).toLocaleString()}</p>
            <p>${(st.description || '').slice(0, 160)}</p>
            <button type="button" data-id="${st.id}" class="delete-saved">Hapus</button>
          </div>
        `;
        listEl.appendChild(item);
      });

      listEl.querySelectorAll('.delete-saved').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await deleteStory(id);
          await renderList();
        });
      });
    };

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        if (!confirm('Hapus semua story tersimpan dari IndexedDB?')) return;
        await clearStories();
        await renderList();
      });
    }

    await renderList();
  }
};

export default SavedPage;
