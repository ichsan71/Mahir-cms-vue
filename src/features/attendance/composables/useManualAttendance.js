import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { SET_MANUAL_ATTENDANCE } from "../graphql/attendance.queries";
import { useToastStore } from "@/stores/toast.store";

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika "kehadiran manual": set/edit jam masuk & keluar seorang karyawan
// untuk satu tanggal via setManualAttendance. Dipakai admin/atasan yang punya
// izin (`setManualAttendance`) — backend menegakkan izin per-karyawan.
export function useManualAttendance() {
  const toast = useToastStore();
  const submitting = ref(false);

  const { mutate } = useMutation(SET_MANUAL_ATTENDANCE);

  // `employeeId` (Int) atau `employeeCode` (String) untuk mengidentifikasi
  // karyawan. `date` = YYYY-MM-DD, `checkIn`/`checkOut` = HH:MM (checkOut opsional).
  async function save({ employeeId, employeeCode, date, checkIn, checkOut, note }) {
    if (submitting.value) return null;
    submitting.value = true;
    try {
      const input = {
        employeeId: employeeId != null && employeeId !== "" ? Number(employeeId) : null,
        employeeCode: employeeCode || null,
        date,
        checkIn,
        checkOut: checkOut || null,
        note: note?.trim() || null,
      };

      const res = await mutate({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const saved = res?.data?.setManualAttendance?.data;
      if (!saved) throw new Error("Gagal menyimpan kehadiran.");

      toast.success("Kehadiran manual berhasil disimpan.");
      return saved;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal menyimpan kehadiran manual.");
      return null;
    } finally {
      submitting.value = false;
    }
  }

  return { save, submitting };
}
