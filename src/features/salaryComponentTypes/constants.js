// Kategori komponen penggajian. Backend menerima `category` sebagai String bebas,
// jadi daftar ini menentukan pilihan di form + label tampilan. Sesuaikan bila
// backend memakai nilai/kode lain.
export const CATEGORIES = [
  { value: "EARNING", label: "Pendapatan" },
  { value: "ALLOWANCE", label: "Tunjangan" },
  { value: "DEDUCTION", label: "Potongan" },
  { value: "BENEFIT", label: "Benefit" },
];

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

// Label ramah untuk sebuah nilai kategori (fallback ke nilai mentahnya).
export function categoryLabel(value) {
  if (!value) return "-";
  return LABELS[value] ?? value;
}

// Warna badge per kategori (Tailwind). Default netral bila tak dikenal.
export function categoryBadgeClass(value) {
  switch (value) {
    case "EARNING":
      return "bg-emerald-50 text-emerald-600";
    case "ALLOWANCE":
      return "bg-sky-50 text-sky-600";
    case "DEDUCTION":
      return "bg-red-50 text-red-500";
    case "BENEFIT":
      return "bg-violet-50 text-violet-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
