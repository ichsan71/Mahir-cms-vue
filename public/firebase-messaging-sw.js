/* eslint-disable no-undef */
// Service worker Firebase Cloud Messaging — menangani notifikasi saat aplikasi
// di background / tab tidak fokus. File ini disajikan di root (/firebase-messaging-sw.js).
//
// Config di-hardcode karena service worker tidak bisa membaca import.meta.env.
// Konfigurasi web Firebase bukan rahasia, tapi HARUS sama dengan nilai di .env.
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDZdjW93QlSR4wt6_2BQSPIPC1ma48YgcQ",
  authDomain: "mstore-a027f.firebaseapp.com",
  projectId: "mstore-a027f",
  storageBucket: "mstore-a027f.firebasestorage.app",
  messagingSenderId: "597333971164",
  appId: "1:597333971164:web:0d32fa59a7548fd9efa419",
  measurementId: "G-872MKDDS1J",
});

const messaging = firebase.messaging();

// Tampilkan notifikasi untuk pesan data-only saat background. Bila backend
// mengirim payload `notification`, browser menampilkannya otomatis — agar tidak
// dobel, backend sebaiknya mengirim data-only untuk web.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "MAHIR";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Fokuskan/buka aplikasi saat notifikasi diklik.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
