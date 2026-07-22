<script setup>
// Pemilih alamat berbasis Google Maps (API generasi baru):
// - Pencarian: PlaceAutocompleteElement (pengganti places.Autocomplete lama).
// - Marker: AdvancedMarkerElement draggable (pengganti Marker lama).
// Setiap interaksi mengisi field alamat (line1, city, state, country) + lat/long
// via reverse-geocode.
import { ref, onMounted, onBeforeUnmount } from "vue";
import { loadGoogleMaps } from "@/shared/composables/useGoogleMapsLoader";
import { MapPinIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  // Objek alamat: { line1, line2, city, state, country, latitude, longitude }
  modelValue: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue"]);

// Jakarta sebagai titik awal bila alamat belum punya koordinat.
const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

const mapEl = ref(null);
const searchWrap = ref(null);
const errorMsg = ref("");
const ready = ref(false);

let map = null;
let marker = null;
let geocoder = null;
let autocompleteEl = null;

// Baca lat/lng dari objek LatLng (fungsi) maupun LatLngLiteral (angka).
function coord(v) {
  if (!v) return null;
  const lat = typeof v.lat === "function" ? v.lat() : v.lat;
  const lng = typeof v.lng === "function" ? v.lng() : v.lng;
  return { lat, lng };
}

// Ambil satu komponen alamat; dukung format Geocoder (long_name) & Place baru (longText).
function pick(components = [], type) {
  const c = components.find((x) => (x.types || []).includes(type));
  if (!c) return "";
  return c.long_name ?? c.longText ?? "";
}

// Komponen kota/provinsi/negara (line1 diisi dari alamat lengkap, bukan dari sini).
function parseComponents(components = []) {
  const city = pick(components, "locality") || pick(components, "administrative_area_level_2");
  const state = pick(components, "administrative_area_level_1");
  const country = pick(components, "country");
  return { city, state, country };
}

// Kirim gabungan alamat baru ke parent (pertahankan line2 yang diisi manual).
function commit(partial) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function moveTo(lat, lng, zoom) {
  const pos = { lat, lng };
  if (marker) marker.setPosition(pos);
  map.panTo(pos);
  if (zoom) map.setZoom(zoom);
}

// Reverse-geocode koordinat → isi line1 (alamat lengkap) + kota/provinsi/negara.
function reverseGeocode(lat, lng) {
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK" && results?.[0]) {
      commit({
        line1: results[0].formatted_address,
        ...parseComponents(results[0].address_components),
        latitude: lat,
        longitude: lng,
      });
    }
  });
}

// Debounce reverse-geocode agar tidak menembak API tiap kali marker digeser/diklik.
let geocodeTimer = null;
function scheduleReverse(lat, lng) {
  clearTimeout(geocodeTimer);
  geocodeTimer = setTimeout(() => reverseGeocode(lat, lng), 600);
}

async function onPlaceSelect(event) {
  try {
    // Versi baru: event.placePrediction → toPlace(); fallback event.place.
    const place = event.placePrediction ? event.placePrediction.toPlace() : event.place;
    if (!place) return;
    await place.fetchFields({ fields: ["location", "addressComponents", "formattedAddress"] });
    const c = coord(place.location);
    if (!c) return;
    moveTo(c.lat, c.lng, 16);
    // Alamat yang dipilih dari pencarian → line1.
    commit({
      line1: place.formattedAddress,
      ...parseComponents(place.addressComponents),
      latitude: c.lat,
      longitude: c.lng,
    });
  } catch {
    /* abaikan pilihan yang tidak lengkap */
  }
}

async function init() {
  try {
    const google = await loadGoogleMaps();
    const { Map } = await google.maps.importLibrary("maps");
    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

    const c = coord(props.modelValue);
    const hasCoord = c && Number.isFinite(c.lat) && Number.isFinite(c.lng);
    const center = hasCoord ? c : DEFAULT_CENTER;

    map = new Map(mapEl.value, {
      center,
      zoom: hasCoord ? 16 : 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Marker klasik (cukup API key, tanpa Map ID).
    marker = new google.maps.Marker({ map, position: center, draggable: true });
    geocoder = new google.maps.Geocoder();

    // Geser marker → koordinat update langsung, alamat menyusul (debounce).
    marker.addListener("dragend", (e) => {
      const p = coord(e.latLng);
      if (!p) return;
      commit({ latitude: p.lat, longitude: p.lng });
      scheduleReverse(p.lat, p.lng);
    });

    // Klik peta → pindahkan marker ke titik itu.
    map.addListener("click", (e) => {
      const p = coord(e.latLng);
      if (!p) return;
      moveTo(p.lat, p.lng);
      commit({ latitude: p.lat, longitude: p.lng });
      scheduleReverse(p.lat, p.lng);
    });

    // Pencarian alamat (PlaceAutocompleteElement — web component).
    autocompleteEl = new PlaceAutocompleteElement();
    autocompleteEl.style.width = "100%";
    searchWrap.value.appendChild(autocompleteEl);
    autocompleteEl.addEventListener("gmp-select", onPlaceSelect);

    ready.value = true;
  } catch (e) {
    errorMsg.value = e?.message || "Gagal memuat Google Maps.";
  }
}

onMounted(init);
onBeforeUnmount(() => {
  clearTimeout(geocodeTimer);
  if (autocompleteEl) autocompleteEl.removeEventListener("gmp-select", onPlaceSelect);
  if (window.google?.maps?.event) {
    if (map) window.google.maps.event.clearInstanceListeners(map);
    if (marker) window.google.maps.event.clearInstanceListeners(marker);
  }
});
</script>

<template>
  <div class="space-y-2">
    <!-- Search alamat (PlaceAutocompleteElement disisipkan ke sini) -->
    <div v-show="!errorMsg" ref="searchWrap" class="gmp-search"></div>

    <!-- Frame peta / fallback -->
    <div class="relative overflow-hidden rounded-lg border border-mahir-border">
      <div ref="mapEl" class="h-64 w-full bg-slate-100"></div>

      <div
        v-if="errorMsg"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 p-4 text-center"
      >
        <ExclamationTriangleIcon class="h-6 w-6 text-amber-500" />
        <p class="text-xs font-medium text-slate-600">{{ errorMsg }}</p>
        <p class="text-[11px] text-slate-400">Anda tetap bisa mengisi alamat secara manual di bawah.</p>
      </div>

      <div
        v-else-if="!ready"
        class="absolute inset-0 flex items-center justify-center bg-slate-50 text-xs text-slate-400"
      >
        Memuat peta…
      </div>
    </div>

    <p v-if="ready" class="flex items-center gap-1 text-[11px] text-slate-400">
      <MapPinIcon class="h-3.5 w-3.5" /> Geser marker atau klik peta untuk menyesuaikan titik lokasi.
    </p>
  </div>
</template>

<style scoped>
/* Selaraskan lebar web component pencarian dengan lebar form,
   dan paksa skema light agar background item dropdown tetap normal (putih). */
.gmp-search :deep(gmp-place-autocomplete) {
  width: 100%;
  color-scheme: light;
}
</style>
