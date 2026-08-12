<script setup>
// Modal absen (check-in / check-out): menampilkan peta Google Maps di titik GPS
// saat ini + alamat (reverse-geocode) + status jarak terhadap area kantor
// (geofence radius = distanceTolerance cabang). Ada foto selfie opsional & catatan.
// Submit hanya aktif bila berada di dalam radius kantor.
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import {
  XMarkIcon,
  ArrowPathIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { loadGoogleMaps, hasGoogleMapsKey } from "@/shared/composables/useGoogleMapsLoader";
import {
  useCheckIn,
  distanceMeters,
  geoErrorMessage,
} from "../composables/useCheckIn";

const props = defineProps({
  open: { type: Boolean, default: false },
  // "IN" = check-in, "OUT" = check-out.
  type: { type: String, default: "IN" },
});
const emit = defineEmits(["update:open", "submitted"]);

const { getPosition, fetchBranchContext, submitLog, submitting } = useCheckIn();

const mapEl = ref(null);

const locating = ref(false);
const locationError = ref("");
const mapError = ref("");
const position = ref(null); // { latitude, longitude, accuracy }
const branch = ref(null); // { latitude, longitude, distanceTolerance }
const address = ref("");
const distance = ref(null); // meter dari kantor

const note = ref("");
const imageFile = ref(null);
const imagePreview = ref("");

// Kamera langsung (getUserMedia) untuk selfie.
const videoEl = ref(null);
const cameraOn = ref(false);
const cameraError = ref("");
let stream = null;

let map = null;
let geocoder = null;
let myMarker = null;
let branchMarker = null;
let circle = null;

const isCheckIn = computed(() => props.type === "IN");
const title = computed(() => (isCheckIn.value ? "Check In" : "Check Out"));

const withinRange = computed(() => {
  if (!branch.value || distance.value == null) return false;
  return distance.value <= branch.value.distanceTolerance;
});

const canSubmit = computed(
  () => !locating.value && !submitting.value && !locationError.value && withinRange.value,
);

const distanceLabel = computed(() =>
  distance.value == null ? "—" : `${Math.round(distance.value)} m`,
);

// ── Foto selfie (opsional) ─────────────────────────────────────────────
function setImage(file) {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imageFile.value = file;
  imagePreview.value = file ? URL.createObjectURL(file) : "";
}
function clearImage() {
  setImage(null);
}

// Minta izin & nyalakan kamera (depan) untuk selfie.
async function startCamera() {
  cameraError.value = "";
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = "Kamera tidak didukung browser ini. Gunakan pilih file.";
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    cameraOn.value = true;
    await nextTick();
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      await videoEl.value.play().catch(() => {});
    }
  } catch (e) {
    cameraError.value =
      e?.name === "NotAllowedError" || e?.name === "SecurityError"
        ? "Izin kamera ditolak. Aktifkan izin kamera untuk mengambil foto."
        : e?.name === "NotFoundError"
          ? "Kamera tidak ditemukan pada perangkat ini."
          : e?.message || "Gagal mengakses kamera.";
    cameraOn.value = false;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
  cameraOn.value = false;
}

// Tangkap frame video → File JPEG → jadikan foto selfie.
function capturePhoto() {
  const video = videoEl.value;
  if (!video) return;
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(video, 0, 0, w, h);
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      setImage(new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" }));
      stopCamera();
    },
    "image/jpeg",
    0.9,
  );
}

function retakePhoto() {
  clearImage();
  startCamera();
}

// ── Peta ───────────────────────────────────────────────────────────────
function cleanupMap() {
  if (window.google?.maps?.event && map) {
    window.google.maps.event.clearInstanceListeners(map);
  }
  map = null;
  geocoder = null;
  myMarker = null;
  branchMarker = null;
  circle = null;
}

// Buang "plus code" (mis. "RMXV+G76, ") di awal alamat bila masih tersisa.
function stripPlusCode(addr) {
  return String(addr || "").replace(/^[A-Z0-9]{2,}\+[A-Z0-9]+,?\s*/i, "").trim();
}

function reverseGeocode(lat, lng) {
  if (!geocoder) return;
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status !== "OK" || !results?.length) return;
    // Lewati hasil bertipe plus_code; pilih alamat jalan yang sebenarnya.
    const best = results.find((r) => !(r.types || []).includes("plus_code")) || results[0];
    address.value = stripPlusCode(best.formatted_address);
  });
}

