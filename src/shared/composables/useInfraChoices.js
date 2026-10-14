import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { INFRA_CHOICES } from "@/shared/graphql/infra.queries";
import { prettyEnum } from "@/shared/composables/useEnumChoices";

// Ambil pilihan dari enum infrastruktur backend lewat query `infraChoices(group)`.
// `group` (InfraChoiceGroup, mis. "APP_NAME") boleh berupa string atau ref.
// Mengembalikan options [{ value, label }] — sama seperti useEnumChoices.
export function useInfraChoices(group) {
  const { result, loading } = useQuery(
    INFRA_CHOICES,
    () => ({ group: unref(group) }),
    // Enum jarang berubah → cukup cache-first. Skip bila group belum ada.
    () => ({ fetchPolicy: "cache-first", enabled: !!unref(group) }),
  );

  const options = computed(() =>
    (result.value?.infraChoices ?? []).map((e) => ({
      // Nilai yang DIKIRIM ke backend saat filter = `label` (nama enum), bukan
      // `value` (teks tampilan). Konsisten dgn konvensi useEnumChoices.
      value: e.label,
      // Teks yang DITAMPILKAN ke pengguna = `value`; bila kosong jatuh ke prettyEnum.
      label: e.value ?? prettyEnum(e.label),
    })),
  );

  return { options, loading };
}
