// Util token aktivasi (link verify-email).
//
// Alur backend: setelah akun diaktifkan, backend menandatangani JWT (RS256)
// berisi { user_id, sessionid, platform, exp, iat, iss } lalu redirect ke
// /verify-email?token=<jwt>. Nilai `token` di URL itu adalah JWT MENTAH
// (header.payload.signature), bukan dibungkus base64/JSON. Token ini dipakai
// apa adanya sebagai `Authorization: Bearer` ke backend (mis. changePassword
// saat set password pertama kali) — backend yang memverifikasi tanda tangannya.

/**
 * Ambil token yang siap dipakai sebagai Bearer dari nilai `?token=` pada link
 * verify-email. Tahan dua bentuk yang mungkin dikirim backend:
 *   1. JWT final langsung (payload = claims: user_id, exp, dst.) → dipakai apa
 *      adanya.
 *   2. JWT yang payload-nya MEMBUNGKUS token lain, mis. { user, token } →
 *      ambil field `token` di dalamnya.
 * Catatan: "decode" di sini hanya membaca payload (base64url), TIDAK butuh kunci.
 * Public key backend hanya untuk verifikasi tanda tangan, dan itu tugas backend.
 * @param {string} raw Nilai token dari query string.
 * @returns {string} Token siap pakai sebagai Bearer, atau "" bila tidak ada.
 */
export function decodeActivationToken(raw) {
  const token = raw ? String(raw).trim() : "";
  if (!token) return "";
  // Bila payload JWT membungkus token lain, ambil token bagian dalam (kasus 2).
  const claims = readJwtClaims(token);
  if (claims && typeof claims.token === "string" && claims.token.trim()) {
    return claims.token.trim();
  }
  // Selain itu, token di URL adalah token final itu sendiri (kasus 1).
  return token;
}

/**
 * Baca payload (claims) sebuah JWT TANPA verifikasi tanda tangan.
 * Hanya untuk kebutuhan UX (mis. cek `exp`) — bukan untuk keputusan keamanan.
 * Keamanan sesungguhnya tetap ditegakkan backend saat token dipakai.
 * @param {string} jwt Token JWT mentah.
 * @returns {object|null} Objek claims, atau null bila gagal.
 */
export function readJwtClaims(jwt) {
  try {
    let s = String(jwt).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    const bin = atob(s);
    // Rangkai ulang byte → UTF-8 supaya karakter non-ASCII tidak korup.
    const json = decodeURIComponent(
      Array.prototype.map
        .call(bin, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Cek apakah JWT sudah kadaluarsa berdasar claim `exp` (detik epoch).
 * Token tanpa `exp` atau tidak bisa dibaca dianggap kadaluarsa.
 * @param {string} jwt Token JWT mentah.
 * @returns {boolean} true bila kadaluarsa / tidak valid.
 */
export function isTokenExpired(jwt) {
  const claims = readJwtClaims(jwt);
  return !claims?.exp || claims.exp * 1000 < Date.now();
}
