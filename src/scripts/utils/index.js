import Swal from 'sweetalert2';
import { API_CONFIG } from './config.js';

/**
 * Fungsi umum untuk melakukan HTTP Request ke API Story Dicoding
 * @param {string} endpoint - path endpoint (misal: '/login', '/register', '/stories')
 * @param {object} options - konfigurasi fetch (method, headers, body)
 * @returns {Promise<object>} hasil response JSON
 */
export async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Terjadi kesalahan pada server');
    }

    return result;
  } catch (error) {
    console.error('Request Error:', error.message);
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Simpan token autentikasi ke localStorage
 * @param {object} data - data login dari API
 */
export function saveAuth(data) {
  localStorage.setItem('auth', JSON.stringify(data));
}

/**
 * Ambil data autentikasi dari localStorage
 * @returns {object|null} data login user
 */
export function getAuth() {
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth) : null;
}

/**
 * Hapus data autentikasi
 */
export function clearAuth() {
  localStorage.removeItem('auth');
}

/**
 * Tampilkan notifikasi menggunakan SweetAlert2
 * @param {string} message - pesan yang akan ditampilkan
 * @param {'success'|'error'|'info'|'warning'} icon - jenis pesan
 */
export function showToast(message, icon = 'success') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

/**
 * Ubah tanggal ISO (API) menjadi format lokal yang mudah dibaca
 * @param {string} isoString - tanggal dari API
 * @returns {string} tanggal dalam format lokal
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}
