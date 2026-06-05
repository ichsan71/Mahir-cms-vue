// Helper format kecil yang dipakai lintas fitur.

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
