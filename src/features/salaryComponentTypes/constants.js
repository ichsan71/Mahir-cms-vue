// Kategori komponen penggajian — mengikuti enum backend SALARY_COMPONENT_CATEGORY
// (employeeChoices). Dipakai utk filter toolbar & label/badge tampilan. Form modal
// mengambil pilihan langsung dari enum via useEnumChoices.
export const CATEGORIES = [
  { value: "BASIC", label: "Gaji Pokok" },
  { value: "ALLOWANCE", label: "Tunjangan" },
  { value: "DEDUCTION", label: "Potongan" },
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
    case "BASIC":
      return "bg-emerald-50 text-emerald-600";
    case "ALLOWANCE":
      return "bg-sky-50 text-sky-600";
    case "DEDUCTION":
      return "bg-red-50 text-red-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
