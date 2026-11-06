import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_LEAVE_AT_WORK_HOUR,
  EDIT_LEAVE_AT_WORK_HOUR,
  SUBMIT_LEAVE_AT_WORK_HOUR,
  APPROVE_LEAVE_AT_WORK_HOUR,
  REJECT_LEAVE_AT_WORK_HOUR,
  DELETE_LEAVE_AT_WORK_HOUR,
} from "../graphql/leaveAtWorkHour.queries";
import { useToastStore } from "@/stores/toast.store";

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika aksi izin di jam kerja: ajukan, setujui, tolak, hapus.
export function useLeaveAtWorkHourForm() {
  const toast = useToastStore();
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_LEAVE_AT_WORK_HOUR);
  const { mutate: editMut } = useMutation(EDIT_LEAVE_AT_WORK_HOUR);
  const { mutate: submitMut } = useMutation(SUBMIT_LEAVE_AT_WORK_HOUR);
  const { mutate: approveMut } = useMutation(APPROVE_LEAVE_AT_WORK_HOUR);
  const { mutate: rejectMut } = useMutation(REJECT_LEAVE_AT_WORK_HOUR);
  const { mutate: deleteMut } = useMutation(DELETE_LEAVE_AT_WORK_HOUR);

  async function createLeave(input) {
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLeaveAtWorkHour?.data;
      if (!created) throw new Error("Gagal mengajukan izin");
      toast.success("Izin berhasil diajukan");
      return created;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal mengajukan izin. Coba lagi.");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editLeave(id, input) {
    loading.value = true;
    try {
      const res = await editMut({ id: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editLeaveAtWorkHour?.data;
      if (!updated) throw new Error("Gagal menyimpan perubahan");
      toast.success("Perubahan izin tersimpan");
      return updated;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal menyimpan perubahan. Coba lagi.");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function submit(id) {
    loading.value = true;
    try {
      const res = await submitMut({ id: Number(id) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Izin berhasil dikirim untuk persetujuan");
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal mengirim izin. Coba lagi.");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function approve(id, remark = null) {
    loading.value = true;
    try {
      const res = await approveMut({ id: Number(id), remark: remark || null });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Izin disetujui");
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal menyetujui izin. Coba lagi.");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function reject(id, remark = null) {
    loading.value = true;
    try {
      const res = await rejectMut({ id: Number(id), remark: remark || null });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Izin ditolak");
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal menolak izin. Coba lagi.");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id) {
    loading.value = true;
    try {
      const res = await deleteMut({ id: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Izin berhasil dibatalkan");
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal membatalkan izin. Coba lagi.");
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createLeave, editLeave, submit, approve, reject, remove, loading };
}
