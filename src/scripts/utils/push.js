import { Auth } from './auth.js';

// VAPID public key dari dokumentasi REST API Dicoding
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function askNotificationPermission() {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function getSWRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg;
}

export async function subscribePush() {
  const granted = await askNotificationPermission();
  if (!granted) return null;

  const registration = await getSWRegistration();
  if (!registration) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const token = Auth.getToken();
  if (!token) return null;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const json = subscription.toJSON();

  await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
    }),
  });

  return subscription;
}

export async function unsubscribePush() {
  const registration = await getSWRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return false;
  const json = subscription.toJSON();

  await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Auth.getToken()}`,
    },
    body: JSON.stringify({
      endpoint: json.endpoint,
    }),
  });

  await subscription.unsubscribe();
  return true;
}

export async function isSubscribed() {
  const registration = await getSWRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
