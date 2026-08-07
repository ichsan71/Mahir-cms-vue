// Util token aktivasi (link verify-email).
//
// Alur backend: setelah akun diaktifkan, backend redirect ke
// /verify-email?token=<encoded>. Nilai `token` di URL itu MASIH ter-encode
// (urlsafe base64) — bukan token final. Frontend harus men-decode dulu; hasil
// decode itulah token asli yang dipakai sebagai `Authorization: Bearer` ke
// backend (mis. untuk mutation changePassword saat set password pertama kali).

// Decode string urlsafe-base64 menjadi teks (UTF-8 aman).
function urlsafeBase64Decode(input) {
  // urlsafe base64: '-' ganti '+', '_' ganti '/', padding '=' boleh hilang.
  let s = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  // Rangkai ulang byte → UTF-8 supaya karakter non-ASCII tidak korup.
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(bin, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return bin;
  }
}

/**
 * Ambil token asli dari nilai `?token=` pada link verify-email.
 * - Decode urlsafe base64. Hasil decode adalah token yang dipakai ke backend.
 * - Bila hasil decode berupa JSON `{ token, ... }`, ambil field `token`-nya.
 * - Bila decode gagal (mis. nilai ternyata sudah token mentah), pakai apa adanya
 *   agar tidak mematahkan alur.
 * @param {string} raw Nilai token dari query string.
 * @returns {string} Token siap pakai sebagai Bearer, atau "" bila tidak ada.
 */
export function decodeActivationToken(raw) {
  if (!raw) return "";
  let decoded;
  try {
    decoded = urlsafeBase64Decode(raw).trim();
  } catch {
    // Tidak bisa di-decode → anggap nilainya sudah token mentah.
    return String(raw).trim();
  }
  if (decoded.startsWith("{")) {
    try {
      const obj = JSON.parse(decoded);
      if (obj && typeof obj.token === "string") return obj.token;
    } catch {
      // Bukan JSON valid — pakai hasil decode apa adanya.
    }
  }
  return decoded;
}
