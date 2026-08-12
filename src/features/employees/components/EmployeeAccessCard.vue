<script setup>
// Tab "Hak Akses" pada Detail Karyawan. Menampilkan katalog Group (role) dari
// listGroup: tiap GROUP jadi satu checkbox yang bisa dipilih; permission di
// dalamnya ditampilkan read-only sebagai info isi group.
// Centang lalu Simpan → setUserGroups (replace seluruh group user tsb).
import { computed, reactive, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { LIST_GROUP, SET_USER_GROUPS } from "../graphql/access.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { PERM } from "../permissions";
import { MagnifyingGlassIcon, ShieldCheckIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — grupnya diset lewat akun user-nya.
  employee: { type: Object, default: null },
});

const auth = useAuthStore();
const toast = useToastStore();

// Ambil seluruh katalog group (pageSize besar; jumlah role umumnya sedikit).
const { result, loading } = useQuery(
  LIST_GROUP,
  () => ({ params: { page: 1, pageSize: 100, search: null } }),
  { fetchPolicy: "cache-and-network" },
);

const groups = computed(() => result.value?.listGroup?.data?.results ?? []);

// Pencarian sederhana di sisi klien (nama group / nama permission di dalamnya).
const search = ref("");
const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return groups.value;
  return groups.value.filter(
    (g) =>
      g.name?.toLowerCase().includes(q) ||
      (g.permissions ?? []).some((p) => p.name?.toLowerCase().includes(q)),
  );
});

// Himpunan id group yang ADA di katalog listGroup (yang bisa ditampilkan sbg checkbox).
const catalogIds = computed(() => new Set(groups.value.map((g) => Number(g.id))));

// Id group yang saat ini dimiliki user (dari employee.user.groups).
const userGroupIds = computed(() =>
  (props.employee?.user?.groups ?? [])
    .map((g) => Number(g?.id))
    .filter((n) => Number.isInteger(n)),
);

// Grup user yang TIDAK ada di katalog (mis. grup dari aplikasi lain). Tak bisa
// ditampilkan sbg checkbox, TAPI harus dipertahankan saat Simpan agar tidak
// ikut terhapus (setUserGroups bersifat replace seluruh himpunan).
const unmanagedGroupIds = computed(() =>
  userGroupIds.value.filter((id) => !catalogIds.value.has(id)),
);

// Grup di luar katalog (untuk info ke user) — nama + id.
const unmanagedGroups = computed(() =>
  (props.employee?.user?.groups ?? []).filter(
    (g) => !catalogIds.value.has(Number(g?.id)),
  ),
);

// State centang lokal (per ID group).
const checkedMap = reactive({});

// Prefill: centang otomatis grup milik user yang ADA di katalog. Re-run saat
// karyawan berganti, data user termuat, atau katalog termuat (cache→network),
// supaya centang awal selalu mencerminkan kondisi tersimpan.
watch(
  [
    () => props.employee?.user?.id,
    () => userGroupIds.value.join(","),
    () => [...catalogIds.value].join(","),
  ],
  () => {
    for (const k of Object.keys(checkedMap)) delete checkedMap[k];
    for (const id of userGroupIds.value) {
      if (catalogIds.value.has(id)) checkedMap[id] = true;
    }
  },
  { immediate: true },
);

function isChecked(id) {
  return !!checkedMap[id];
}
function toggle(id) {
  checkedMap[id] = !checkedMap[id];
}
const checkedCount = computed(() => Object.values(checkedMap).filter(Boolean).length);

// ── Simpan grup user ────────────────────────────────────────────────────────
// setUserGroups butuh id AKUN USER (employee.user.id), bukan id karyawan.
const userId = computed(() => {
  const n = Number(props.employee?.user?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

// Id group tercentang (dari katalog).
const selectedGroupIds = computed(() =>
  Object.entries(checkedMap)
    .filter(([, v]) => v)
    .map(([id]) => Number(id)),
);

// Himpunan final yang dikirim ke setUserGroups = pilihan katalog + grup di luar
// katalog yang dipertahankan (agar tidak terhapus).
const finalGroupIds = computed(() => [
  ...new Set([...selectedGroupIds.value, ...unmanagedGroupIds.value]),
]);

const canSet = computed(() => auth.can(PERM.GROUP_SET));

const { mutate: setUserGroups, loading: saving } = useMutation(SET_USER_GROUPS);

async function save() {
  if (!userId.value || !canSet.value) return;
  try {
    const res = await setUserGroups({
      input: { userId: userId.value, groupIds: finalGroupIds.value },
    });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    if (!res?.data?.setUserGroups?.data) throw new Error("Gagal menyimpan hak akses");
    toast.success("Hak akses berhasil disimpan");
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan hak akses. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <ShieldCheckIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Hak Akses</h2>
          <p class="text-[11.5px] text-slate-400">
            {{ checkedCount }} dari {{ groups.length }} grup dipilih
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <MagnifyingGlassIcon class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari grup…"
            class="w-48 rounded-lg border border-mahir-border py-2 pl-8 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
        <button
          v-if="canSet"
          type="button"
          :disabled="saving || !userId"
          :title="!userId ? 'Karyawan ini belum punya akun user' : ''"
          class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13.5px] font-semibold text-white transition"
          :class="saving || !userId
            ? 'cursor-not-allowed bg-mahir-primary/40'
            : 'bg-mahir-primary hover:bg-mahir-primary/90'"
          @click="save"
        >
          <ArrowPathIcon v-if="saving" class="h-4 w-4 animate-spin" />
          {{ saving ? "Menyimpan…" : "Simpan" }}
        </button>
      </div>
    </div>

    <div class="p-5">
      <!-- Info: grup di luar katalog yang tetap dipertahankan saat Simpan -->
      <div
        v-if="unmanagedGroups.length"
        class="mb-4 flex items-start gap-2 rounded-xl border border-mahir-info-soft bg-mahir-info-soft/40 px-3.5 py-2.5 text-[12.5px] text-slate-600"
      >
        <ShieldCheckIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-mahir-info" />
        <span>
          {{ unmanagedGroups.length }} grup lain tidak ada di daftar ini
          ({{ unmanagedGroups.map((g) => g.name).join(", ") }}) — grup tersebut
          <b>tetap dipertahankan</b> saat menyimpan.
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading && !groups.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat daftar hak akses…
      </div>

      <!-- Kosong -->
      <div v-else-if="!filteredGroups.length" class="py-12 text-center text-sm text-slate-400">
        {{ search ? "Tidak ada grup yang cocok." : "Belum ada data grup." }}
      </div>

      <!-- Daftar group (checkbox = group) -->
      <div v-else class="space-y-3">
        <label
          v-for="g in filteredGroups"
          :key="g.id"
          class="flex cursor-pointer gap-3 rounded-xl border p-4 transition hover:bg-slate-50"
          :class="isChecked(g.id) ? 'border-mahir-primary/50 bg-mahir-primary-soft/40' : 'border-mahir-border'"
        >
          <input
            type="checkbox"
            :checked="isChecked(g.id)"
            class="mt-0.5 h-4 w-4 rounded border-slate-300 text-mahir-primary focus:ring-mahir-primary"
            @change="toggle(g.id)"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-[14px] font-semibold text-slate-800">{{ g.name }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {{ (g.permissions ?? []).length }} izin
              </span>
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
