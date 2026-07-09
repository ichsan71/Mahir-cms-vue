// Pilihan tipe unit sesuai enum backend (UnitInput.unitType).
export const UNIT_TYPES = [
  { value: "EXECUTIVE", label: "Eksekutif" },
  { value: "DEPARTMENT", label: "Departemen" },
  { value: "DIVISION", label: "Divisi" },
  { value: "SUB_DIVISION", label: "Sub Divisi" },
];

// Label tampilan untuk sebuah nilai unitType (fallback ke nilai mentah).
export function unitTypeLabel(value) {
  return UNIT_TYPES.find((t) => t.value === value)?.label || value || "—";
}
