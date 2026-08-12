import { ref, computed } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { apolloClient } from "@/apollo/client";
import {
  CREATE_ATTENDANCE_LOG,
  GET_EMPLOYEE_ATTENDANCE_CONTEXT,
} from "../graphql/attendance.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { getDeviceInfo } from "@/shared/utils/device";

// Jarak (meter) antara dua titik lat/long — rumus haversine.
export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius bumi (m)
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Ambil posisi GPS browser sebagai Promise (akurasi tinggi untuk absen).
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Perangkat tidak mendukung GPS/Geolocation."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export function geoErrorMessage(err) {
  switch (err?.code) {
    case 1:
      return "Izin lokasi ditolak. Aktifkan izin lokasi untuk melakukan absen.";
    case 2:
      return "Lokasi tidak tersedia saat ini. Coba lagi.";
    case 3:
      return "Permintaan lokasi kehabisan waktu. Coba lagi.";
    default:
      return err?.message || "Gagal mendapatkan lokasi.";
  }
}

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika absen (check-in / check-out) berbasis GPS. Alur dipecah agar modal
// bisa: 1) ambil posisi GPS, 2) ambil koordinat & toleransi cabang untuk validasi
// jarak (meter), lalu 3) kirim createAttendanceLog setelah user konfirmasi.
export function useCheckIn() {
  const auth = useAuthStore();
  const toast = useToastStore();

  const submitting = ref(false);

  const employeeId = computed(() => auth.employee?.id ?? null);
  // Akun tanpa data karyawan (mis. superadmin employee=null) tidak bisa absen.
  const canAttend = computed(() => employeeId.value != null);

  const { mutate } = useMutation(CREATE_ATTENDANCE_LOG);

  // Posisi GPS saat ini → { latitude, longitude, accuracy }. Melempar error
  // (kode geolocation) bila gagal; pemanggil memetakan lewat geoErrorMessage.
  async function getPosition() {
    const pos = await getCurrentPosition();
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  }

  // Konteks cabang karyawan login: { latitude, longitude, distanceTolerance }
  // atau null bila cabang belum punya koordinat.
  async function fetchBranchContext() {
    if (!canAttend.value) return null;
    const { data } = await apolloClient.query({
      query: GET_EMPLOYEE_ATTENDANCE_CONTEXT,
      variables: { getEmployeeId: Number(employeeId.value) },
      fetchPolicy: "network-only",
    });
    const addr = data?.getEmployee?.data?.branch?.address;
    if (!addr || addr.latitude == null || addr.longitude == null) return null;
    return {
      latitude: Number(addr.latitude),
      longitude: Number(addr.longitude),
      distanceTolerance: Number(addr.distanceTolerance) || 0,
    };
  }

  // Kirim log absen. `attendanceType`: "IN" | "OUT". `image` opsional (File selfie).
  async function submitLog({ attendanceType, latitude, longitude, image = null, note = "" }) {
    if (submitting.value) return null;
    if (!canAttend.value) {
      toast.error("Akun ini tidak terhubung ke data karyawan, tidak bisa absen.");
      return null;
    }

    submitting.value = true;
    try {
      const device = getDeviceInfo();
      const input = {
        attendanceType, // "IN" | "OUT"
        source: "GPS",
        employeeId: Number(employeeId.value),
        latitude,
        longitude,
        deviceId: device.id,
        deviceName: device.name,
        image: image || null,
        isManual: null,
        note: note?.trim() || null,
      };

      const res = await mutate({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createAttendanceLog?.data;
      if (!created) throw new Error("Gagal menyimpan absen.");

      toast.success(attendanceType === "IN" ? "Check-in berhasil." : "Check-out berhasil.");
      return created;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal melakukan absen. Coba lagi.");
      return null;
    } finally {
      submitting.value = false;
    }
  }

  return { canAttend, employeeId, getPosition, fetchBranchContext, submitLog, submitting };
}
