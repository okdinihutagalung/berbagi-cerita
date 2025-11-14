import '../styles/styles.css';
import '../app.js';
import { subscribePush, unsubscribePush, isSubscribed } from './utils/push.js';
import { getPendingStories, deletePendingStory } from './utils/db.js';
import { addStory } from './apis/story-api.js';
import { Auth } from './utils/auth.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'OPEN_URL' && data.url) {
      if (data.url.startsWith('#')) {
        location.hash = data.url;
      } else {
        location.href = data.url;
      }
    }
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__deferredPrompt = event;
  const btn = document.getElementById('install-btn');
  if (btn) btn.hidden = false;
});

window.addEventListener('DOMContentLoaded', async () => {
  const installBtn = document.getElementById('install-btn');
  const pushToggle = document.getElementById('push-toggle');

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      const promptEvent = window.__deferredPrompt;
      if (!promptEvent) return;
      promptEvent.prompt();
      await promptEvent.userChoice;
      window.__deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  if (pushToggle) {
    const updateLabel = async () => {
      const active = await isSubscribed();
      pushToggle.textContent = active ? 'Matikan Notifikasi' : 'Aktifkan Notifikasi';
      pushToggle.hidden = false;
    };
    await updateLabel();

    pushToggle.addEventListener('click', async () => {
      const active = await isSubscribed();
      if (active) {
        await unsubscribePush();
      } else {
        await subscribePush();
      }
      await updateLabel();
    });
  }

  // Sync story yang dibuat saat offline ketika koneksi kembali online
  window.addEventListener('online', async () => {
    const pending = await getPendingStories();
    if (!pending.length) return;
    const token = Auth.getToken();
    for (const item of pending) {
      try {
        await addStory({
          token,
          description: item.description,
          file: null,
          lat: item.lat,
          lon: item.lon,
        });
        await deletePendingStory(item.tempId);
      } catch (_) {
        // jika gagal, biarkan tetap di pending
      }
    }
  });
});