async function initMap() {
  if (!hasGoogleMapsKey) {
    mapError.value = "Peta tidak tersedia (API key Google Maps belum diatur).";
    return;
  }
  if (!position.value) return;
  try {
    const google = await loadGoogleMaps();
    await nextTick();
    if (!mapEl.value) return;
    const { Map } = await google.maps.importLibrary("maps");

    const me = { lat: position.value.latitude, lng: position.value.longitude };
    map = new Map(mapEl.value, {
      center: me,
      zoom: 17,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    myMarker = new google.maps.Marker({ map, position: me, title: "Lokasi Anda" });
    geocoder = new google.maps.Geocoder();
    reverseGeocode(me.lat, me.lng);

    // Geofence kantor (radius = toleransi jarak) + penanda kantor.
    if (branch.value) {
      const b = { lat: branch.value.latitude, lng: branch.value.longitude };
      const inRange = withinRange.value;
      branchMarker = new google.maps.Marker({
        map,
        position: b,
        title: "Kantor",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#243b8f",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      circle = new google.maps.Circle({
        map,
        center: b,
        radius: branch.value.distanceTolerance,
        strokeColor: inRange ? "#16a34a" : "#dc2626",
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: inRange ? "#16a34a" : "#dc2626",
        fillOpacity: 0.12,
      });

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(me);
      if (circle.getBounds()) bounds.union(circle.getBounds());
      else bounds.extend(b);
      map.fitBounds(bounds, 48);
    }
  } catch (e) {
    mapError.value = e?.message || "Gagal memuat peta.";
  }
}

// ── Alur ambil lokasi ──────────────────────────────────────────────────
async function locate() {
  locating.value = true;
  locationError.value = "";
  try {
    position.value = await getPosition();
  } catch (e) {
    locationError.value = geoErrorMessage(e);
    locating.value = false;
    return;
  }

  try {
    branch.value = await fetchBranchContext();
  } catch {
    branch.value = null;
  }
  if (branch.value && position.value) {
    distance.value = distanceMeters(
      position.value.latitude,
      position.value.longitude,
      branch.value.latitude,
      branch.value.longitude,
    );
  }
  locating.value = false;
  initMap();
}

function resetState() {
  locating.value = false;
  locationError.value = "";
  mapError.value = "";
  position.value = null;
  branch.value = null;
  address.value = "";
  distance.value = null;
  note.value = "";
  cameraError.value = "";
  stopCamera();
  clearImage();
  cleanupMap();
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      resetState();
      await nextTick();
      locate();
    } else {
      resetState();
    }
  },
);

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  stopCamera();
  cleanupMap();
});

function close() {
  if (submitting.value) return;
  emit("update:open", false);
}

