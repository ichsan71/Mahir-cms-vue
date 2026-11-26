import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { SET_MANUAL_ATTENDANCE_BULK } from "../graphql/attendance.queries";
import { useToastStore } from "@/stores/toast.store";

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika "kehadiran manual massal": set/edit jam masuk & keluar BANYAK
// karyawan/tanggal dalam satu kali kirim via setManualAttendanceBulk. Dipakai
// admin/HRD yang punya izin `setManualAttendance` — backend menegakkan izin
// per-karyawan. Lihat juga useManualAttendance (versi satu baris).
export function useBulkManualAttendance() {
  const toast = useToastStore();
  const submitting = ref(false);

  const { mutate } = useMutation(SET_MANUAL_ATTENDANCE_BULK);

  // `rows`: array { employeeId, employeeCode?, date, checkIn, checkOut?, note? }.
  // Dibersihkan ke bentuk ManualAttendanceInput sebelum dikirim.
  async function saveBulk(rows) {
    if (submitting.value) return null;
    if (!Array.isArray(rows) || !rows.length) return null;
    submitting.value = true;
    try {
      const payload = rows.map((r) => ({
        employeeId:
          r.employeeId != null && r.employeeId !== "" ? Number(r.employeeId) : null,
        employeeCode: r.employeeCode || null,
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut || null,
        note: r.note?.trim() || null,
      }));

      const res = await mutate({ rows: payload });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const saved = res?.data?.setManualAttendanceBulk?.data;
      if (!saved) throw new Error("Gagal menyimpan kehadiran massal.");

      toast.success(`${saved.length} baris kehadiran berhasil disimpan.`);
      return saved;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal menyimpan kehadiran massal.");
      return null;
    } finally {
      submitting.value = false;
    }
  }

  return { saveBulk, submitting };
}
