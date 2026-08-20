import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { CHOICES } from "@/shared/graphql/enum.queries";

// Ubah nama enum (UPPER_SNAKE_CASE) → label terbaca, mis. SUB_DIVISION → "Sub Division".
export function prettyEnum(name) {
  return String(name || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Ambil pilihan dari enum backend lewat query `employeeChoices(group)` (reusable).
// `group` (EmployeeChoiceGroup, mis. "RELIGION") boleh berupa string atau ref.
// Mengembalikan options [{ value, label }].
export function useEnumChoices(group) {
  const { result, loading } = useQuery(
    CHOICES,
    () => ({ group: unref(group) }),
    // Enum jarang berubah → cukup cache-first. Skip bila group belum ada.
    () => ({ fetchPolicy: "cache-first", enabled: !!unref(group) }),
  );

  const options = computed(() =>
    (result.value?.employeeChoices ?? []).map((e) => ({
      // Nilai yang DIKIRIM ke backend saat create/update = `label` (nama enum,
      // mis. "ISLAM"), bukan `value` (teks tampilan "Islam").
      value: e.label,
      // Teks yang DITAMPILKAN ke pengguna = `value` (sudah terbaca); bila kosong
      // jatuh ke prettyEnum dari nama enum.
      label: e.value ?? prettyEnum(e.label),
    })),
  );

  return { options, loading };
}