async function onSubmit() {
  if (!canSubmit.value) return;
  const ok = await submitLog({
    attendanceType: props.type,
    latitude: position.value.latitude,
    longitude: position.value.longitude,
    image: imageFile.value,
    note: note.value,
  });
  if (ok) {
    emit("submitted");
    emit("update:open", false);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-mahir-border px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
                <component :is="isCheckIn ? ArrowRightEndOnRectangleIcon : ArrowLeftStartOnRectangleIcon" class="h-5 w-5" />
              </span>
              <h5 class="text-lg font-bold text-slate-900">{{ title }}</h5>
            </div>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              :disabled="submitting"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <!-- Peta / status lokasi -->
            <div class="relative overflow-hidden rounded-xl border border-mahir-border">
              <div ref="mapEl" class="h-52 w-full bg-slate-100"></div>

              <!-- Sedang mengambil lokasi -->
              <div
                v-if="locating"
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-slate-500"
              >
                <ArrowPathIcon class="h-6 w-6 animate-spin text-mahir-primary" />
                Mengambil lokasi GPS…
              </div>

              <!-- Gagal ambil lokasi -->
              <div
                v-else-if="locationError"
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 p-4 text-center"
              >
                <ExclamationTriangleIcon class="h-6 w-6 text-amber-500" />
                <p class="text-xs font-medium text-slate-600">{{ locationError }}</p>
                <button
                  type="button"
                  class="mt-1 rounded-lg bg-mahir-primary-soft px-3 py-1.5 text-xs font-semibold text-mahir-primary hover:bg-mahir-primary-soft/80"
                  @click="locate"
                >
                  Coba lagi
                </button>
              </div>

              <!-- Peta gagal dimuat (tetap bisa lanjut bila di dalam radius) -->
              <div
                v-else-if="mapError"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-50 p-4 text-center"
              >
                <MapPinIcon class="h-6 w-6 text-slate-400" />
                <p class="text-xs font-medium text-slate-600">{{ mapError }}</p>
                <p class="text-[11px] text-slate-400">Validasi jarak tetap berjalan tanpa peta.</p>
              </div>
            </div>

            <!-- Alamat & koordinat -->
            <div v-if="position && !locationError" class="mt-3 space-y-1.5">
              <div v-if="address" class="flex items-start gap-1.5 text-[13px] text-slate-600">
                <MapPinIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <span>{{ address }}</span>
              </div>
              <p class="text-[11.5px] text-slate-400">
                {{ position.latitude.toFixed(6) }}, {{ position.longitude.toFixed(6) }}
                <span v-if="position.accuracy"> · akurasi ±{{ Math.round(position.accuracy) }} m</span>
              </p>
            </div>

            <!-- Status geofence -->
            <div
              v-if="position && !locationError"
              class="mt-3 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[13px]"
              :class="
                !branch
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : withinRange
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
              "
            >
              <component
                :is="withinRange ? CheckCircleIcon : ExclamationTriangleIcon"
                class="mt-0.5 h-4 w-4 flex-shrink-0"
              />
              <span v-if="!branch">
                Cabang belum memiliki koordinat lokasi. Hubungi admin — absen tidak dapat diproses.
              </span>
              <span v-else-if="withinRange">
                Anda berada di area kantor ({{ distanceLabel }} dari kantor, maks {{ branch.distanceTolerance }} m).
              </span>
              <span v-else>
                Di luar area kantor: {{ distanceLabel }} dari kantor (maks {{ branch.distanceTolerance }} m). Mendekatlah ke lokasi kantor.
              </span>
            </div>

            <!-- Foto selfie (opsional) — kamera langsung / pilih file -->
            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-slate-700">Foto Selfie <span class="text-slate-400">(opsional)</span></label>

              <!-- Sudah ada foto -->
              <div v-if="imagePreview" class="flex items-center gap-3">
                <img :src="imagePreview" alt="Selfie" class="h-20 w-20 rounded-xl object-cover" />
                <div class="flex flex-col gap-1.5">
                  <button
                    type="button"
                    class="rounded-lg bg-mahir-primary-soft px-3 py-1.5 text-xs font-semibold text-mahir-primary hover:bg-mahir-primary-soft/80"
                    @click="retakePhoto"
                  >
                    Ambil ulang
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    @click="clearImage"
                  >
                    Hapus foto
                  </button>
                </div>
              </div>

              <!-- Kamera menyala -->
              <div v-else-if="cameraOn" class="space-y-2">
                <video
                  ref="videoEl"
                  autoplay
                  playsinline
                  muted
                  class="h-48 w-full rounded-xl bg-black object-cover"
                ></video>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
                    @click="capturePhoto"
                  >
                    <CameraIcon class="h-4 w-4" />
                    Ambil Foto
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                    @click="stopCamera"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <!-- Belum ada foto & kamera mati -->
              <div v-else class="space-y-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-mahir-border px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:border-mahir-primary hover:text-mahir-primary"
                  @click="startCamera"
                >
                  <CameraIcon class="h-5 w-5" />
                  Nyalakan Kamera
                </button>
                <p v-if="cameraError" class="text-xs text-rose-500">{{ cameraError }}</p>
              </div>
            </div>

            <!-- Catatan -->
            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-slate-700">Catatan <span class="text-slate-400">(opsional)</span></label>
              <textarea
                v-model="note"
                rows="2"
                placeholder="Mis. WFH, tugas luar, dll."
                class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 border-t border-mahir-border px-6 py-4">
            <button
              type="button"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              :disabled="submitting"
              @click="close"
            >
              Batal
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canSubmit"
              @click="onSubmit"
            >
              <ArrowPathIcon v-if="submitting" class="h-4 w-4 animate-spin" />
              {{ submitting ? "Mengirim…" : isCheckIn ? "Kirim Check In" : "Kirim Check Out" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
