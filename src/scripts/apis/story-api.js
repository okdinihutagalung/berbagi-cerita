const BASE = 'https://story-api.dicoding.dev/v1';

export async function registerUser({name,email,password}){
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name,email,password})
  });
  return res.json();
}

export async function loginUser({email,password}){
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email,password})
  });
  return res.json();
}

// get stories (requires token)
export async function getStories({token, page=1, size=20, location=1}){
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const q = `?page=${page}&size=${size}&location=${location}`;
  const res = await fetch(`${BASE}/stories${q}`, { headers });
  return res.json();
}

// add story with multipart/form-data
export async function addStory({token, description, file, lat, lon}){
  const form = new FormData();
  form.append('description', description);
  if(file) form.append('photo', file);
  if(lat !== undefined) form.append('lat', String(lat));
  if(lon !== undefined) form.append('lon', String(lon));
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}/stories`, {
    method: 'POST',
    headers,
    body: form
  });
  return res.json();
}
