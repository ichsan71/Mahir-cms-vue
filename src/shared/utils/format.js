// Helper format kecil yang dipakai lintas fitur.

// Kata penghubung yang diabaikan saat membuat singkatan prefix.
const PREFIX_STOP_WORDS = new Set([
  "dan",
  "and",
  "or",
  "atau",
  "of",
  "the",
  "untuk",
  "yang",
]);

/**
 * Buat singkatan prefix dari sebuah nama (dipakai unit & perusahaan):
 * - Simbol / karakter unik dibuang (mis. "&", "/", ".", "-").
 * - Kata penghubung (dan/and/or/atau, dll) diabaikan bila lebih dari satu kata.
 * - 1 kata  → 3 huruf depan kapital, mis. "Finance" → "FIN".
 * - >1 kata → huruf pertama tiap kata kapital, mis. "Mazta Farma" → "MF".
 */
export function abbreviatePrefix(name) {
  // Ganti semua karakter selain huruf/angka/spasi dengan spasi.
  const cleaned = String(name || "").replace(/[^A-Za-z0-9\s]+/g, " ");
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (!words.length) return "";

  // Buang kata penghubung; bila habis semua, pakai kata aslinya.
  let meaningful = words.filter((w) => !PREFIX_STOP_WORDS.has(w.toLowerCase()));
  if (!meaningful.length) meaningful = words;

  if (meaningful.length === 1) return meaningful[0].slice(0, 3).toUpperCase();
  return meaningful.map((w) => w[0]).join("").toUpperCase();
}

/** Ambil maksimal 2 inisial dari nama (mis. "Rizky Aditya" → "RA"). */
export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

/** Format angka rupiah, mis. 12000000 → "Rp 12.000.000". */
export function formatCurrency(value = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format tanggal ISO → "19 Jun 2026". Mengembalikan "—" bila kosong/invalid. */
export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format jam dari sebuah nilai waktu → "07:15".
 * Menerima ISO datetime ("2026-04-24T07:15:00Z"), string jam ("07:15:00"),
 * atau Date. Mengembalikan "—" bila kosong/invalid.
 */
export function formatTime(value) {
  if (!value) return "—";
  // String jam murni "HH:mm" / "HH:mm:ss" (tanpa komponen tanggal).
  if (typeof value === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    const [h, m] = value.trim().split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * Format durasi dari detik → "2j 15m" (atau "45m", "—" bila kosong/0 opsional).
 * `zeroDash` = true mengembalikan "—" untuk nilai 0/kosong.
 */
export function formatDuration(seconds, { zeroDash = false } = {}) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  if (s === 0) return zeroDash ? "—" : "0m";
  const totalMin = Math.round(s / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${h}j ${m}m`;
  if (h) return `${h}j`;
  return `${m}m`;
}
