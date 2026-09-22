<script setup>
// Tab "BPJS" pada Detail Karyawan. Data BPJS bersifat 1:1 per karyawan, dibaca
// dari `employee.bpjs` (GET_EMPLOYEE). Bila belum ada → tombol Tambah; bila sudah
// ada → tampilkan detail + tombol Edit. Setelah simpan, memancarkan `saved` agar
// halaman induk me-refetch data karyawan.
import { computed, ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_EMPLOYEE_BPJS, EDIT_EMPLOYEE_BPJS } from "../graphql/bpjs.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import { ShieldCheckIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  employee: { type: Object, default: null },
});
const emit = defineEmits(["saved"]);

const auth = useAuthStore();
const toast = useToastStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

const bpjs = computed(() => props.employee?.bpjs ?? null);
const hasBpjs = computed(() => !!bpjs.value?.id);

const canCreate = computed(() => auth.can(PERM.BPJS_CREATE));
const canEdit = computed(() => auth.can(PERM.BPJS_EDIT));

// Kelas BPJS Kesehatan (1/2/3).
const KESEHATAN_CLASSES = [1, 2, 3];

// ── Modal ────────────────────────────────────────────────────────────────────
const modalOpen = ref(false);

const blankForm = () => ({
  kesehatanNumber: "",
  kesehatanClass: "",
  kesehatanRegisteredDate: "",
  ketenagakerjaanNumber: "",
  ketenagakerjaanRegisteredDate: "",
  notes: "",
});
const form = ref(blankForm());

function openForm() {
  const b = bpjs.value;
  form.value = b
    ? {
        kesehatanNumber: b.kesehatanNumber ?? "",
        kesehatanClass: b.kesehatanClass ?? "",
        kesehatanRegisteredDate: b.kesehatanRegisteredDate
          ? String(b.kesehatanRegisteredDate).slice(0, 10)
          : "",
        ketenagakerjaanNumber: b.ketenagakerjaanNumber ?? "",
        ketenagakerjaanRegisteredDate: b.ketenagakerjaanRegisteredDate
          ? String(b.ketenagakerjaanRegisteredDate).slice(0, 10)
          : "",
        notes: b.notes ?? "",
      }
    : blankForm();
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) form.value = blankForm();
});

const { mutate: createBpjs, loading: creating } = useMutation(CREATE_EMPLOYEE_BPJS);
const { mutate: editBpjs, loading: editingSave } = useMutation(EDIT_EMPLOYEE_BPJS);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (hasBpjs.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const kelas = Number(f.kesehatanClass);
  const input = {
    employeeId: employeeId.value,
    kesehatanNumber: f.kesehatanNumber?.trim() || null,
    kesehatanClass: Number.isInteger(kelas) && kelas > 0 ? kelas : null,
    kesehatanRegisteredDate: f.kesehatanRegisteredDate || null,
    ketenagakerjaanNumber: f.ketenagakerjaanNumber?.trim() || null,
    ketenagakerjaanRegisteredDate: f.ketenagakerjaanRegisteredDate || null,
    notes: f.notes?.trim() || null,
  };

  try {
    if (hasBpjs.value) {
      const res = await editBpjs({ id: Number(bpjs.value.id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeBpjs?.data) throw new Error("Gagal menyimpan data BPJS");
    } else {
      const res = await createBpjs({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeBpjs?.data) throw new Error("Gagal menyimpan data BPJS");
    }
    toast.success("Data BPJS berhasil disimpan");
    modalOpen.value = false;
    emit("saved");
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan data BPJS. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
            <ShieldCheckIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">BPJS</h2>
            <p class="text-[11.5px] text-slate-400">Kesehatan &amp; Ketenagakerjaan</p>
          </div>
        </div>

        <button
          v-if="hasBpjs ? canEdit : canCreate"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
          @click="openForm"
        >
          <component :is="hasBpjs ? PencilSquareIcon : PlusIcon" class="h-4 w-4" />
          {{ hasBpjs ? "Edit" : "Tambah" }}
        </button>
      </div>

      <div class="p-5">
        <!-- Kosong -->
        <div v-if="!hasBpjs" class="py-12 text-center text-sm text-slate-400">
          Belum ada data BPJS untuk karyawan ini.
        </div>

        <!-- Detail -->
        <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="rounded-xl border border-mahir-border p-4">
            <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Kesehatan</div>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Nomor</dt>
                <dd class="font-medium text-slate-700">{{ bpjs.kesehatanNumber || "-" }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Kelas</dt>
                <dd class="font-medium text-slate-700">{{ bpjs.kesehatanClass ? `Kelas ${bpjs.kesehatanClass}` : "-" }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Tgl Terdaftar</dt>
                <dd class="font-medium text-slate-700">{{ bpjs.kesehatanRegisteredDate ? formatDate(bpjs.kesehatanRegisteredDate) : "-" }}</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-xl border border-mahir-border p-4">
            <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Ketenagakerjaan</div>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Nomor</dt>
                <dd class="font-medium text-slate-700">{{ bpjs.ketenagakerjaanNumber || "-" }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-400">Tgl Terdaftar</dt>
                <dd class="font-medium text-slate-700">{{ bpjs.ketenagakerjaanRegisteredDate ? formatDate(bpjs.ketenagakerjaanRegisteredDate) : "-" }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="bpjs.notes" class="md:col-span-2 text-[13px] text-slate-500">
            <span class="font-medium text-slate-600">Catatan:</span> {{ bpjs.notes }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal tambah / edit BPJS -->
    <BaseModal
      :open="modalOpen"
      :title="hasBpjs ? 'Edit Data BPJS' : 'Tambah Data BPJS'"
      size="lg"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="space-y-5">
        <div>
          <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Kesehatan</div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label :class="labelCls">Nomor Kesehatan</label>
              <input v-model="form.kesehatanNumber" type="text" :class="fieldCls" placeholder="Nomor BPJS Kesehatan" />
            </div>
            <div>
              <label :class="labelCls">Kelas</label>
              <select v-model="form.kesehatanClass" :class="fieldCls">
                <option value="">—</option>
                <option v-for="k in KESEHATAN_CLASSES" :key="k" :value="k">Kelas {{ k }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label :class="labelCls">Tanggal Terdaftar</label>
              <input v-model="form.kesehatanRegisteredDate" type="date" :class="fieldCls" />
            </div>
          </div>
        </div>

        <div>
          <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Ketenagakerjaan</div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label :class="labelCls">Nomor Ketenagakerjaan</label>
              <input v-model="form.ketenagakerjaanNumber" type="text" :class="fieldCls" placeholder="Nomor BPJS Ketenagakerjaan" />
            </div>
            <div>
              <label :class="labelCls">Tanggal Terdaftar</label>
              <input v-model="form.ketenagakerjaanRegisteredDate" type="date" :class="fieldCls" />
            </div>
          </div>
        </div>

        <div>
          <label :class="labelCls">Catatan</label>
          <textarea v-model="form.notes" rows="2" :class="fieldCls" placeholder="Opsional"></textarea>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
