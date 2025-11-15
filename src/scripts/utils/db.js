const DB_NAME = 'storyshare-db';
const DB_VERSION = 1;
const STORIES_STORE = 'stories';
const PENDING_STORE = 'pendingStories';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'tempId', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStories(list) {
  const db = await openDB();
  const tx = db.transaction(STORIES_STORE, 'readwrite');
  const store = tx.objectStore(STORIES_STORE);
  await Promise.all(list.map((item) => new Promise((resolve, reject) => {
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  })));
  return tx.complete;
}

export async function getAllStories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORIES_STORE, 'readonly');
    const store = tx.objectStore(STORIES_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteStory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORIES_STORE, 'readwrite');
    const store = tx.objectStore(STORIES_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORIES_STORE, 'readwrite');
    const store = tx.objectStore(STORIES_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function addPendingStory(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_STORE);
    const req = store.add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingStories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, 'readonly');
    const store = tx.objectStore(PENDING_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePendingStory(tempId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_STORE);
    const req = store.delete(tempId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
