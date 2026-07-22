import { Loader } from "@googlemaps/js-api-loader";

// Loader Google Maps JS API sebagai singleton.
// Key dibaca dari VITE_GOOGLE_MAPS_API_KEY (isi di .env, lalu restart dev server).
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loaderPromise = null;

/**
 * Memuat Google Maps JS API (+ library places) sekali saja.
 * @returns {Promise<typeof google>} objek `google` global setelah siap.
 * @throws bila VITE_GOOGLE_MAPS_API_KEY belum diisi.
 */
export function loadGoogleMaps() {
  if (!apiKey) {
    return Promise.reject(
      new Error("API KEY belum diisi. Tambahkan key di .env lalu restart dev server."),
    );
  }
  if (!loaderPromise) {
    const loader = new Loader({ apiKey, version: "weekly", libraries: ["places"] });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

export const hasGoogleMapsKey = !!apiKey;
