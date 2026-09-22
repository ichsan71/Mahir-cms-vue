// Integrasi Firebase Cloud Messaging (push notification) sisi aplikasi.
// - requestFcmToken(): minta izin notifikasi, daftarkan service worker, ambil FCM token.
// - onForegroundMessage(): tangani pesan saat aplikasi sedang aktif (foreground).
//
// Konfigurasi dibaca dari env (VITE_FIREBASE_*). VAPID key WAJIB diisi
// (VITE_FIREBASE_VAPID_KEY) agar token bisa diambil di web.
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app = null;
let foregroundBound = false;

// Instance messaging (null bila browser tidak mendukung atau config kosong).
async function getMessagingInstance() {
  try {
    if (!firebaseConfig.apiKey) return null;
    if (!(await isSupported())) return null;
    if (!app) app = initializeApp(firebaseConfig);
    return getMessaging(app);
  } catch (e) {
    console.warn("[FCM] Gagal inisialisasi messaging:", e);
    return null;
  }
}

// Minta izin notifikasi + ambil FCM token. Mengembalikan token (String) atau null
// (browser tak didukung, izin ditolak, VAPID kosong, atau error).
export async function requestFcmToken() {
  try {
    if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    if (!VAPID_KEY) {
      console.warn("[FCM] VITE_FIREBASE_VAPID_KEY belum diisi — token tidak bisa diambil.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (e) {
    console.warn("[FCM] Gagal mengambil token:", e);
    return null;
  }
}

// Daftarkan handler pesan foreground (hanya sekali). `handler(payload)`.
export async function onForegroundMessage(handler) {
  if (foregroundBound) return;
  const messaging = await getMessagingInstance();
  if (!messaging) return;
  onMessage(messaging, handler);
  foregroundBound = true;
}
