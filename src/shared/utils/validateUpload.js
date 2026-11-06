// Validasi berkas unggahan di sisi KLIEN (SEC-03) — UX saja.
//
// PENTING: `file.type` (MIME) dikirim oleh browser dan BISA DIPALSUKAN. Validasi
// di sini hanya mencegah kesalahan umum & memberi umpan balik cepat ke pengguna.
// Validasi OTORITATIF (MIME asli, ukuran, ekstensi, pemindaian malware) WAJIB
// ditegakkan di backend — lihat SEC-20 di docs/SECURITY-AUDIT.md.

export const MB = 1024 * 1024;

// Allowlist MIME untuk GAMBAR. Sengaja TANPA `image/svg+xml`: SVG bisa memuat
// <script>/handler event → vektor XSS bila suatu saat dirender inline.
export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Allowlist MIME untuk LAMPIRAN dokumen: gambar + PDF + Word + Excel.
export const ATTACHMENT_MIME = [
  ...IMAGE_MIME,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Nilai atribut `accept` untuk <input type="file"> (ekstensi + MIME, tanpa svg).
export const IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
export const ATTACHMENT_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx," +
  "image/jpeg,image/png,image/webp,image/gif,application/pdf," +
  "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Label ramah-pengguna (ditampilkan di bawah input agar jelas tipe yang diterima).
export const IMAGE_HINT = "JPG, PNG, WebP, atau GIF";
export const ATTACHMENT_HINT = "JPG, PNG, GIF, PDF, Word, atau Excel";

/**
 * Validasi satu berkas terhadap allowlist MIME & batas ukuran.
 * @param {File} file Berkas dari <input type="file">.
 * @param {{ allow?: string[], maxBytes?: number }} [opts]
 *   allow: daftar MIME yang diizinkan (default ATTACHMENT_MIME);
 *   maxBytes: ukuran maksimal dalam byte (default 10 MB).
 * @returns {{ ok: boolean, error: string }} ok=true bila lolos; error = pesan bila gagal.
 */
export function validateFile(file, { allow = ATTACHMENT_MIME, maxBytes = 10 * MB } = {}) {
  if (!file) return { ok: false, error: "Berkas tidak ditemukan." };
  if (allow?.length && !allow.includes(file.type)) {
    return { ok: false, error: "Tipe berkas tidak didukung." };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `Ukuran berkas maksimal ${Math.round(maxBytes / MB)} MB.` };
  }
  return { ok: true, error: "" };
}
