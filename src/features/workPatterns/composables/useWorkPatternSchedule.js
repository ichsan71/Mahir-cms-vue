import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_WORK_PATTERN_DETAIL,
  EDIT_WORK_PATTERN_DETAIL,
} from "../graphql/workPattern.queries";
import { useToastStore } from "@/stores/toast.store";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message ||
    e?.networkError?.message ||
    e?.message ||
    "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika penyimpanan jadwal harian (WorkPatternDetail) sebuah pola kerja.
// Baris yang sudah punya `detailId` → editWorkPatternDetail; yang belum → createWorkPatternDetail.
export function useWorkPatternSchedule() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_WORK_PATTERN_DETAIL);
  const { mutate: editMut } = useMutation(EDIT_WORK_PATTERN_DETAIL);

  // Simpan seluruh baris jadwal. `rows` = [{ detailId, weekday, isWorkday, shiftId }].
  // `patternId` dipakai pada input tiap baris. Mengembalikan true bila semua sukses.
  async function saveSchedule(patternId, rows) {
    error.value = "";
    loading.value = true;
    try {
      for (const row of rows) {
        const input = {
          patternId: Number(patternId),
          weekday: row.weekday,
          isWorkday: !!row.isWorkday,
          // Hari libur → shift dikosongkan.
          shiftId: row.isWorkday && row.shiftId ? Number(row.shiftId) : null,
        };

        const res = row.detailId
          ? await editMut({ editWorkPatternDetailId: Number(row.detailId), input })
          : await createMut({ input });

        if (res?.errors?.length) throw new Error(res.errors[0].message);
      }
      toast.success("Jadwal mingguan berhasil disimpan");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menyimpan jadwal. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { saveSchedule, error, loading };
}
